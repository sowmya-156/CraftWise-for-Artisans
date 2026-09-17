import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Mic,
  Sparkles,
  Download,
  Check,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Compass,
  Loader2,
  Building2,
  User as UserIcon,
  Phone,
  Package,
  RefreshCw,
  Edit3,
  X,
  FileText
} from 'lucide-react';
import { api, authState } from '../api';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { ProductCardPreview } from '../components/ProductCardPreview';
import { downloadCatalogImage } from '../utils/catalogImageGenerator';
import { SAMPLE_BAMBOO_BASKET_IMAGE, SAMPLE_TERRACOTTA_POT_IMAGE } from '../data/samples';
import { Product, MarketOpportunity } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface AddProductWizardProps {
  onFinishWizard?: (productId: string) => void;
  onCancel: () => void;
  preferredLanguage?: string;
}

export const AddProductWizard: React.FC<AddProductWizardProps> = ({
  onCancel,
  preferredLanguage = 'te'
}) => {
  const { t, language } = useI18n();
  const effectiveLanguage = language || preferredLanguage;

  // View state: 'input' | 'generating' | 'result'
  const [viewState, setViewState] = useState<'input' | 'generating' | 'result'>('input');

  // Artisan Information
  const user = authState.getUser();
  const initialArtisanName =
    user?.fullName && user.fullName !== 'Catalog Image Generator'
      ? user.fullName
      : '';
  const initialArtisanMobile =
    user?.mobile && user.mobile !== '9999900001'
      ? user.mobile
      : '';

  // 1. Artisan Name
  const [artisanName, setArtisanName] = useState<string>(initialArtisanName || 'Lakshmi Bai');

  // 2. Mobile Number
  const [artisanMobile, setArtisanMobile] = useState<string>(initialArtisanMobile || '9876543210');

  // 3. Product Photo
  const [photoData, setPhotoData] = useState<string>(SAMPLE_BAMBOO_BASKET_IMAGE);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 4. Voice Description
  const [voiceTranscript, setVoiceTranscript] = useState<string>(
    'ఇది చేతితో చేసిన వెదురు బుట్ట. సహజమైన విశాఖపట్నం కొండ వెదురుతో అల్లినది. పండ్లు మరియు పూజ సామాగ్రి కోసం దృఢమైనది.'
  );
  const [voiceAudioBase64, setVoiceAudioBase64] = useState<string | undefined>(undefined);
  const [detectedVoiceLang, setDetectedVoiceLang] = useState<string>('Telugu (తెలుగు)');

  // Output State
  const [generatedProduct, setGeneratedProduct] = useState<Product | null>(null);
  const [marketOpportunities, setMarketOpportunities] = useState<MarketOpportunity[]>([]);
  const [generatingStepText, setGeneratingStepText] = useState<string>('Analyzing craft photo...');
  const [downloadingPicture, setDownloadingPicture] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Camera helpers
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access unavailable:', err);
      setIsCameraActive(false);
      alert('Camera access could not be opened. You can select a photo from files or use the sample photo.');
    }
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 800;
    canvas.height = videoRef.current.videoHeight || 800;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPhotoData(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Generation Handler
  const handleGenerate = async () => {
    if (!photoData) {
      alert('Please upload or choose a product photo.');
      return;
    }
    if (!artisanName.trim()) {
      alert('Please enter the artisan name.');
      return;
    }
    if (!artisanMobile.trim()) {
      alert('Please enter your mobile number.');
      return;
    }

    setViewState('generating');
    setErrorMessage(null);

    try {
      // 1. Create draft product
      setGeneratingStepText('Registering artisan craft details...');
      const draft = await api.createProduct({
        title: 'Handcrafted Artisan Craft',
        primaryImage: photoData,
        voiceTranscript: voiceTranscript || 'Handcrafted heritage artisan item',
        detectedLanguage: detectedVoiceLang,
        artisanName: artisanName.trim(),
        artisanMobile: artisanMobile.trim()
      });

      const prodId = draft.product.id;

      // 2. Process AI (craft identification, materials, and flyer metadata)
      setGeneratingStepText('Enhancing photo and generating catalog image flyer...');
      const aiRes = await api.processProductAI(prodId, {
        imageBase64: photoData,
        voiceTranscript: voiceTranscript,
        audioBase64: voiceAudioBase64,
        costOfMaterials: 150
      });

      const finalProduct: Product = {
        ...aiRes.product,
        artisanName: artisanName.trim(),
        artisanMobile: artisanMobile.trim()
      };

      setGeneratedProduct(finalProduct);

      // 3. Fetch Market Linkages based on the product
      setGeneratingStepText('Analyzing institutional buyers and official market linkages...');
      try {
        const marketRes = await api.getMarketRecommendations({
          craftType: finalProduct.craftCategory,
          category: finalProduct.craftCategory,
          productId: finalProduct.id
        });
        setMarketOpportunities(marketRes.recommendations || []);
      } catch (mErr) {
        console.warn('Market linkage fetch fallback:', mErr);
      }

      setViewState('result');
    } catch (err: any) {
      console.error('Generation failed:', err);
      setErrorMessage(err.message || 'Failed to generate catalog image. Please try again.');
      setViewState('input');
    }
  };

  // Download flyer picture handler
  const handleDownloadPicture = async () => {
    if (!generatedProduct) return;
    setDownloadingPicture(true);
    try {
      await downloadCatalogImage(
        generatedProduct,
        artisanName.trim() || 'Artisan',
        'India',
        {
          artisanPhone: artisanMobile.trim()
        }
      );
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download picture. Please try again.');
    } finally {
      setDownloadingPicture(false);
    }
  };

  // Download GeM specification JSON
  const handleDownloadGeMSpec = (opp: MarketOpportunity) => {
    if (!generatedProduct) return;
    const data = JSON.stringify(
      {
        portal: opp.name,
        catalogExportDate: new Date().toISOString(),
        productTitle: generatedProduct.title,
        craftCategory: generatedProduct.craftCategory,
        artisanName: artisanName,
        artisanMobile: artisanMobile,
        materials: generatedProduct.materials,
        complianceStatus: 'VERIFIED_HANDMADE_ARTISAN'
      },
      null,
      2
    );
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Catalog_Market_Linkage_${opp.name.replace(/[^a-zA-Z0-9]+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================================
  // RENDER: GENERATING LOADING VIEW
  // ============================================================
  if (viewState === 'generating') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#2D241E] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E5E1DA] shadow-xl text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-[#C05D4D]/20 animate-ping"></div>
            <div className="w-20 h-20 rounded-full border-4 border-[#C05D4D] border-t-transparent animate-spin flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#C05D4D]" />
            </div>
          </div>

          <div>
            <h2 className="font-serif italic text-2xl font-bold text-[#4A3728]">
              Generating Catalog Image
            </h2>
            <p className="text-sm font-semibold text-[#C05D4D] mt-2 animate-pulse">
              {generatingStepText}
            </p>
            <p className="text-xs text-[#7C6E62] mt-2">
              Preparing your flyer with your artisan name, mobile number, and matching institutional market linkages.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#E5E1DA] text-left text-xs space-y-1.5 text-[#5A4839]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Artisan: <strong>{artisanName}</strong> ({artisanMobile})</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Heritage Craft: <strong>Handmade Artisan Item</strong></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: COMPLETED RESULT VIEW (CATALOG IMAGE + MARKET LINKAGE)
  // ============================================================
  if (viewState === 'result' && generatedProduct) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#2D241E] pb-24">
        {/* Header Bar */}
        <div className="bg-[#2D241E] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-[#3E3229]">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C05D4D]/20 text-orange-200 text-xs font-bold uppercase tracking-wider mb-2 border border-[#C05D4D]/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Catalog Image & Market Linkage Generated
              </div>
              <h1 className="font-serif italic text-2xl sm:text-3xl font-bold">
                Your Catalog Image & Market Linkage
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 mt-1">
                Your high-resolution catalog flyer is ready to download, along with official market linkages matched for your craft.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                id="catalog-edit-inputs-btn"
                onClick={() => setViewState('input')}
                className="px-4 py-2.5 bg-[#3D322B] hover:bg-[#4D3F36] text-stone-200 rounded-xl text-xs sm:text-sm font-bold border border-[#524235] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Details / Create Another</span>
              </button>

              <button
                type="button"
                id="catalog-top-download-btn"
                disabled={downloadingPicture}
                onClick={handleDownloadPicture}
                className="px-6 py-2.5 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {downloadingPicture ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                ) : downloadSuccess ? (
                  <Check className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Download className="w-4 h-4 text-amber-200" />
                )}
                <span>{downloadSuccess ? 'Picture Downloaded!' : 'Download Picture'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
          {/* ============================================================ */}
          {/* 1. GENERATED CATALOG IMAGE SECTION                           */}
          {/* ============================================================ */}
          <section className="bg-white rounded-3xl border border-[#E5E1DA] shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EDEA]">
              <div>
                <span className="text-xs font-bold text-[#C05D4D] uppercase tracking-widest bg-[#C05D4D0D] px-2.5 py-0.5 rounded-md border border-[#C05D4D22]">
                  1. Generated Catalog Image
                </span>
                <h2 className="font-serif italic text-xl sm:text-2xl font-bold text-[#4A3728] mt-1">
                  Product Catalog Flyer
                </h2>
                <p className="text-xs sm:text-sm text-[#7C6E62] mt-0.5">
                  Includes your artisan name, mobile phone number, craft details, and verified authentic artisan signature.
                </p>
              </div>

              <button
                type="button"
                id="catalog-main-download-btn"
                disabled={downloadingPicture}
                onClick={handleDownloadPicture}
                className="px-8 py-3.5 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white rounded-2xl text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer self-start sm:self-auto"
              >
                {downloadingPicture ? (
                  <Loader2 className="w-5 h-5 animate-spin text-amber-200" />
                ) : downloadSuccess ? (
                  <Check className="w-5 h-5 text-emerald-300" />
                ) : (
                  <Download className="w-5 h-5 text-amber-200" />
                )}
                <span>{downloadSuccess ? 'Picture Downloaded!' : 'Download Catalog Picture'}</span>
              </button>
            </div>

            {/* Flyer Preview Stage */}
            <div className="max-w-md mx-auto">
              <ProductCardPreview
                product={generatedProduct}
                artisanName={artisanName.trim() || 'Artisan'}
                artisanPhone={artisanMobile.trim()}
                showDownloadAction={false}
              />
            </div>
          </section>

          {/* ============================================================ */}
          {/* 2. MARKET LINKAGE BASED ON THE PRODUCT                       */}
          {/* ============================================================ */}
          <section className="bg-white rounded-3xl border border-[#E5E1DA] shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
                <Compass className="w-3.5 h-3.5 text-emerald-600" /> Matched to {generatedProduct.craftCategory || 'Your Craft'}
              </div>
              <h2 className="font-serif italic text-xl sm:text-2xl font-bold text-[#4A3728]">
                Market Linkage Based on This Product
              </h2>
              <p className="text-xs sm:text-sm text-[#7C6E62] mt-1 max-w-2xl">
                Verified institutional procurement portals and government buyers actively purchasing <strong>{generatedProduct.craftCategory || 'handcrafted products'}</strong> directly from artisans without middleman fees.
              </p>
            </div>

            {marketOpportunities.length === 0 ? (
              <div className="p-8 text-center text-stone-500 bg-[#FAF9F6] rounded-2xl border border-dashed border-[#E5E1DA]">
                Loading market opportunities...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {marketOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#E5E1DA] hover:border-[#D4A373] transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200 inline-block mb-1.5">
                            {opp.badge || 'Official Linkage'}
                          </span>
                          <h3 className="font-bold text-base text-[#4A3728] leading-snug">
                            {opp.name}
                          </h3>
                          <div className="text-xs text-[#7C6E62] font-semibold mt-0.5">
                            Category: <span className="text-[#C05D4D]">{opp.matchingCategory}</span>
                          </div>
                        </div>

                        <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl px-2.5 py-1 text-center shrink-0">
                          <span className="text-xs font-bold block">{opp.matchScore}%</span>
                          <span className="text-[9px] uppercase font-bold text-emerald-700">Match</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#5A4839] leading-relaxed">
                        {opp.description}
                      </p>

                      {/* Why Recommended */}
                      <div className="p-3 rounded-xl bg-white border border-[#E5E1DA] text-xs space-y-1.5">
                        <span className="font-bold text-[#4A3728] block text-[11px] uppercase tracking-wider">
                          Why Recommended for Your Craft:
                        </span>
                        {opp.whyRecommended.slice(0, 2).map((reason, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-stone-600">
                            <span className="text-emerald-600 font-bold shrink-0">•</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>

                      <div className="text-[11px] text-[#7C6E62]">
                        <strong>Eligibility:</strong> {opp.eligibility}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E5E1DA] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadGeMSpec(opp)}
                        className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-[#D4A373] text-[#4A3728] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Download JSON specifications for this portal"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#C05D4D]" />
                        <span>Export Catalog Spec</span>
                      </button>

                      <a
                        href={opp.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-1.5 bg-[#4A3728] hover:bg-[#3D2C20] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <span>{opp.actionText || 'View Platform'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: INPUT FORM (5 EXACT INPUTS)
  // 1. Artisan Name
  // 2. Mobile Number
  // 3. Stock in Units
  // 4. Product Photo
  // 5. Voice Description
  // ============================================================
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D241E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="bg-white rounded-3xl border border-[#E5E1DA] shadow-xs p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C05D4D]/10 text-[#C05D4D] text-xs font-bold uppercase tracking-wider mb-2 border border-[#C05D4D]/20">
                <Sparkles className="w-3.5 h-3.5" /> Instant Catalog Generator
              </div>
              <h1 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#4A3728]">
                Instant Catalog Image Generator
              </h1>
              <p className="text-xs sm:text-sm text-[#7C6E62] mt-1 max-w-2xl">
                Provide your artisan name, mobile number, product photo, and voice description to generate a ready-to-share catalog image flyer and view verified market linkages.
              </p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="p-2 rounded-xl text-[#7C6E62] hover:text-[#4A3728] hover:bg-[#FAF9F6] cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        {/* The 4-Input Card */}
        <div className="bg-white rounded-3xl border border-[#E5E1DA] shadow-sm p-6 sm:p-8 space-y-8">
          {/* ------------------------------------------------------------ */}
          {/* INPUT 1 & 2: ARTISAN NAME & MOBILE NUMBER                    */}
          {/* ------------------------------------------------------------ */}
          <div>
            <h2 className="text-xs font-bold text-[#C05D4D] uppercase tracking-widest bg-[#C05D4D0D] px-2.5 py-0.5 rounded-md border border-[#C05D4D22] inline-block mb-2">
              Artisan Contact Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {/* 1. Artisan Name */}
              <div>
                <label className="block text-xs font-bold text-[#4A3728] mb-1.5">
                  1. Artisan Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#7C6E62] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="catalog-artisan-name"
                    value={artisanName}
                    onChange={(e) => setArtisanName(e.target.value)}
                    placeholder="e.g. Lakshmi Bai / రమేష్ రావు"
                    className="w-full text-sm font-semibold pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:bg-white focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                  />
                </div>
              </div>

              {/* 2. Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-[#4A3728] mb-1.5">
                  2. Mobile Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#7C6E62] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    id="catalog-artisan-mobile"
                    value={artisanMobile}
                    onChange={(e) => setArtisanMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="e.g. 9876543210"
                    className="w-full text-sm font-semibold pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:bg-white focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* INPUT 3: PRODUCT PHOTO                                       */}
          {/* ------------------------------------------------------------ */}
          <div className="pt-6 border-t border-[#F0EDEA]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xs font-bold text-[#C05D4D] uppercase tracking-widest bg-[#C05D4D0D] px-2.5 py-0.5 rounded-md border border-[#C05D4D22] inline-block">
                  3. Product Photo *
                </h2>
                <p className="text-xs text-[#7C6E62] mt-1">
                  Upload a photo, snap with camera, or select a sample craft.
                </p>
              </div>

              {/* Photo Actions */}
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#F0EDEA] text-[#4A3728] border border-[#E5E1DA] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#C05D4D]" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {!isCameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#F0EDEA] text-[#4A3728] border border-[#E5E1DA] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#C05D4D]" />
                    <span>Camera</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-1.5 bg-stone-200 text-[#4A3728] rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Close Camera
                  </button>
                )}
              </div>
            </div>

            {/* Camera Video Stream Mode */}
            {isCameraActive && (
              <div className="relative aspect-video max-w-md mx-auto bg-black rounded-2xl overflow-hidden shadow-lg border border-[#E5E1DA] mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={captureCameraPhoto}
                    className="px-6 py-2.5 bg-[#C05D4D] hover:bg-[#A34E41] text-white rounded-full font-bold text-xs shadow-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" /> Snap Photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2.5 bg-stone-900/80 text-white rounded-full text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Photo Preview & Samples */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-[#FAF9F6] p-4 rounded-2xl border border-[#E5E1DA]">
              <div className="aspect-square max-h-56 mx-auto bg-white rounded-xl border border-[#E5E1DA] overflow-hidden flex items-center justify-center p-2">
                {photoData ? (
                  <img
                    src={photoData}
                    alt="Selected craft"
                    className="w-full h-full object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center text-xs text-stone-400">
                    No photo selected
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <span className="text-[11px] font-bold text-[#7C6E62] uppercase tracking-wider block">
                  Quick Sample Crafts:
                </span>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoData(SAMPLE_BAMBOO_BASKET_IMAGE);
                      setVoiceTranscript('ఇది చేతితో చేసిన వెదురు బుట్ట. సహజమైన విశాఖపట్నం కొండ వెదురుతో అల్లినది.');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-3 cursor-pointer ${
                      photoData === SAMPLE_BAMBOO_BASKET_IMAGE
                        ? 'bg-amber-50 border-[#C05D4D] text-[#4A3728] font-bold shadow-xs'
                        : 'bg-white border-[#E5E1DA] text-[#5A4839] hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-lg">🧺</span>
                    <div>
                      <div className="font-bold">Handcrafted Bamboo Basket</div>
                      <div className="text-[10px] text-stone-500">Visakhapatnam Natural Cane Craft</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPhotoData(SAMPLE_TERRACOTTA_POT_IMAGE);
                      setVoiceTranscript('ఇది సాంప్రదాయ మట్టి కుండ. సహజసిద్ధమైన మట్టితో చేసిన నీటి పాత్ర. ఆరోగ్యకరమైన చల్లదనాన్ని ఇస్తుంది.');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-3 cursor-pointer ${
                      photoData === SAMPLE_TERRACOTTA_POT_IMAGE
                        ? 'bg-amber-50 border-[#C05D4D] text-[#4A3728] font-bold shadow-xs'
                        : 'bg-white border-[#E5E1DA] text-[#5A4839] hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-lg">🏺</span>
                    <div>
                      <div className="font-bold">Terracotta Water Pot</div>
                      <div className="text-[10px] text-stone-500">Hand-thrown Clay Vessel</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* INPUT 4: VOICE DESCRIPTION                                   */}
          {/* ------------------------------------------------------------ */}
          <div className="pt-6 border-t border-[#F0EDEA] space-y-3">
            <div>
              <h2 className="text-xs font-bold text-[#C05D4D] uppercase tracking-widest bg-[#C05D4D0D] px-2.5 py-0.5 rounded-md border border-[#C05D4D22] inline-block">
                4. Voice Description *
              </h2>
              <p className="text-xs text-[#7C6E62] mt-1">
                Record your voice describing how you make the craft, or edit the transcript below in your language.
              </p>
            </div>

            {/* Voice Recorder Component */}
            <VoiceRecorder
              preferredLanguage={effectiveLanguage}
              initialTranscript={voiceTranscript}
              onTranscriptReady={(transcript, audioBase64, lang) => {
                setVoiceTranscript(transcript);
                if (audioBase64) setVoiceAudioBase64(audioBase64);
                if (lang) setDetectedVoiceLang(lang);
              }}
            />

            {/* Editable Description Textarea */}
            <div>
              <label className="block text-xs font-bold text-[#4A3728] mb-1">
                Description Transcript (Telugu, Hindi, Tamil, English, etc.)
              </label>
              <textarea
                rows={3}
                id="catalog-voice-transcript"
                value={voiceTranscript}
                onChange={(e) => setVoiceTranscript(e.target.value)}
                placeholder="Speak using the microphone above or type craft description..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:bg-white focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D] leading-relaxed"
              />
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* SUBMIT BUTTON: GENERATE CATALOG IMAGE & SHOW MARKET LINKAGE  */}
          {/* ------------------------------------------------------------ */}
          <div className="pt-6 border-t border-[#F0EDEA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold text-[#7C6E62] hover:text-[#4A3728] cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              id="generate-catalog-image-btn"
              onClick={handleGenerate}
              className="px-8 py-3.5 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>Generate Catalog Image & View Market Linkage</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
