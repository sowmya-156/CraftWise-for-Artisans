import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X, Check, Lock } from 'lucide-react';
import { api } from '../../api';

interface ReportBuyerModalProps {
  conversationId: string;
  messageId?: string;
  buyerName?: string;
  viewerLanguage?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onBlockBuyer?: () => void;
}

const REPORT_REASONS = [
  {
    id: 'otp_pin',
    label: 'Asking for OTP, PIN, password, or bank credentials',
    labelTe: 'OTP, PIN, పాస్‌వర్డ్ లేదా బ్యాంక్ వివరాలు అడుగుతున్నారు',
    labelHi: 'OTP, PIN, पासवर्ड या बैंक विवरण मांग रहे हैं'
  },
  {
    id: 'fake_link',
    label: 'Sent suspicious external link or fake payment QR code',
    labelTe: 'అనుమానాస్పద లింక్ లేదా నకిలీ చెల్లింపు QR కోడ్ పంపారు',
    labelHi: 'संदिग्ध बाहरी लिंक या फर्जी क्यूआर कोड भेजा'
  },
  {
    id: 'fake_fee',
    label: 'Asking to pay "verification/refund/release" fee to receive payment',
    labelTe: 'చెల్లింపు అందుకోవడానికి రుసుము చెల్లించాలని అడుగుతున్నారు',
    labelHi: 'भुगतान प्राप्त करने के लिए सत्यापन/रिफंड शुल्क मांग रहे हैं'
  },
  {
    id: 'urgent_pressure',
    label: 'Urgent pressure to transfer money or bypass CraftWise',
    labelTe: 'క్రాఫ్ట్‌వైస్ వెలుపల త్వరగా డబ్బు పంపమని ఒత్తిడి చేస్తున్నారు',
    labelHi: 'कस्टमर प्लेटफ़ॉर्म के बाहर तुरंत पैसे भेजने का दबाव बना रहे हैं'
  },
  {
    id: 'fake_courier',
    label: 'Fake courier, delivery pickup, or fraudulent payment screenshot',
    labelTe: 'నకిలీ కొరియర్ లేదా చెల్లింపు స్క్రీన్‌షాట్ పంపారు',
    labelHi: 'फर्जी कूरियर या फर्जी भुगतान स्क्रीनशॉट का दावा'
  },
  {
    id: 'other',
    label: 'Other suspicious or abusive behavior',
    labelTe: 'ఇతర అనుమానాస్పద లేదా అనుచిత ప్రవర్తన',
    labelHi: 'अन्य संदिग्ध या अनुचित व्यवहार'
  }
];

export const ReportBuyerModal: React.FC<ReportBuyerModalProps> = ({
  conversationId,
  messageId,
  buyerName = 'Buyer',
  viewerLanguage = 'en',
  isOpen,
  onClose,
  onSuccess,
  onBlockBuyer
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0].id);
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const getReasonLabel = (item: typeof REPORT_REASONS[0]) => {
    if (viewerLanguage === 'te') return item.labelTe;
    if (viewerLanguage === 'hi') return item.labelHi;
    return item.label;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const reasonObj = REPORT_REASONS.find(r => r.id === selectedReason);
      const reasonText = reasonObj?.label || selectedReason;

      const res = await api.reportBuyer(conversationId, {
        messageId,
        reason: reasonText,
        details: details.trim() || undefined
      });

      if (alsoBlock && onBlockBuyer) {
        try {
          await api.blockBuyerInConversation(conversationId);
          onBlockBuyer();
        } catch (blockErr) {
          console.warn('Auto block notice:', blockErr);
        }
      }

      onSuccess(res?.message || 'Report submitted successfully. CraftWise Trust & Safety will investigate.');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-red-50/80 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-100 text-red-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                {viewerLanguage === 'te'
                  ? 'కొనుగోలుదారుపై ఫిర్యాదు చేయండి'
                  : viewerLanguage === 'hi'
                  ? 'खरीदार की रिपोर्ट करें'
                  : 'Report Suspicious Buyer'}
              </h3>
              <p className="text-xs text-stone-600">
                {viewerLanguage === 'te'
                  ? `${buyerName} నుండి అనుమానాస్పద సందేశాన్ని నివేదించండి`
                  : `Reporting ${buyerName} to CraftWise Trust & Safety`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-2 uppercase tracking-wider">
              {viewerLanguage === 'te'
                ? 'సమస్య ఏమిటి? (కారణం ఎంచుకోండి)'
                : viewerLanguage === 'hi'
                ? 'समस्या क्या है? (कारण चुनें)'
                : 'Select Scam or Safety Reason'}
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {REPORT_REASONS.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === item.id
                      ? 'border-red-500 bg-red-50/50 text-stone-900 font-medium'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={item.id}
                    checked={selectedReason === item.id}
                    onChange={() => setSelectedReason(item.id)}
                    className="mt-0.5 text-red-600 focus:ring-red-500"
                  />
                  <span>{getReasonLabel(item)}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              {viewerLanguage === 'te'
                ? 'మరిన్ని వివరాలు (ఐచ్ఛికం)'
                : viewerLanguage === 'hi'
                ? 'अतिरिक्त विवरण (वैकल्पिक)'
                : 'Additional Details (Optional)'}
            </label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={
                viewerLanguage === 'te'
                  ? 'ఏమి జరిగిందో సంక్షిప్తంగా వివరించండి...'
                  : 'Briefly describe what happened or any suspicious instructions...'
              }
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder:text-stone-400"
            />
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <label className="flex items-center gap-2.5 text-xs text-stone-800 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={alsoBlock}
                onChange={(e) => setAlsoBlock(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-stone-300"
              />
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-stone-600" />
                <span>
                  {viewerLanguage === 'te'
                    ? 'ఈ కొనుగోలుదారుని వెంటనే బ్లాక్ చేయండి (సందేశాలను ఆపండి)'
                    : 'Also block this buyer immediately from sending messages'}
                </span>
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              {viewerLanguage === 'te' ? 'రద్దు చేయి' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : viewerLanguage === 'te' ? 'నివేదిక సమర్పించండి' : 'Submit Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
