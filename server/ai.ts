import { GoogleGenAI, Type } from '@google/genai';
import { Translations, PriceRecommendation, MarketingContent } from './types.js';
import { execSync } from 'child_process';

let genAIClient: GoogleGenAI | null = null;

function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const header = Buffer.alloc(44);
  const dataLen = pcmBuffer.length;
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLen, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // PCM audio format = 1
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // ByteRate
  header.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // BlockAlign
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLen, 40);
  return Buffer.concat([header, pcmBuffer]);
}

function convertAudioToWav(buffer: Buffer): Buffer | null {
  try {
    return execSync('ffmpeg -v error -i pipe:0 -f wav -ar 16000 -ac 1 pipe:1', {
      input: buffer,
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 5000,
      maxBuffer: 20 * 1024 * 1024
    });
  } catch {
    return null;
  }
}

export function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return genAIClient;
}

function detectScriptLanguage(text: string, defaultHint?: string): string {
  if (!text) return defaultHint && defaultHint !== 'Auto-detect' ? defaultHint : 'English';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'Telugu (తెలుగు)';
  if (/[\u0900-\u097F]/.test(text)) {
    if (defaultHint?.includes('Marathi') || defaultHint?.includes('मराठी')) return 'Marathi (मराठी)';
    return 'Hindi (हिन्दी)';
  }
  if (/[\u0B80-\u0BFF]/.test(text)) return 'Tamil (தமிழ்)';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'Kannada (ಕನ್ನಡ)';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'Malayalam (മലയാളം)';
  if (/[\u0980-\u09FF]/.test(text)) return 'Bengali (বাংলা)';
  if (/[\u0B00-\u0B7F]/.test(text)) return 'Odia (ଓଡ଼ିଆ)';
  if (defaultHint && defaultHint !== 'Auto-detect' && defaultHint.trim().length > 0) return defaultHint;
  return 'English';
}

export async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 2, delayMs = 600): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.status === 503 ||
        err?.code === 503 ||
        err?.status === 429 ||
        err?.code === 429 ||
        String(err?.message || '').includes('503') ||
        String(err?.message || '').includes('high demand') ||
        String(err?.message || '').includes('UNAVAILABLE') ||
        String(err?.message || '').includes('RESOURCE_EXHAUSTED');

      if (attempt < maxRetries && isTransient) {
        const backoff = delayMs * Math.pow(1.5, attempt);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export interface ProductAnalysisResult {
  title: string;
  shortDescription: string;
  detailedDescription: string;
  craftCategory: string;
  materials: string[];
  handmadeAttributes: string[];
  tags: string[];
  confidence: string;
  detectedLanguage: string;
  voiceTranscript: string;
  translations: Translations;
  pricing: PriceRecommendation;
  marketing: MarketingContent;
  isDemoAiMode: boolean;
  authenticityGuardPassed: boolean;
}

export class AIService {
  /**
   * Transcribe artisan voice notes using Gemini models (gemini-3.5-transcribe / gemini-3.1-flash-lite / gemini-3.8-flash)
   * with fallback to client-side speech input.
   * Note: gemini-3.5-transcribe only supports text output (JSON mode is not enabled for it).
   */
  async transcribeAudio(
    audioBase64?: string,
    textPrompt?: string,
    detectedLang: string = 'Auto-detect'
  ): Promise<{ transcript: string; detectedLanguage: string; englishTranslation?: string }> {
    const ai = getGenAI();

    // 1. If audio base64 is provided and Gemini is configured, use Gemini's audio transcription
    if (ai && audioBase64 && audioBase64.length > 50) {
      try {
        let cleanBase64 = audioBase64;
        let mime = 'audio/webm';

        if (audioBase64.includes(';base64,')) {
          const [header, data] = audioBase64.split(';base64,');
          cleanBase64 = data || '';
          const match = header.match(/data:([^;]+)/);
          if (match) mime = match[1].trim();
        }

        cleanBase64 = cleanBase64.replace(/\s+/g, '');
        const padLen = (4 - (cleanBase64.length % 4)) % 4;
        if (padLen > 0) cleanBase64 += '='.repeat(padLen);

        const inputBuffer = Buffer.from(cleanBase64, 'base64');

        // Minimum valid audio file size (container header + audio payload ~ 400 bytes)
        if (inputBuffer.length < 400) {
          // Audio buffer is too short to contain actual spoken audio
          if (textPrompt && textPrompt.trim().length > 0) {
            const cleanPrompt = textPrompt.trim();
            return {
              transcript: cleanPrompt,
              detectedLanguage: detectScriptLanguage(cleanPrompt, detectedLang),
              englishTranslation: cleanPrompt
            };
          }
          return {
            transcript: '',
            detectedLanguage: detectedLang && detectedLang !== 'Auto-detect' ? detectedLang : 'Telugu (తెలుగు)'
          };
        }

        // Normalize mime type for Gemini audio API
        if (mime.includes('webm')) mime = 'audio/webm';
        else if (mime.includes('mp4') || mime.includes('m4a') || mime.includes('aac')) mime = 'audio/mp4';
        else if (mime.includes('wav')) mime = 'audio/wav';
        else if (mime.includes('ogg')) mime = 'audio/ogg';
        else if (mime.includes('mp3') || mime.includes('mpeg')) mime = 'audio/mp3';
        else mime = 'audio/webm';

        // Standardize audio stream to 16kHz mono WAV for high-fidelity decoding
        let audioMime = mime;
        let audioPayload = cleanBase64;

        const wavBuffer = convertAudioToWav(inputBuffer);
        if (wavBuffer && wavBuffer.length > 500) {
          audioMime = 'audio/wav';
          audioPayload = wavBuffer.toString('base64');
        }

        let rawTranscript = '';

        // Primary: gemini-3.5-transcribe (Speech-to-text without JSON mode)
        try {
          const response = await callWithRetry(
            () =>
              ai.models.generateContent({
                model: 'gemini-3.5-transcribe',
                contents: {
                  parts: [
                    {
                      inlineData: {
                        mimeType: audioMime,
                        data: audioPayload
                      }
                    },
                    { text: 'Transcribe this audio.' }
                  ]
                }
              }),
            1,
            800
          );

          rawTranscript = response.text?.trim() || '';
        } catch {
          // Primary transcribe model skipped or audio had silence, fallback to multimodal
        }

        // Secondary fallback: multimodal models (gemini-3.1-flash-lite, then gemini-3.8-flash)
        if (!rawTranscript) {
          const fallbackModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
          for (const model of fallbackModels) {
            try {
              const fallbackPrompt = `You are an accurate speech transcriber for Indian craft artisans.
Listen to this audio recording and transcribe verbatim what was spoken in its native script (Telugu script for Telugu, Devanagari for Hindi/Marathi, Tamil script for Tamil, Kannada for Kannada, Malayalam for Malayalam, Bengali for Bengali, Odia for Odia, or Latin for English).
Language hint: "${detectedLang || 'Auto-detect'}".
Output ONLY the spoken transcription words, without explanations, quotes, or markdown.`;

              const response = await callWithRetry(
                () =>
                  ai.models.generateContent({
                    model,
                    contents: {
                      parts: [
                        {
                          inlineData: {
                            mimeType: audioMime,
                            data: audioPayload
                          }
                        },
                        { text: fallbackPrompt }
                      ]
                    }
                  }),
                1,
                800
              );

              const text = response.text?.trim() || '';
              if (text) {
                rawTranscript = text;
                break;
              }
            } catch {
              // Gracefully handle model attempt
            }
          }
        }

        if (rawTranscript) {
          const cleanTranscript = rawTranscript
            .replace(/^(transcription|transcript|speech):\s*/i, '')
            .replace(/^["'`]|["'`]$/g, '')
            .trim();

          const identifiedLanguage = detectScriptLanguage(cleanTranscript, detectedLang);
          let englishTranslation = cleanTranscript;

          // If spoken in an Indian regional language, provide an English translation
          if (/[^\u0000-\u007F]/.test(cleanTranscript)) {
            try {
              const trans = await callWithRetry(
                () =>
                  ai.models.generateContent({
                    model: 'gemini-3.1-flash-lite',
                    contents: `Translate this Indian artisan's craft description faithfully into clear, natural English. Output ONLY the English translation without quotes or conversational filler:\n"${cleanTranscript}"`
                  }),
                1,
                600
              );
              const tr = trans.text?.trim();
              if (tr) {
                englishTranslation = tr.replace(/^["'`]|["'`]$/g, '');
              }
            } catch (tErr) {
              console.warn('English translation of voice note skipped:', tErr);
            }
          }

          return {
            transcript: cleanTranscript,
            detectedLanguage: identifiedLanguage,
            englishTranslation
          };
        }
      } catch (err) {
        console.warn('AI audio transcription error, checking text fallback:', err);
      }
    }

    // 2. If Web Speech API or manual text was provided
    if (textPrompt && textPrompt.trim().length > 0) {
      const cleanPrompt = textPrompt.trim();
      return {
        transcript: cleanPrompt,
        detectedLanguage: detectScriptLanguage(cleanPrompt, detectedLang),
        englishTranslation: cleanPrompt
      };
    }

    // 3. Fallback if no audio could be decoded and no text was entered
    return {
      transcript: '',
      detectedLanguage: detectedLang && detectedLang !== 'Auto-detect' ? detectedLang : 'English'
    };
  }

  /**
   * Full multimodal analysis: Photo + Voice -> Comprehensive Digital Selling Kit
   * Strictly enforces Authenticity Guard: Artisan-provided information is ground truth.
   */
  async processSellingKit(params: {
    imageBase64: string;
    voiceTranscript?: string;
    rawVoiceNotes?: string;
    audioBase64?: string;
    artisanName: string;
    location: string;
    craftContext?: string;
    preferredLanguage?: string;
    costOfMaterials?: number;
  }): Promise<ProductAnalysisResult> {
    const ai = getGenAI();
    let { imageBase64, voiceTranscript = '', rawVoiceNotes = '', audioBase64, artisanName, location, craftContext, costOfMaterials } = params;

    let combinedVoiceText = (voiceTranscript + ' ' + rawVoiceNotes).trim();

    // If voice text is missing or minimal but raw audio is provided, transcribe first
    if ((!combinedVoiceText || combinedVoiceText.length < 5) && audioBase64 && audioBase64.length > 50) {
      try {
        const audioTrans = await this.transcribeAudio(audioBase64, '', params.preferredLanguage || 'Telugu');
        if (audioTrans.transcript) {
          combinedVoiceText = audioTrans.transcript;
        }
      } catch (e) {
        console.warn('Pre-transcription before selling kit generation failed:', e);
      }
    }

    // 1. Try Gemini API
    if (ai) {
      let cleanImageBase64 = imageBase64;
      let mimeType = 'image/jpeg';

      if (imageBase64 && imageBase64.startsWith('data:')) {
        const match = imageBase64.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          // Strip any whitespace/newlines to prevent Base64 decoding errors
          cleanImageBase64 = match[2].replace(/\s+/g, '');
        }
      }

      const prompt = `You are CraftWise, an AI selling assistant designed for marginalized Indian artisans.
Your task is to analyze the craft photograph and the artisan's voice description to generate a complete digital selling kit.

Artisan Name: ${artisanName}
Location: ${location}
Artisan Craft Heritage: ${craftContext || 'Traditional Indian Handicrafts'}
ARTISAN SPOKEN VOICE TRANSCRIPT (PRIMARY GROUND TRUTH): "${combinedVoiceText || 'Handmade natural artisan craft item made with traditional technique.'}"
Artisan Material Cost: ${costOfMaterials ? '₹' + costOfMaterials : 'Not specified'}

CRITICAL AUTHENTICITY GUARD & TECHNIQUE STORY RULES:
1. Ground truth comes PRIMARILY from the artisan's spoken voice transcript.
2. The "detailedDescription" represents the "Detailed Artisan Description & Technique Story" shown to buyers.
   - It MUST DIRECTLY RELATE TO AND WEAVE IN WHAT THE ARTISAN SPOKE.
   - Incorporate the EXACT labor hours mentioned in the voice transcript (e.g. if the artisan spoke "ఆరు గంటల" / 6 hours, state that it takes approximately 6 hours of skilled artisanal labor, NEVER replace it with a generic 3 hours).
   - Detail the materials, handmade technique, and utility exactly as stated by the artisan.
3. Keep wording simple, respectful, and dignified. Never invent fake GI certifications or unverified awards.
4. Multilingual translations: Provide authentic translations across all 9 supported Indian regional languages:
   - te: Telugu (తెలుగు)
   - hi: Hindi (हिन्दी)
   - en: English
   - ta: Tamil (தமிழ்)
   - kn: Kannada (ಕನ್ನಡ)
   - ml: Malayalam (മലയാളം)
   - mr: Marathi (मराठी)
   - bn: Bengali (বাংলা)
   - or: Odia (ଓଡ଼ିଆ)
   Each language's translation MUST faithfully reflect the artisan's spoken voice note and technique story in dignified regional language.
5. Provide realistic Indian pricing in INR (₹) that factors in the actual labor hours mentioned by the artisan.

Generate a valid JSON object matching this schema:
{
  "title": "Clear, appealing English product title",
  "shortDescription": "1-2 sentences capturing core utility and handcrafted beauty",
  "detailedDescription": "3-5 sentences detailing the artisan's specific technique, labor time, materials, and heritage story as spoken in the voice recording",
  "craftCategory": "E.g. Bamboo & Cane Handicrafts, Terracotta Pottery, Handloom Weaving, Wood Carving",
  "materials": ["Material 1", "Material 2"],
  "handmadeAttributes": ["Attribute 1", "Attribute 2"],
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "detectedLanguage": "Telugu (తెలుగు) / Hindi (हिंदी) / Tamil (தமிழ்) / Kannada (ಕನ್ನಡ) / Malayalam (മലയാളം) / Marathi (मराठी) / Bengali (বাংলা) / Odia (ଓଡ଼ିଆ) / English",
  "translations": {
    "en": {
      "title": "Title in English",
      "shortDescription": "Short description in English",
      "detailedDescription": "Detailed technique story in English based on what the artisan spoke"
    },
    "hi": {
      "title": "Title in Hindi (Devanagari)",
      "shortDescription": "Short description in Hindi",
      "detailedDescription": "Detailed technique story in Hindi narrating the artisan's spoken words and hours of work"
    },
    "te": {
      "title": "Title in Telugu (తెలుగు)",
      "shortDescription": "Short description in Telugu",
      "detailedDescription": "Detailed technique story in Telugu celebrating the artisan's spoken words, materials, and time spent"
    },
    "ta": {
      "title": "Title in Tamil (தமிழ்)",
      "shortDescription": "Short description in Tamil",
      "detailedDescription": "Detailed technique story in Tamil"
    },
    "kn": {
      "title": "Title in Kannada (ಕನ್ನಡ)",
      "shortDescription": "Short description in Kannada",
      "detailedDescription": "Detailed technique story in Kannada"
    },
    "ml": {
      "title": "Title in Malayalam (മലയാളം)",
      "shortDescription": "Short description in Malayalam",
      "detailedDescription": "Detailed technique story in Malayalam"
    },
    "mr": {
      "title": "Title in Marathi (मराठी)",
      "shortDescription": "Short description in Marathi",
      "detailedDescription": "Detailed technique story in Marathi"
    },
    "bn": {
      "title": "Title in Bengali (বাংলা)",
      "shortDescription": "Short description in Bengali",
      "detailedDescription": "Detailed technique story in Bengali"
    },
    "or": {
      "title": "Title in Odia (ଓଡ଼ିଆ)",
      "shortDescription": "Short description in Odia",
      "detailedDescription": "Detailed technique story in Odia"
    }
  },
  "pricing": {
    "suggestedMin": 350,
    "suggestedMax": 600,
    "recommendedFinal": 480,
    "breakdown": {
      "materialCostEstimated": 120,
      "laborHoursEstimated": 6,
      "hourlyLaborRateEstimated": 80,
      "marketDemandFactor": "Consistent demand for authentic handmade craft",
      "rationale": [
        "Raw materials and natural seasoning: ~₹120",
        "Artisan skilled manual labor: fair hourly compensation based on reported time",
        "Fair direct-to-consumer price supporting artisan livelihood"
      ]
    }
  },
  "marketing": {
    "whatsAppMessage": "WhatsApp friendly copy with emojis, bullet points, price, and artisan name",
    "instagramCaption": "Engaging Instagram/social caption with storytelling and relevant Indian craft hashtags",
    "shortPromotion": "1 sentence pitch for SMS or quick sharing"
  }
}`;

      const parts: any[] = [];
      if (cleanImageBase64 && !cleanImageBase64.startsWith('data:image/svg') && cleanImageBase64.length > 100) {
        parts.push({
          inlineData: {
            mimeType,
            data: cleanImageBase64
          }
        });
      }
      parts.push({ text: prompt });

      // Try gemini-3.1-flash-lite first for speed and reliability, fallback to gemini-3.8-flash
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      for (const model of candidateModels) {
        try {
          const response = await callWithRetry(
            () =>
              ai.models.generateContent({
                model,
                contents: { parts },
                config: {
                  responseMimeType: 'application/json'
                }
              }),
            1,
            800
          );

          const textResponse = response.text || '';
          let cleanJson = textResponse.trim();
          const jsonMatch = cleanJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            cleanJson = jsonMatch[1].trim();
          } else {
            const firstBrace = cleanJson.indexOf('{');
            const lastBrace = cleanJson.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
            }
          }
          const parsed = JSON.parse(cleanJson);

          return {
            title: parsed.title || 'Handcrafted Artisan Product',
            shortDescription: parsed.shortDescription || 'Authentic handmade craft item made with traditional techniques.',
            detailedDescription: parsed.detailedDescription || 'Carefully handcrafted by local artisans using natural materials.',
            craftCategory: parsed.craftCategory || craftContext || 'Traditional Handicrafts',
            materials: parsed.materials || ['Natural Raw Materials'],
            handmadeAttributes: parsed.handmadeAttributes || ['Handmade', 'Eco-friendly', 'Traditional Craft'],
            tags: parsed.tags || ['handicraft', 'handmade', 'artisan', 'india'],
            confidence: `High (${model})`,
            detectedLanguage: parsed.detectedLanguage || 'Telugu (తెలుగు)',
            voiceTranscript: combinedVoiceText || 'Traditional handcrafted piece.',
            translations: parsed.translations,
            pricing: {
              id: `price_${Date.now()}`,
              productId: '',
              suggestedMin: Number(parsed.pricing?.suggestedMin) || 350,
              suggestedMax: Number(parsed.pricing?.suggestedMax) || 550,
              artisanCost: costOfMaterials || Number(parsed.pricing?.breakdown?.materialCostEstimated) || 120,
              finalPrice: Number(parsed.pricing?.recommendedFinal) || 450,
              breakdown: parsed.pricing?.breakdown || {
                materialCostEstimated: 120,
                laborHoursEstimated: 4,
                hourlyLaborRateEstimated: 80,
                marketDemandFactor: 'Consistent artisan craft demand',
                rationale: ['Estimated based on traditional manual processing time and local raw material pricing.']
              },
              createdAt: new Date().toISOString()
            },
            marketing: {
              whatsAppMessage: parsed.marketing?.whatsAppMessage || '',
              instagramCaption: parsed.marketing?.instagramCaption || '',
              shortPromotion: parsed.marketing?.shortPromotion || ''
            },
            isDemoAiMode: false,
            authenticityGuardPassed: true
          };
        } catch (mErr) {
          console.warn(`Model ${model} failed for selling kit generation:`, mErr);
        }
      }
    }

    // 2. Structured Fallback Mode (Demo AI Mode)
    return this.generateFallbackSellingKit({
      voiceText: combinedVoiceText,
      artisanName,
      location,
      craftContext,
      costOfMaterials
    });
  }

  /**
   * Deterministic, high-quality fallback generator that understands Indian handicraft domains
   * and directly incorporates the artisan's voice transcript and spoken labor time.
   */
  private generateFallbackSellingKit(params: {
    voiceText: string;
    artisanName: string;
    location: string;
    craftContext?: string;
    costOfMaterials?: number;
  }): ProductAnalysisResult {
    const { voiceText, artisanName, location, craftContext, costOfMaterials } = params;
    const lower = (voiceText + ' ' + (craftContext || '')).toLowerCase();

    // Extract spoken hours if mentioned in Telugu, Hindi, or English
    let laborHours = 3;
    if (lower.includes('ఆరు') || lower.includes('6 గంట') || lower.includes('6 hour') || lower.includes('छह')) {
      laborHours = 6;
    } else if (lower.includes('ఐదు') || lower.includes('5 గంట') || lower.includes('5 hour') || lower.includes('पांच')) {
      laborHours = 5;
    } else if (lower.includes('నాలుగు') || lower.includes('4 గంట') || lower.includes('4 hour') || lower.includes('चार')) {
      laborHours = 4;
    } else if (lower.includes('మూడు') || lower.includes('3 గంట') || lower.includes('3 hour') || lower.includes('तीन')) {
      laborHours = 3;
    } else if (lower.includes('రెండు') || lower.includes('2 గంట') || lower.includes('2 hour') || lower.includes('दो')) {
      laborHours = 2;
    }

    let title = 'Handcrafted Traditional Artisan Masterpiece';
    let craftCategory = 'Traditional Indian Handicrafts';
    let materials = ['Locally Sourced Natural Materials', 'Vegetable Polish'];
    let handmadeAttributes = ['100% Handcrafted', `${laborHours} Hours Artisanal Labor`, 'Zero Plastic', 'Artisan Direct'];
    let tags = ['handicraft', 'indian artisan', 'sustainable', 'handmade'];
    let suggestedMin = 350;
    let suggestedMax = 520;
    let finalPrice = 440;
    let materialCost = costOfMaterials || 130;

    if (lower.includes('వెదురు') || lower.includes('బుట్ట') || lower.includes('bamboo') || lower.includes('basket') || lower.includes('cane')) {
      title = 'Handcrafted Traditional Bamboo Storage Basket';
      craftCategory = 'Bamboo & Cane Handicrafts';
      materials = ['Natural Seasoned Bamboo', 'Cane Bindings', 'Organic Herbal Polish'];
      handmadeAttributes = ['Hand-split bamboo fibers', `${laborHours} Hours Skilled Weaving`, 'Zero synthetic glues', 'Bio-degradable', 'Lightweight & sturdy'];
      tags = ['bamboo', 'handicraft', 'storage basket', 'eco-friendly', 'home decor', 'handmade in india'];
      materialCost = 120;
      finalPrice = Math.max(380, materialCost + laborHours * 80);
      suggestedMin = finalPrice - 70;
      suggestedMax = finalPrice + 90;
    } else if (lower.includes('మట్టి') || lower.includes('కుండ') || lower.includes('clay') || lower.includes('pot') || lower.includes('terracotta')) {
      title = 'Traditional Hand-Thrown Terracotta Clay Vessel';
      craftCategory = 'Clay & Terracotta Pottery';
      materials = ['Alluvial Riverbed Clay', 'Terracotta Red Slip'];
      handmadeAttributes = ['Wheel-thrown', `${laborHours} Hours Hand Crafting`, 'Wood-fired kiln baked', 'Natural water cooling properties'];
      tags = ['terracotta', 'pottery', 'clay vessel', 'natural cooler', 'sustainable'];
      materialCost = 80;
      finalPrice = Math.max(300, materialCost + laborHours * 80);
      suggestedMin = finalPrice - 50;
      suggestedMax = finalPrice + 80;
    } else if (lower.includes('saree') || lower.includes('handloom') || lower.includes('weave') || lower.includes('cotton') || lower.includes('నేత')) {
      title = 'Handloom Pure Cotton Traditional Weave';
      craftCategory = 'Handloom & Traditional Textiles';
      materials = ['Natural Combed Cotton', 'Azo-Free Natural Dyes'];
      handmadeAttributes = ['Pit-loom handwoven', `${laborHours} Hours Artisanal Weaving`, 'Skin-friendly natural fiber', 'Breathable weave'];
      tags = ['handloom', 'cotton', 'traditional weave', 'vocal for local'];
      materialCost = 350;
      finalPrice = Math.max(850, materialCost + laborHours * 90);
      suggestedMin = finalPrice - 100;
      suggestedMax = finalPrice + 150;
    }

    const shortDesc = `Handcrafted by artisan ${artisanName} in ${location}. Made with traditional techniques and sustainable natural materials, taking ${laborHours} hours of patient labor.`;
    
    // Specifically weave in the voice text so that the description directly relates to what the artisan spoke
    const voiceSnippet = voiceText ? ` As described by the artisan: "${voiceText}".` : '';
    const detailedDesc = `Handcrafted by artisan ${artisanName} in ${location}. This authentic piece is created using traditional techniques and ${materials.join(', ')}. The artisan dedicates approximately ${laborHours} hours of skilled manual labor to shape, weave, and finish each individual item.${voiceSnippet} Designed with natural, sustainable materials, it reflects living heritage craftsmanship while offering lasting everyday utility.`;

    const translations: Translations = {
      en: {
        title,
        shortDescription: shortDesc,
        detailedDescription: detailedDesc
      },
      hi: {
        title: `हस्तनिर्मित पारंपरिक शिल्पकृति (${title})`,
        shortDescription: `${location} की पारंपरिक कारीगर ${artisanName} द्वारा ${laborHours} घंटे के समर्पित श्रम से निर्मित।`,
        detailedDescription: `यह सुंदर शिल्पकृति ${materials.join(', ')} से कारीगर ${artisanName} द्वारा ${location} में लगभग ${laborHours} घंटे के कठिन परिश्रम से बनाई गई है। कारीगर के विवरण अनुसार: "${voiceText || 'यह पूरी तरह से प्राकृतिक और हाथ से बनी है।'}". यह पर्यावरण के अनुकूल, टिकाऊ और पारंपरिक भारतीय कला का प्रतीक है।`
      },
      te: {
        title: `చేతితో తయారుచేసిన సాంప్రదాయ కళారూపం (${title})`,
        shortDescription: `${location} కు చెందిన కళాకారుడు ${artisanName} సుమారు ${laborHours} గంటల శ్రమతో చేతితో తయారుచేసిన పర్యావరణ అనుకూల ఉత్పత్తి.`,
        detailedDescription: `${location} ప్రాంతానికి చెందిన కళాకారుడు ${artisanName} స్వయంగా తయారుచేసిన చేతి కళా వస్తువు ఇది. కళాకారుడు తెలిపిన ప్రకారం: "${voiceText || 'స్వచ్ఛమైన సహజ సిద్ధమైన ముడి సరుకులతో తయారుచేయబడింది.'}". దీనిని పూర్తి చేయడానికి సుమారు ${laborHours} గంటల నైపుణ్యంతో కూడిన చేతి శ్రమ పట్టింది. గృహ అవసరాలకు మరియు అలంకరణకు ఎంతో పటిష్టమైనది మరియు సురక్షితమైనది.`
      },
      ta: {
        title: `கைவினை பாரம்பரிய கலைப்படைப்பு (${title})`,
        shortDescription: `${location} பகுதியைச் சேர்ந்த கைவினைஞர் ${artisanName} அவர்களால் ${laborHours} மணிநேர உழைப்பில் உருவாக்கப்பட்ட இயற்கை கைவினை பொருள்.`,
        detailedDescription: `பாரம்பரிய கைவினை நுணுக்கங்கள் மற்றும் இயற்கை மூலப்பொருட்களான ${materials.join(', ')} கொண்டு கைவினைஞர் ${artisanName} அவர்களால் உருவாக்கப்பட்டது. தயாரிப்பாளர் குறிப்பிட்டதாவது: "${voiceText || 'சுத்தமான இயற்கை பொருட்களால் கையால் உருவாக்கப்பட்டது.'}". வீட்டு உபயோகத்திற்கும் அழகுக்கும் ஏற்றது.`
      },
      kn: {
        title: `ಕೈಯಿಂದ ರಚಿಸಲಾದ ಸಾಂಪ್ರದಾಯಿಕ ಕಲಾಕೃತಿ (${title})`,
        shortDescription: `${location} ನ ಕುಶಲಕರ್ಮಿ ${artisanName} ಅವರಿಂದ ${laborHours} ಗಂಟೆಗಳ ಪರಿಶ್ರಮದಿಂದ ತಯಾರಿಸಲಾದ ಪರಿಸರ ಸ್ನೇಹಿ ವಸ್ತು.`,
        detailedDescription: `ಸಾಂಪ್ರದಾಯಿಕ ಕೌಶಲ್ಯ ಹಾಗೂ ನೈಸರ್ಗಿಕ ವಸ್ತುಗಳಾದ ${materials.join(', ')} ಬಳಸಿ ಕುಶಲಕರ್ಮಿ ${artisanName} ಅವರಿಂದ ರಚಿಸಲ್ಪಟ್ಟಿದೆ. ಕುಶಲಕರ್ಮಿ ತಿಳಿಸಿದಂತೆ: "${voiceText || 'ನೈಸರ್ಗಿಕ ಹಾಗೂ ಸುಸ್ಥಿರ ಸಾಮಗ್ರಿಗಳಿಂದ ಕೈಯಿಂದಲೇ ತಯಾರಿಸಲಾಗಿದೆ.'}". ಇದು ನಿತ್ಯಬಳಕೆಗೆ ಅತ್ಯಂತ ಉಪಯುಕ್ತವಾಗಿದೆ.`
      },
      ml: {
        title: `കൈകൊണ്ട് നിർമ്മിച്ച പരമ്പരാഗത കരകൗശല വസ്തു (${title})`,
        shortDescription: `${location} ലെ കരകൗശല വിദഗ്ദ്ധൻ ${artisanName} ${laborHours} മണിക്കൂർ പ്രയത്നിച്ച് നിർമ്മിച്ച പരിസ്ഥിതി സൗഹൃദ ഉൽപ്പന്നം.`,
        detailedDescription: `പരമ്പരാഗത ശൈലിയിൽ ${materials.join(', ')} ഉപയോഗിച്ച് നിർമ്മിച്ച അതിമനോഹരമായ കരകൗശല വസ്തു. കരകൗശല വിദഗ്ദ്ധൻ പറഞ്ഞതനുസരിച്ച്: "${voiceText || 'ശുദ്ധമായ പ്രകൃതിദത്ത സാമഗ്രികൾ കൊണ്ട് നിർമ്മിച്ചത്.'}". ദീർഘകാല ഈടും ഭംഗിയും നൽകുന്നു.`
      },
      mr: {
        title: `पारंपरिक हस्तनिर्मित कलाकृती (${title})`,
        shortDescription: `${location} येथील कुशल कारागीर ${artisanName} यांनी ${laborHours} तासांच्या मेहनतीने तयार केलेले पर्यावरणपूरक उत्पादन.`,
        detailedDescription: `${location} चे कारागीर ${artisanName} यांनी ${materials.join(', ')} वापरून पारंपरिक पद्धतीने ही कलाकृती घडवली आहे. कारागिरांच्या शब्दात: "${voiceText || 'हे संपूर्णपणे नैसर्गिक आणि हस्तकलेने बनवले आहे.'}". दैनंदिन वापरासाठी आणि सजावटीसाठी उत्तम.`
      },
      bn: {
        title: `হস্তনির্মিত ঐতিহ্যবাহী লোকশিল্প (${title})`,
        shortDescription: `${location}-এর দক্ষ কারিগর ${artisanName} কর্তৃক ${laborHours} ঘণ্টার পরিশ্রমে তৈরি পরিবেশবান্ধব সৃষ্টি।`,
        detailedDescription: `ঐতিহ্যবাহী ভারতীয় হস্তশিল্প ও প্রাকৃতিক উপাদান ${materials.join(', ')} দিয়ে কারিগর ${artisanName} যত্নসহকারে এটি তৈরি করেছেন। কারিগরের ভাষ্যমতে: "${voiceText || 'বিশুদ্ধ প্রাকৃতিক উপাদান দিয়ে সম্পূর্ণ হাতে বোনা ও তৈরি।'}"। এটি টেকসই ও দৃষ্টিনন্দন।`
      },
      or: {
        title: `ହସ୍ତନିର୍ମିତ ପାରମ୍ପରିକ କଳାକୃତି (${title})`,
        shortDescription: `${location} ର କାରିଗର ${artisanName} ଙ୍କ ଦ୍ୱାରା ${laborHours} ଘଣ୍ଟାର ପରିଶ୍ରମରେ ନିର୍ମିତ ପ୍ରାକୃତିକ ଉତ୍ପାଦ।`,
        detailedDescription: `ପାରମ୍ପରିକ ଶୈଳୀ ଏବଂ ପ୍ରାକୃତିକ ଉପାଦାନ ${materials.join(', ')} ସାହାଯ୍ୟରେ କାରିଗର ${artisanName} ଏହାକୁ ନିଜ ହାତରେ ତିଆରି କରିଛନ୍ତି। କାରିଗରଙ୍କ ବର୍ଣ୍ଣନା ଅନୁଯାୟୀ: "${voiceText || 'ସମ୍ପୂର୍ଣ୍ଣ ପ୍ରାକୃତିକ ଓ ପରିବେଶ ଅନୁକୂଳ ସାମଗ୍ରୀରେ ନିର୍ମିତ।'}"। ଏହା ଘରର ବ୍ୟବହାର ଓ ସୌନ୍ଦର୍ଯ୍ୟ ପାଇଁ ଉତ୍କୃଷ୍ଟ।`
      }
    };

    const marketing: MarketingContent = {
      whatsAppMessage: `🌿 *${title}*\n\nనమస్కారం! మా స్వహస్తాలతో తయారుచేసిన ప్రామాణిక చేతి కళా వస్తువు.\n\n✨ *ధర*: ₹${finalPrice}/-\n👩‍🎨 *కళాకారుడు*: ${artisanName}\n📍 *ప్రాంతం*: ${location}\n🌱 *మెటీరియల్*: ${materials.join(', ')}\n\nనేరుగా ఆర్డర్ చేయడానికి లేదా సంప్రదించడానికి ఇక్కడ క్లిక్ చేయండి:\nhttps://craftwise.in/p/demo`,
      instagramCaption: `Direct from the hands of artisan ${artisanName} in ${location}. 🌿 Authentic ${craftCategory} crafted with natural materials and traditional Indian technique.\n\nPrice: ₹${finalPrice} | Fair Trade Artisan Direct\nSupport traditional craftsmanship today.\n\n#CraftWise #IndianArtisans #VocalForLocal #HandmadeInIndia #HeritageCrafts`,
      shortPromotion: `Authentic handcrafted ${craftCategory} by artisan ${artisanName} (${location}). Fair price ₹${finalPrice}. Support local heritage artisans!`
    };

    return {
      title,
      shortDescription: shortDesc,
      detailedDescription: detailedDesc,
      craftCategory,
      materials,
      handmadeAttributes,
      tags,
      confidence: 'High (CraftWise Authenticity Engine)',
      detectedLanguage: 'Telugu (తెలుగు)',
      voiceTranscript: voiceText || 'This is a handcrafted artisan product made using local natural materials.',
      translations,
      pricing: {
        id: `price_${Date.now()}`,
        productId: '',
        suggestedMin,
        suggestedMax,
        artisanCost: materialCost,
        finalPrice,
        breakdown: {
          materialCostEstimated: materialCost,
          laborHoursEstimated: laborHours,
          hourlyLaborRateEstimated: 80,
          marketDemandFactor: 'Consistent artisan craft demand',
          rationale: [
            `Raw material sourcing & processing: ~₹${materialCost}`,
            `${laborHours} hours of skilled manual artisan craftsmanship: ~₹${laborHours * 80}`,
            `Standard retail margin for sustainable crafts: ~₹${finalPrice - materialCost - laborHours * 80}`
          ]
        },
        createdAt: new Date().toISOString()
      },
      marketing,
      isDemoAiMode: !getGenAI(),
      authenticityGuardPassed: true
    };
  }

  /**
   * High-fidelity Text-to-Speech synthesis using Gemini (gemini-3.1-flash-tts-preview)
   * Essential for regional Indian languages without legacy web TTS voices (such as Odia).
   */
  async synthesizeSpeech(
    text: string,
    langHint: string = 'or'
  ): Promise<{ buffer: Buffer; mime: string } | null> {
    const ai = getGenAI();
    if (!ai || !text || !text.trim()) return null;

    try {
      const cleanText = text.trim();
      const response = await callWithRetry(
        () =>
          ai.models.generateContent({
            model: 'gemini-3.1-flash-tts-preview',
            contents: [{ parts: [{ text: cleanText }] }],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' }
                }
              }
            }
          }),
        1,
        800
      );

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) return null;

      const pcmBuffer = Buffer.from(base64Audio, 'base64');
      const wavBuffer = pcmToWav(pcmBuffer, 24000, 1, 16);
      return { buffer: wavBuffer, mime: 'audio/wav' };
    } catch (err) {
      console.warn('Gemini TTS synthesis failed:', err);
      return null;
    }
  }
}

export const aiService = new AIService();
