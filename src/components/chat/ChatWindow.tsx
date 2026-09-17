import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Globe2,
  Sparkles,
  Tag,
  Store,
  MapPin,
  CheckCheck,
  ChevronDown,
  RefreshCw,
  X,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  AlertCircle,
  Check,
  Phone,
  ArrowRightLeft,
  Volume2,
  Languages,
  HelpCircle
} from 'lucide-react';
import { api, authState } from '../../api';
import { ChatConversation, ChatMessage, User } from '../../types';
import {
  CHAT_LANGUAGES,
  CHAT_LANGUAGE_LIST,
  QUICK_BARGAIN_TEMPLATES,
  ChatLanguageInfo
} from './ChatLanguages';
import { useSpeechRecognition } from './useSpeechRecognition';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ReportBuyerModal } from './ReportBuyerModal';

interface ChatWindowProps {
  conversationId: string;
  initialProduct?: {
    id: string;
    title: string;
    price: number;
    primaryImage: string;
    artisanName?: string;
    artisanId?: string;
  };
  currentUser?: User | null;
  onClose?: () => void;
  onNavigateToProduct?: (slug?: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  initialProduct,
  currentUser,
  onClose,
  onNavigateToProduct
}) => {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [wsConnected, setWsConnected] = useState(false);

  // Role simulation & testing: allow switching active role in chat for live demo testing
  const loggedInRole = currentUser?.role === 'artisan' ? 'artisan' : 'buyer';
  const [activeRole, setActiveRole] = useState<'buyer' | 'artisan'>(loggedInRole);

  // Language selector state
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    currentUser?.preferredLanguage || (activeRole === 'artisan' ? 'te' : 'en')
  );

  // Price Bargaining Offer Modal / Drawer
  const [showBargainForm, setShowBargainForm] = useState(false);
  const [bargainPrice, setBargainPrice] = useState<string>('');
  const [bargainQuantity, setBargainQuantity] = useState<string>('10');

  // Live Auto-Translation Preview State
  const [livePreviewText, setLivePreviewText] = useState<string>('');
  const [isLiveTranslating, setIsLiveTranslating] = useState<boolean>(false);

  // AI Scam & Fraud Protection State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingMessageId, setReportingMessageId] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showScamInfoModal, setShowScamInfoModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Speech Recognition Hook
  const {
    isListening,
    transcript,
    error: speechError,
    isSupported: speechSupported,
    startListening,
    stopListening,
    clearError: clearSpeechError
  } = useSpeechRecognition();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // When speech recognition produces transcript, update input text
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Scroll to bottom helper
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch conversation and messages from API
  const fetchConversationData = useCallback(async (silent = false) => {
    if (!conversationId) return;
    if (!silent) setLoading(true);
    try {
      const res = await api.getChatConversation(conversationId);
      if (res?.conversation) {
        setConversation(res.conversation);
        setMessages(res.messages || []);

        // Auto-set language based on user's role if not explicitly set
        if (!silent) {
          if (activeRole === 'artisan' && res.conversation.artisanLanguage) {
            setSelectedLanguage(res.conversation.artisanLanguage);
          } else if (activeRole === 'buyer' && res.conversation.buyerLanguage) {
            setSelectedLanguage(res.conversation.buyerLanguage);
          }
        }
      }
    } catch (err) {
      if (!silent) {
        console.warn('Chat conversation loading notice:', (err as any)?.message || err);
      }
    } finally {
      if (!silent) setLoading(false);
      scrollToBottom('auto');
    }
  }, [conversationId, activeRole]);

  // Initial load
  useEffect(() => {
    fetchConversationData();
  }, [fetchConversationData]);

  // Connect WebSocket for real-time messaging
  useEffect(() => {
    let isMounted = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/chat-ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMounted) return;
      setWsConnected(true);
      ws.send(
        JSON.stringify({
          type: 'join',
          conversationId,
          userId: currentUser?.id || 'guest',
          role: activeRole
        })
      );
    };

    ws.onmessage = (event) => {
      if (!isMounted) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message' && data.conversationId === conversationId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
          if (data.conversation) {
            setConversation(data.conversation);
          }
          setTimeout(() => scrollToBottom('smooth'), 100);
        } else if (
          (data.type === 'conversation_blocked' || data.type === 'conversation_unblocked') &&
          data.conversationId === conversationId
        ) {
          if (data.conversation) {
            setConversation(data.conversation);
          }
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      if (isMounted) setWsConnected(false);
    };

    ws.onerror = (err) => {
      console.warn('WebSocket chat error, will fallback to polling:', err);
      if (isMounted) setWsConnected(false);
    };

    // Safety fallback: Poll conversation every 5 seconds
    const pollInterval = setInterval(() => {
      fetchConversationData(true);
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'leave', conversationId }));
        ws.close();
      }
    };
  }, [conversationId, currentUser?.id, activeRole, fetchConversationData]);

  // Handle language switch
  const handleLanguageChange = async (newLang: string) => {
    setSelectedLanguage(newLang);
    try {
      await api.updateChatLanguage(conversationId, activeRole, newLang);
      if (conversation) {
        setConversation({
          ...conversation,
          [activeRole === 'artisan' ? 'artisanLanguage' : 'buyerLanguage']: newLang
        });
      }
    } catch (err) {
      console.error('Failed to sync language preference to server:', err);
    }
  };

  const partnerLang = activeRole === 'artisan'
    ? (conversation?.buyerLanguage || 'en')
    : (conversation?.artisanLanguage || 'te');
  const partnerLangInfo = CHAT_LANGUAGES[partnerLang] || {
    name: partnerLang,
    native: partnerLang,
    speechLang: 'en-IN',
    code: partnerLang,
    region: 'India'
  };

  // Live Auto-Translation debounce effect
  useEffect(() => {
    const trimmed = inputText.trim();
    if (!trimmed || trimmed.length < 2 || partnerLang === selectedLanguage) {
      setLivePreviewText('');
      setIsLiveTranslating(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLiveTranslating(true);
      api.translateText(trimmed, selectedLanguage, partnerLang)
        .then((res) => {
          if (res?.translatedText) {
            setLivePreviewText(res.translatedText);
          }
        })
        .catch(() => {})
        .finally(() => setIsLiveTranslating(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [inputText, selectedLanguage, partnerLang]);

  // Send message
  const handleSendMessage = async (
    e?: React.FormEvent,
    isVoice = false,
    priceOffer?: number,
    qtyOffer?: number
  ) => {
    if (e) e.preventDefault();
    if (conversation?.isBlocked) {
      alert('This conversation has been blocked. Messages cannot be sent.');
      return;
    }

    const textToSend = inputText.trim();
    if (!textToSend && !priceOffer) return;

    setSending(true);
    const senderId = currentUser?.id || (activeRole === 'artisan' ? conversation?.artisanId : conversation?.buyerId) || 'user';
    const senderName = currentUser?.fullName || (activeRole === 'artisan' ? conversation?.artisanName : conversation?.buyerName) || (activeRole === 'artisan' ? 'Artisan' : 'Buyer');

    try {
      // Send via WebSocket if open, else fallback to REST API
      const payload = {
        text: textToSend || `Offer: ₹${priceOffer} for ${qtyOffer || 1} units`,
        language: selectedLanguage,
        senderId,
        senderName,
        senderRole: activeRole,
        isVoiceInput: isVoice,
        proposedPrice: priceOffer,
        proposedQuantity: qtyOffer,
        translations: livePreviewText ? { [partnerLang]: livePreviewText } : undefined
      };

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'send_message',
            conversationId,
            ...payload
          })
        );
      } else {
        const res = await api.sendChatMessage(conversationId, payload);
        setMessages((prev) => [...prev, res.message]);
        setConversation(res.conversation);
      }

      setInputText('');
      setLivePreviewText('');
      setShowBargainForm(false);
      setBargainPrice('');
      setTimeout(() => scrollToBottom('smooth'), 100);
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Could not send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Toggle Voice Recording
  const handleToggleVoice = () => {
    clearSpeechError();
    if (isListening) {
      stopListening();
      if (inputText.trim()) {
        handleSendMessage(undefined, true);
      }
    } else {
      const langObj = CHAT_LANGUAGES[selectedLanguage];
      const speechCode = langObj?.speechLang || 'en-IN';
      startListening(speechCode, (finalText) => {
        if (finalText.trim()) {
          setInputText(finalText);
        }
      });
    }
  };

  // Quick suggestion click
  const handleSelectQuickChip = (text: string) => {
    setInputText(text);
  };

  // Accept offer from counterparty
  const handleAcceptOffer = (price: number, qty?: number) => {
    const langInfo = CHAT_LANGUAGES[selectedLanguage] || { native: 'Accept offer' };
    const acceptMsg = selectedLanguage === 'te'
      ? `నేను ఒక్కొక్కటి ₹${price} ధరకు అంగీకరిస్తున్నాను. దయచేసి ఆర్డర్ నిర్ధారించండి.`
      : selectedLanguage === 'hi'
      ? `मैं प्रति पीस ₹${price} की कीमत स्वीकार करता हूँ। कृपया ऑर्डर पक्का करें।`
      : `I accept your offer of ₹${price} per unit. Let us confirm the order details.`;

    setInputText(acceptMsg);
  };

  // Counter offer from counterparty
  const handleCounterOffer = (currentPrice: number, currentQty?: number) => {
    setBargainPrice(String(Math.round(currentPrice * 1.05)));
    setBargainQuantity(String(currentQty || 10));
    setShowBargainForm(true);
  };

  // AI Scam & Fraud Protection Handlers
  const handleDismissScamWarning = async (messageId: string) => {
    try {
      await api.dismissScamWarning(messageId);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId && m.scamAnalysis
            ? { ...m, scamAnalysis: { ...m.scamAnalysis, isDismissed: true } }
            : m
        )
      );
      showToast('Safety warning dismissed. Marked as reviewed by you.');
    } catch (err) {
      console.error('Failed to dismiss scam warning:', err);
    }
  };

  const handleBlockBuyer = async () => {
    const isArtisan = activeRole === 'artisan';
    const confirmMsg = isArtisan
      ? 'Are you sure you want to block this buyer? They will be unable to send any further messages in this conversation.'
      : 'Block this contact?';
    if (!confirm(confirmMsg)) return;

    try {
      const res = await api.blockBuyerInConversation(conversationId);
      if (res?.conversation) {
        setConversation(res.conversation);
      }
      showToast('Buyer has been blocked. Messaging disabled.');
    } catch (err: any) {
      console.error('Failed to block buyer:', err);
      alert('Could not block buyer. Please try again.');
    }
  };

  const handleUnblockBuyer = async () => {
    try {
      const res = await api.unblockBuyerInConversation(conversationId);
      if (res?.conversation) {
        setConversation(res.conversation);
      }
      showToast('Buyer unblocked. Messaging has been re-enabled.');
    } catch (err: any) {
      console.error('Failed to unblock buyer:', err);
      alert('Could not unblock buyer. Please try again.');
    }
  };

  const handleOpenReportModal = (messageId?: string) => {
    setReportingMessageId(messageId);
    setReportModalOpen(true);
  };

  const activeLangObj: ChatLanguageInfo =
    CHAT_LANGUAGES[selectedLanguage] || CHAT_LANGUAGES.en;

  const otherPartyRole = activeRole === 'artisan' ? 'buyer' : 'artisan';
  const otherPartyName = activeRole === 'artisan' ? conversation?.buyerName : conversation?.artisanName;
  const otherPartyLang =
    activeRole === 'artisan'
      ? conversation?.buyerLanguage || 'en'
      : conversation?.artisanLanguage || 'te';
  const otherPartyLangObj = CHAT_LANGUAGES[otherPartyLang] || CHAT_LANGUAGES.te;

  const currentPrice = conversation?.productPrice || initialProduct?.price || 0;
  const quickChips = QUICK_BARGAIN_TEMPLATES[selectedLanguage] || QUICK_BARGAIN_TEMPLATES.en;

  return (
    <div className="flex flex-col h-full bg-[#FAF9F6] text-[#2D241E] overflow-hidden rounded-2xl border border-[#E5E1DA] shadow-xl">
      {/* 1. TOP HEADER: Product Info & Dual Language Selector */}
      <div className="bg-white border-b border-[#E5E1DA] p-3.5 sm:p-4 shrink-0 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          {/* Product Thumbnail & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[#F4F1ED] overflow-hidden border border-[#E5E1DA] shrink-0 relative">
              <img
                src={conversation?.productImage || initialProduct?.primaryImage}
                alt={conversation?.productTitle || initialProduct?.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#4A3728] truncate">
                  {conversation?.productTitle || initialProduct?.title || 'Handcrafted Art'}
                </h3>
                <span className="text-xs font-bold text-[#C05D4D] shrink-0">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#7C6E62] truncate mt-0.5">
                <span className="flex items-center gap-1">
                  <Store className="w-3 h-3 text-[#C05D4D]" />
                  <strong className="text-[#4A3728]">{conversation?.artisanName || 'Artisan Seller'}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-[10px]">{wsConnected ? 'Live Real-time' : 'Connected'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Close & Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* AI Scam Guard Indicator */}
            <button
              type="button"
              onClick={() => setShowScamInfoModal(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              title="AI Scam & Fraud Protection is active"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">AI Scam Guard</span>
            </button>

            {conversation?.isBlocked && (
              <span className="px-2 py-1 rounded-lg bg-red-100 border border-red-300 text-red-800 text-[11px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-red-600" />
                <span>Blocked</span>
              </span>
            )}

            {onNavigateToProduct && conversation?.productSlug && (
              <button
                type="button"
                onClick={() => onNavigateToProduct(conversation.productSlug)}
                className="p-1.5 rounded-lg border border-[#E5E1DA] hover:border-[#C05D4D] text-[#7C6E62] hover:text-[#C05D4D] transition-colors"
                title="View Product Page"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg border border-[#E5E1DA] hover:bg-stone-100 text-[#7C6E62] transition-colors"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Multilingual Translation & Testing Toolbar */}
        <div className="mt-3 pt-2.5 border-t border-[#F0EDEA] flex flex-wrap items-center justify-between gap-2">
          {/* Active User Language Selector */}
          <div className="flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-[#C05D4D] shrink-0" />
            <label htmlFor="chat-lang-select" className="text-xs font-semibold text-[#4A3728] whitespace-nowrap">
              Your Language:
            </label>
            <div className="relative">
              <select
                id="chat-lang-select"
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-[#FAF9F6] border border-[#E5E1DA] hover:border-[#C05D4D] text-xs font-bold text-[#4A3728] rounded-lg py-1 pl-2.5 pr-7 focus:outline-hidden focus:ring-1 focus:ring-[#C05D4D] cursor-pointer appearance-none"
              >
                {CHAT_LANGUAGE_LIST.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.native} ({lang.name})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#7C6E62] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Translation Direction Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] bg-[#FAF9F6] px-2.5 py-1 rounded-lg border border-[#E5E1DA] text-[#7C6E62]">
            <span className="font-medium">
              Translating to: <strong className="text-[#C05D4D]">{activeLangObj.native}</strong>
            </span>
            <ArrowRightLeft className="w-3 h-3 text-[#7C6E62]" />
            <span className="font-medium">
              {otherPartyRole === 'artisan' ? 'Artisan' : 'Buyer'} speaks:{' '}
              <strong className="text-[#4A3728]">{otherPartyLangObj.native}</strong>
            </span>
          </div>

          {/* Persona Switcher for easy testing / evaluation */}
          <div className="flex items-center gap-1 bg-[#F4F1ED] p-0.5 rounded-lg border border-[#E5E1DA]">
            <span className="text-[10px] font-bold text-[#7C6E62] px-1.5 uppercase">Mode:</span>
            <button
              type="button"
              onClick={() => {
                setActiveRole('buyer');
                if (conversation?.buyerLanguage) setSelectedLanguage(conversation.buyerLanguage);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                activeRole === 'buyer'
                  ? 'bg-[#C05D4D] text-white shadow-xs'
                  : 'text-[#7C6E62] hover:text-[#4A3728]'
              }`}
            >
              Buyer View
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveRole('artisan');
                if (conversation?.artisanLanguage) setSelectedLanguage(conversation.artisanLanguage);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                activeRole === 'artisan'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-[#7C6E62] hover:text-[#4A3728]'
              }`}
            >
              Artisan View
            </button>
          </div>
        </div>

        {/* Demo Scam Simulator Toolbar when in Buyer View */}
        {activeRole === 'buyer' && (
          <div className="mt-2.5 pt-2 border-t border-amber-200/60 bg-amber-50/50 -mx-3.5 -mb-3.5 sm:-mx-4 sm:-mb-4 px-3.5 py-1.5 sm:px-4 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <span className="font-bold text-amber-900 shrink-0 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-red-600" />
              <span>Test Scam Detection:</span>
            </span>
            <button
              type="button"
              onClick={() => setInputText("Hello, I transferred payment of ₹3,500. Please share the 6 digit OTP you received on your phone right now to verify and release the funds.")}
              className="px-2 py-0.5 rounded bg-white hover:bg-red-50 text-red-700 border border-red-200 font-medium whitespace-nowrap cursor-pointer transition-colors"
            >
              OTP Request
            </button>
            <button
              type="button"
              onClick={() => setInputText("Courier delivery confirmation required. Confirm your bank account and claim payment at https://craftwise-delivery-hub.xyz/verify")}
              className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 font-medium whitespace-nowrap cursor-pointer transition-colors"
            >
              Phishing Link
            </button>
            <button
              type="button"
              onClick={() => setInputText("Courier company requires a refundable verification fee of ₹500 before delivering. Please pay via UPI immediately.")}
              className="px-2 py-0.5 rounded bg-white hover:bg-orange-50 text-orange-800 border border-orange-200 font-medium whitespace-nowrap cursor-pointer transition-colors"
            >
              Advance Fee
            </button>
            <button
              type="button"
              onClick={() => setInputText("Namaste! Is this handcrafted basket available in natural dark brown? Can you ship 2 pieces to Hyderabad?")}
              className="px-2 py-0.5 rounded bg-white hover:bg-stone-100 text-[#4A3728] border border-stone-200 font-medium whitespace-nowrap cursor-pointer transition-colors"
            >
              Safe Message
            </button>
          </div>
        )}
      </div>

      {/* 2. BARGAIN OFFER DRAWER / POPUP */}
      {showBargainForm && (
        <div className="bg-amber-50/95 border-b border-amber-200 p-3 px-4 animate-in slide-in-from-top-2 duration-200 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
              <Tag className="w-4 h-4 text-amber-600" />
              <span>Make a Bulk Bargain Offer (Listed: ₹{currentPrice})</span>
            </div>
            <button
              type="button"
              onClick={() => setShowBargainForm(false)}
              className="text-amber-800 hover:text-amber-950 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-amber-900 mb-0.5">
                Offer Price per unit (₹)
              </label>
              <input
                type="number"
                value={bargainPrice}
                onChange={(e) => setBargainPrice(e.target.value)}
                placeholder={`e.g. ${Math.round(currentPrice * 0.9)}`}
                className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs font-bold text-[#4A3728] focus:outline-hidden focus:ring-1 focus:ring-[#C05D4D]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-amber-900 mb-0.5">
                Quantity (Units)
              </label>
              <input
                type="number"
                value={bargainQuantity}
                onChange={(e) => setBargainQuantity(e.target.value)}
                placeholder="e.g. 25"
                className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs font-bold text-[#4A3728] focus:outline-hidden focus:ring-1 focus:ring-[#C05D4D]"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  const p = Number(bargainPrice);
                  const q = Number(bargainQuantity) || 1;
                  if (!p || p <= 0) {
                    alert('Please enter a valid offer price');
                    return;
                  }
                  const offerMsg =
                    selectedLanguage === 'te'
                      ? `నేను ${q} వస్తువుల బల్క్ ఆర్డర్ కోసం ఒక్కొక్క బుట్టను ₹${p} ధరకు తీసుకోవాలనుకుంటున్నాను.`
                      : selectedLanguage === 'hi'
                      ? `मैं ${q} पीस के थोक ऑर्डर के लिए प्रति पीस ₹${p} का प्रस्ताव करता हूँ।`
                      : `I would like to offer ₹${p} per unit for a bulk order of ${q} pieces.`;
                  setInputText(offerMsg);
                  handleSendMessage(undefined, false, p, q);
                }}
                className="w-full py-1.5 px-3 bg-[#C05D4D] hover:bg-[#a94e40] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                Send Offer to Artisan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MESSAGE STREAM */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-1">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-3 border-[#C05D4D] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-[#7C6E62]">Connecting Multilingual Chat...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#7C6E62]">
            <MessageSquare className="w-10 h-10 text-stone-300 mb-2" />
            <h4 className="font-bold text-[#4A3728] text-sm">Start Direct Artisan Conversation</h4>
            <p className="text-xs max-w-xs mt-1">
              Ask questions about craft materials, negotiate bulk orders, or discuss custom pricing in any of the 9 Indian languages.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe =
              activeRole === 'buyer'
                ? msg.senderRole === 'buyer'
                : msg.senderRole === 'artisan';

            return (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                isCurrentUser={isMe}
                viewerRole={activeRole}
                viewerLanguage={selectedLanguage}
                recipientLanguage={partnerLang}
                onAcceptOffer={handleAcceptOffer}
                onCounterOffer={handleCounterOffer}
                onDismissScamWarning={handleDismissScamWarning}
                onReportBuyer={handleOpenReportModal}
                onBlockBuyer={handleBlockBuyer}
                onUpdateMessageTranslations={(msgId, trans) => {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === msgId
                        ? { ...m, translations: { ...(m.translations || {}), ...trans } }
                        : m
                    )
                  );
                }}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Blocked Conversation Notice Banner */}
      {conversation?.isBlocked && (
        <div className="px-4 py-2.5 bg-red-50 border-t border-red-200 text-xs text-red-900 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <strong>Conversation Blocked:</strong>{' '}
              {activeRole === 'artisan'
                ? 'You have blocked this buyer. They cannot send messages.'
                : 'This conversation has been blocked by the artisan.'}
            </span>
          </div>
          {activeRole === 'artisan' && (
            <button
              type="button"
              onClick={handleUnblockBuyer}
              className="px-2.5 py-1 bg-white border border-red-300 hover:bg-red-100 text-red-800 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Unblock Buyer
            </button>
          )}
        </div>
      )}

      {/* 4. QUICK SUGGESTION CHIPS */}
      {!conversation?.isBlocked && (
        <div className="px-3 py-2 bg-white/80 border-t border-[#F0EDEA] shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-[#7C6E62] uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C05D4D]" />
              Quick:
            </span>
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectQuickChip(chip)}
                className="text-[11px] whitespace-nowrap bg-[#FAF9F6] hover:bg-red-50 hover:text-[#C05D4D] text-[#4A3728] border border-[#E5E1DA] hover:border-[#C05D4D] px-2.5 py-1 rounded-full transition-all cursor-pointer font-medium shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. SPEECH ERROR BANNER IF ANY */}
      {speechError && (
        <div className="bg-red-50 text-red-700 px-3 py-1.5 text-xs flex items-center justify-between border-t border-red-100 shrink-0">
          <span>{speechError}</span>
          <button
            type="button"
            onClick={clearSpeechError}
            className="text-red-800 font-bold p-1 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 6. LIVE TRANSLATION PREVIEW BANNER */}
      {inputText.trim() && partnerLang !== selectedLanguage && !conversation?.isBlocked && (
        <div className="px-3.5 py-2 bg-amber-50/95 border-t border-amber-200/80 text-xs flex items-center justify-between gap-2 text-amber-950 transition-all">
          <div className="flex items-center gap-1.5 truncate">
            <Languages className="w-3.5 h-3.5 text-[#C05D4D] shrink-0" />
            <span className="text-[11px] font-bold text-[#7C6E62] shrink-0">
              Live {partnerLangInfo.native} ({partnerLangInfo.name}) Preview:
            </span>
            {isLiveTranslating ? (
              <span className="text-xs italic text-[#7C6E62] flex items-center gap-1 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" /> Translating...
              </span>
            ) : (
              <span className="font-medium text-[#2D241E] truncate">
                "{livePreviewText || 'Translating...'}"
              </span>
            )}
          </div>
          <span className="text-[10px] text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full font-bold shrink-0">
            Auto-Translates for {activeRole === 'buyer' ? 'Artisan' : 'Buyer'}
          </span>
        </div>
      )}

      {/* 7. INPUT BAR WITH 🎤 VOICE AND 🏷️ BARGAIN */}
      <div className="p-3 sm:p-4 bg-white border-t border-[#E5E1DA] shrink-0">
        <form onSubmit={(e) => handleSendMessage(e, false)} className="flex items-center gap-2">
          {/* Bargain Offer Trigger */}
          <button
            type="button"
            disabled={conversation?.isBlocked}
            onClick={() => setShowBargainForm(!showBargainForm)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold ${
              conversation?.isBlocked
                ? 'opacity-40 cursor-not-allowed border-[#E5E1DA] text-stone-400'
                : showBargainForm
                ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-xs cursor-pointer'
                : 'border-[#E5E1DA] hover:border-amber-400 text-[#4A3728] hover:bg-amber-50 cursor-pointer'
            }`}
            title="Make a Price Bargain Offer"
          >
            <Tag className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Bargain</span>
          </button>

          {/* Voice Microphone Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            disabled={!speechSupported || conversation?.isBlocked}
            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center relative ${
              isListening
                ? 'bg-red-500 border-red-600 text-white shadow-md animate-pulse'
                : 'border-[#E5E1DA] hover:border-[#C05D4D] text-[#7C6E62] hover:text-[#C05D4D]'
            } ${!speechSupported || conversation?.isBlocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            title={
              conversation?.isBlocked
                ? 'Conversation blocked'
                : isListening
                ? 'Listening... Click to stop and send'
                : `Voice input in ${activeLangObj.native}`
            }
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white animate-ping" />
            )}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              disabled={conversation?.isBlocked}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                conversation?.isBlocked
                  ? 'This conversation has been blocked'
                  : isListening
                  ? `Listening in ${activeLangObj.native}...`
                  : `Type in ${activeLangObj.native} (or any language)...`
              }
              className={`w-full bg-[#FAF9F6] border rounded-xl py-2.5 px-3.5 text-sm text-[#2D241E] placeholder:text-[#A89F91] focus:outline-hidden transition-all ${
                conversation?.isBlocked
                  ? 'bg-stone-100 cursor-not-allowed border-stone-200 text-stone-400'
                  : isListening
                  ? 'border-red-400 ring-2 ring-red-100'
                  : 'border-[#E5E1DA] focus:border-[#C05D4D] focus:ring-1 focus:ring-[#C05D4D]'
              }`}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={sending || conversation?.isBlocked || (!inputText.trim() && !isListening)}
            className="p-2.5 px-4 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl shadow-xs font-bold transition-all flex items-center justify-center shrink-0 cursor-pointer"
            title="Send Message"
          >
            {sending ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </form>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#2D241E] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-stone-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white ml-1 text-xs"
          >
            ×
          </button>
        </div>
      )}

      {/* Report Buyer Modal */}
      <ReportBuyerModal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportingMessageId(undefined);
        }}
        conversationId={conversationId}
        messageId={reportingMessageId}
        buyerName={conversation?.buyerName || 'Buyer'}
        onSuccess={() => {
          showToast('Report submitted. Our trust & safety team has been notified.');
        }}
      />

      {/* AI Scam Guard Info Modal */}
      {showScamInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white max-w-md w-full rounded-2xl p-5 border border-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2 text-[#4A3728]">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif font-bold text-base">AI Scam & Fraud Protection</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScamInfoModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7C6E62] leading-relaxed">
              CraftWise automatically inspects incoming buyer messages to protect artisans and makers from common marketplace fraud, phishing, and extortion.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
                <span className="text-base leading-none">🔑</span>
                <div>
                  <h4 className="font-bold text-[#4A3728]">OTP & Banking Credentials</h4>
                  <p className="text-stone-600 text-[11px] mt-0.5">
                    Never share an OTP, UPI PIN, or bank password. CraftWise never asks for payment OTPs.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
                <span className="text-base leading-none">🔗</span>
                <div>
                  <h4 className="font-bold text-[#4A3728]">Phishing & External Links</h4>
                  <p className="text-stone-600 text-[11px] mt-0.5">
                    Untrusted or suspicious URLs are flagged immediately before you click them.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
                <span className="text-base leading-none">💰</span>
                <div>
                  <h4 className="font-bold text-[#4A3728]">Advance / Courier "Refund" Fees</h4>
                  <p className="text-stone-600 text-[11px] mt-0.5">
                    Legitimate buyers never ask you to pay money or fees in order to receive your earnings.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
                <span className="text-base leading-none">🔊</span>
                <div>
                  <h4 className="font-bold text-[#4A3728]">Voice Audio Alerts in Indian Languages</h4>
                  <p className="text-stone-600 text-[11px] mt-0.5">
                    Warnings are explained clearly in your preferred local language with voice audio reading.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowScamInfoModal(false)}
                className="w-full py-2 bg-[#C05D4D] hover:bg-[#a94e40] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
