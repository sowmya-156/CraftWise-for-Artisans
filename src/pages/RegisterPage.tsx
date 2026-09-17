import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  UserPlus,
  ShieldCheck,
  Eye,
  EyeOff,
  ShoppingBag,
  Store,
  CheckCircle2,
  MapPin,
  Tag,
  Truck,
  AlertCircle,
  Phone,
  Mail,
  KeyRound,
  Check,
  Mic,
  Volume2,
  VolumeX,
  HelpCircle,
  Globe
} from 'lucide-react';
import { api, authState } from '../api';
import { ALL_SUPPORTED_LANGUAGES, UserRole } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { playTextToSpeech, stopTextToSpeech } from '../utils/textToSpeech';
import { getGuideIntroPrompt } from '../utils/voicePrompts';

const AUDIO_GUIDE_LABELS: Record<string, string> = {
  te: 'ధ్వని సహాయం (Audio Guide)',
  hi: 'ऑडियो गाइड (Audio Guide)',
  ta: 'ஆடியோ வழிகாட்டி (Audio Guide)',
  kn: 'ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ (Audio Guide)',
  ml: 'ഓഡിയോ ഗൈഡ് (Audio Guide)',
  bn: 'অডিও গাইড (Audio Guide)',
  mr: 'ऑडिओ मार्गदर्शक (Audio Guide)',
  or: 'ଅଡିଓ ଗାଇଡ୍ (Audio Guide)',
  en: 'Audio Guide'
};

interface RegisterPageProps {
  onRegisterSuccess: (user: any, profile?: any) => void;
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onNavigate }) => {
  const [role, setRole] = useState<UserRole>('artisan');

  // Common fields
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Voice recognition active language across all form inputs (supports all 9 regional Indian languages)
  const [voiceLanguage, setVoiceLanguage] = useState('te');
  // Interactive voice prompt mode: speaks questions aloud (e.g. "దయచేసి మీ పూర్తి పేరు చెప్పండి") before recording
  const [voicePromptsEnabled, setVoicePromptsEnabled] = useState(true);
  const [isPlayingGuide, setIsPlayingGuide] = useState(false);

  // Stop any ongoing voice guide or speech on unmount
  useEffect(() => {
    return () => {
      stopTextToSpeech();
    };
  }, []);

  const handlePlayVoiceGuide = () => {
    if (isPlayingGuide) {
      stopTextToSpeech();
      setIsPlayingGuide(false);
      return;
    }

    stopTextToSpeech();
    setIsPlayingGuide(true);
    const guideText = getGuideIntroPrompt(voiceLanguage);

    playTextToSpeech(guideText, voiceLanguage, {
      onStart: () => setIsPlayingGuide(true),
      onEnd: () => setIsPlayingGuide(false),
      onError: () => setIsPlayingGuide(false)
    });
  };

  // OTP Verification State (Artisan mobile & Buyer mobile/email)
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [verifiedMobile, setVerifiedMobile] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Buyer OTP authentication preference: either 'mobile' or 'email'
  const [buyerAuthMethod, setBuyerAuthMethod] = useState<'mobile' | 'email'>('mobile');
  const [activeOtpChannel, setActiveOtpChannel] = useState<'mobile' | 'email'>('mobile');

  // Artisan specific fields
  const [preferredLanguage, setPreferredLanguage] = useState('te');
  const [artisanState, setArtisanState] = useState('Andhra Pradesh');
  const [artisanDistrict, setArtisanDistrict] = useState('Visakhapatnam');
  const [craftType, setCraftType] = useState('Bamboo Handicrafts');
  const [cooperativeName, setCooperativeName] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('10');

  // Keep voiceLanguage in sync with preferredLanguage for artisans
  useEffect(() => {
    if (preferredLanguage) {
      setVoiceLanguage(preferredLanguage);
    }
  }, [preferredLanguage]);

  // Buyer specific fields
  const [buyerCity, setBuyerCity] = useState('');
  const [buyerState, setBuyerState] = useState('Telangana');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [interestedCategories, setInterestedCategories] = useState<string[]>([
    'Handloom & Traditional Weaving',
    'Clay & Terracotta Pottery'
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time mobile cross-registration check state
  const [mobileStatus, setMobileStatus] = useState<{
    checked: boolean;
    exists?: boolean;
    registeredRole?: string;
    allowed?: boolean;
    message?: string;
  } | null>(null);
  const [checkingMobile, setCheckingMobile] = useState(false);

  // Real-time email cross-registration check state (for buyer)
  const [emailStatus, setEmailStatus] = useState<{
    checked: boolean;
    exists?: boolean;
    registeredRole?: string;
    allowed?: boolean;
    message?: string;
  } | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Listen to changes in mobile number and role to proactively validate
  useEffect(() => {
    const digits = mobile.replace(/\D/g, '');
    if (digits.length >= 10) {
      let active = true;
      setCheckingMobile(true);
      const timer = setTimeout(async () => {
        try {
          const res = await api.checkMobile(mobile, role);
          if (active) {
            setMobileStatus(res);
            if (!res.allowed && res.message) {
              setError(res.message);
            } else if (error && error.includes('mobile')) {
              setError(null);
            }
          }
        } catch {
          // ignore background check failure
        } finally {
          if (active) setCheckingMobile(false);
        }
      }, 350);

      return () => {
        active = false;
        clearTimeout(timer);
      };
    } else {
      setMobileStatus(null);
      setCheckingMobile(false);
    }
  }, [mobile, role]);

  // Listen to changes in buyer email to validate availability and role isolation
  useEffect(() => {
    const cleanEmail = email.trim().toLowerCase();
    if (role === 'buyer' && cleanEmail && cleanEmail.includes('@') && cleanEmail.includes('.')) {
      let active = true;
      setCheckingEmail(true);
      const timer = setTimeout(async () => {
        try {
          const res = await api.checkEmail(cleanEmail, 'buyer');
          if (active) {
            setEmailStatus(res);
            if (!res.allowed && res.message) {
              setError(res.message);
            } else if (error && error.includes('email')) {
              setError(null);
            }
          }
        } catch {
          // ignore background check failure
        } finally {
          if (active) setCheckingEmail(false);
        }
      }, 350);

      return () => {
        active = false;
        clearTimeout(timer);
      };
    } else {
      setEmailStatus(null);
      setCheckingEmail(false);
    }
  }, [email, role]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Reset verified status if user changes the mobile number after verifying
  useEffect(() => {
    const digits = mobile.replace(/\D/g, '');
    if (verifiedMobile && digits !== verifiedMobile) {
      setIsMobileVerified(false);
      setVerifiedMobile('');
      if (activeOtpChannel === 'mobile') {
        setOtpSent(false);
        setOtp('');
        setDemoOtpCode(null);
        setOtpError(null);
      }
    }
  }, [mobile, verifiedMobile, activeOtpChannel]);

  // Reset email verified status if user changes the email after verifying
  useEffect(() => {
    const cleanEmail = email.trim().toLowerCase();
    if (verifiedEmail && cleanEmail !== verifiedEmail) {
      setIsEmailVerified(false);
      setVerifiedEmail('');
      if (activeOtpChannel === 'email') {
        setOtpSent(false);
        setOtp('');
        setDemoOtpCode(null);
        setOtpError(null);
      }
    }
  }, [email, verifiedEmail, activeOtpChannel]);

  // Request 6-digit OTP for artisan (mobile) or buyer (mobile or email)
  const handleSendOtp = async (channel?: 'mobile' | 'email') => {
    const targetChannel = channel || (role === 'artisan' ? 'mobile' : buyerAuthMethod);
    setOtpError(null);

    if (targetChannel === 'email') {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
        setOtpError('Please enter a valid email address first.');
        return;
      }
      if (emailStatus && !emailStatus.allowed) {
        setOtpError(emailStatus.message || 'This email address cannot be registered.');
        return;
      }

      setOtpSending(true);
      setActiveOtpChannel('email');
      try {
        const res = await api.sendRegistrationOtp({ type: 'email', email: cleanEmail, role });
        setOtpSent(true);
        setDemoOtpCode(res.otp);
        setResendCountdown(45);
      } catch (err: any) {
        setOtpError(err.message || 'Failed to send Email OTP. Please try again.');
      } finally {
        setOtpSending(false);
      }
    } else {
      const digits = mobile.replace(/\D/g, '');
      if (digits.length < 10) {
        setOtpError('Please enter a valid 10-digit mobile number first.');
        return;
      }
      if (mobileStatus && !mobileStatus.allowed) {
        setOtpError(mobileStatus.message || 'This mobile number cannot be registered.');
        return;
      }

      setOtpSending(true);
      setActiveOtpChannel('mobile');
      try {
        const res = await api.sendRegistrationOtp({ type: 'mobile', mobile: digits, role });
        setOtpSent(true);
        setDemoOtpCode(res.otp);
        setResendCountdown(45);
      } catch (err: any) {
        setOtpError(err.message || 'Failed to send Mobile OTP. Please try again.');
      } finally {
        setOtpSending(false);
      }
    }
  };

  // Verify entered 6-digit OTP
  const handleVerifyOtp = async () => {
    const cleanOtp = otp.trim();
    if (cleanOtp.length < 4) {
      setOtpError('Please enter the 6-digit OTP received.');
      return;
    }

    setOtpVerifying(true);
    setOtpError(null);

    try {
      if (activeOtpChannel === 'email') {
        const cleanEmail = email.trim().toLowerCase();
        const res = await api.verifyRegistrationOtp({ type: 'email', email: cleanEmail, otp: cleanOtp });
        if (res.verified) {
          setIsEmailVerified(true);
          setVerifiedEmail(cleanEmail);
          setOtpError(null);
        }
      } else {
        const digits = mobile.replace(/\D/g, '');
        const res = await api.verifyRegistrationOtp({ type: 'mobile', mobile: digits, otp: cleanOtp });
        if (res.verified) {
          setIsMobileVerified(true);
          setVerifiedMobile(digits);
          setOtpError(null);
        }
      }
    } catch (err: any) {
      setOtpError(err.message || 'Invalid or expired OTP. Please verify the code.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const indianStates = [
    'Andhra Pradesh',
    'Telangana',
    'Odisha',
    'Uttar Pradesh',
    'Rajasthan',
    'Madhya Pradesh',
    'West Bengal',
    'Assam',
    'Bihar',
    'Gujarat',
    'Karnataka',
    'Tamil Nadu',
    'Kerala',
    'Maharashtra',
    'Chhattisgarh',
    'Jharkhand',
    'Delhi NCR',
    'Punjab'
  ];

  const craftCategories = [
    'Bamboo & Cane Handicrafts',
    'Clay & Terracotta Pottery',
    'Handloom & Traditional Weaving',
    'Wood Carving & Inlay',
    'Brass & Bell Metal Crafts',
    'Leather & Traditional Footwear',
    'Tribal Jewelry & Beadwork',
    'Stone Carving & Sculptures',
    'Natural Fiber & Jute Crafts'
  ];

  const toggleBuyerCategory = (cat: string) => {
    setInterestedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOtpError(null);

    const digits = mobile.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (mobileStatus && !mobileStatus.allowed) {
      setError(mobileStatus.message || 'This mobile number cannot be registered under this role.');
      return;
    }

    // Role-specific verification:
    // Artisan registration ONLY uses mobile and MUST authenticate via OTP!
    if (role === 'artisan') {
      if (!isMobileVerified) {
        if (otpSent && otp.trim().length >= 4) {
          try {
            setLoading(true);
            const vRes = await api.verifyRegistrationOtp({ type: 'mobile', mobile: digits, otp: otp.trim() });
            if (vRes.verified) {
              setIsMobileVerified(true);
              setVerifiedMobile(digits);
            }
          } catch (err: any) {
            setLoading(false);
            setOtpError(err.message || 'Invalid OTP code.');
            setError('Please verify your mobile number with OTP before completing registration.');
            return;
          }
        } else {
          setError('Please authenticate your mobile number using the 6-digit OTP before completing registration.');
          if (!otpSent) {
            handleSendOtp('mobile');
          }
          return;
        }
      }
    } else {
      // Buyer requires BOTH mobile number and email address, and authenticates EITHER via OTP!
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
        setError('Please provide a valid email address.');
        return;
      }

      if (emailStatus && !emailStatus.allowed) {
        setError(emailStatus.message || 'This email address cannot be registered.');
        return;
      }

      const hasAuthenticated = isMobileVerified || isEmailVerified;
      if (!hasAuthenticated) {
        if (otpSent && otp.trim().length >= 4) {
          try {
            setLoading(true);
            const channel = activeOtpChannel;
            const vRes = await api.verifyRegistrationOtp({
              type: channel,
              mobile: digits,
              email: cleanEmail,
              otp: otp.trim()
            });
            if (vRes.verified) {
              if (channel === 'email') {
                setIsEmailVerified(true);
                setVerifiedEmail(cleanEmail);
              } else {
                setIsMobileVerified(true);
                setVerifiedMobile(digits);
              }
            }
          } catch (err: any) {
            setLoading(false);
            setOtpError(err.message || 'Invalid OTP code.');
            setError(`Please verify your ${activeOtpChannel === 'email' ? 'email address' : 'mobile number'} with OTP before completing registration.`);
            return;
          }
        } else {
          setError('Please authenticate either your mobile number or your email address with the 6-digit OTP before completing registration.');
          if (!otpSent) {
            handleSendOtp(buyerAuthMethod);
          }
          return;
        }
      }
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and re-enter.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        role,
        fullName,
        mobile: digits,
        password,
        otp: otp.trim() || undefined,
        verifiedChannel: isEmailVerified ? 'email' : (isMobileVerified ? 'mobile' : undefined)
      };

      if (role === 'artisan') {
        // Artisan has NO email field!
        payload.preferredLanguage = preferredLanguage;
        payload.state = artisanState;
        payload.district = artisanDistrict;
        payload.craftType = craftType;
        payload.cooperativeName = cooperativeName;
        payload.yearsOfExperience = yearsOfExperience;
      } else {
        payload.email = email.trim().toLowerCase();
        payload.city = buyerCity;
        payload.state = buyerState;
        payload.deliveryAddress = deliveryAddress;
        payload.interestedCategories = interestedCategories;
        payload.preferredLanguage = 'en';
      }

      const res = await api.register(payload);
      authState.setSession(res.token, res.user, res.profile);
      onRegisterSuccess(res.user, res.profile);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C05D4D] to-[#A34E41] text-white flex items-center justify-center mx-auto shadow-xs mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-serif italic text-3xl font-bold text-[#4A3728] tracking-tight">
            Join the CraftWise Community
          </h2>
          <p className="mt-1 text-sm text-[#7C6E62]">
            Select your account type to register as an Artisan Seller or a Buyer / Craft Enthusiast
          </p>
        </div>

        {/* Role Switcher Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div
            id="role-select-artisan"
            onClick={() => setRole('artisan')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              role === 'artisan'
                ? 'bg-white border-[#C05D4D] shadow-md shadow-[#C05D4D15]'
                : 'bg-white/60 border-[#E5E1DA] hover:border-[#D4CDC5]'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  role === 'artisan'
                    ? 'bg-[#C05D4D] text-white'
                    : 'bg-[#F0EDEA] text-[#7C6E62]'
                }`}
              >
                <Store className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#4A3728]">Artisan / Seller</span>
                  {role === 'artisan' && (
                    <CheckCircle2 className="w-4 h-4 text-[#C05D4D]" />
                  )}
                </div>
                <p className="text-xs text-[#7C6E62] mt-1">
                  Sell your handmade creations, get AI voice cataloging in 9 Indian languages & direct buyers.
                </p>
              </div>
            </div>
          </div>

          <div
            id="role-select-buyer"
            onClick={() => setRole('buyer')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              role === 'buyer'
                ? 'bg-white border-[#C05D4D] shadow-md shadow-[#C05D4D15]'
                : 'bg-white/60 border-[#E5E1DA] hover:border-[#D4CDC5]'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  role === 'buyer'
                    ? 'bg-[#C05D4D] text-white'
                    : 'bg-[#F0EDEA] text-[#7C6E62]'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#4A3728]">Buyer / Customer</span>
                  {role === 'buyer' && (
                    <CheckCircle2 className="w-4 h-4 text-[#C05D4D]" />
                  )}
                </div>
                <p className="text-xs text-[#7C6E62] mt-1">
                  Explore authentic crafts across categories from verified artisans with direct contact & fair prices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form Box */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E5E1DA] shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            {/* 9-Regional Language Voice Assistant Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#FFF9F4] via-[#FDF6EE] to-[#F7EFE4] border-2 border-[#EAD7C5] shadow-xs space-y-3.5">
              {/* Row 1: Header & Language Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#EEDCCA]/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#C05D4D] text-white flex items-center justify-center gap-1 shrink-0 shadow-xs ring-2 ring-[#C05D4D]/15">
                    <Volume2 className="w-3.5 h-3.5 text-amber-200" />
                    <span className="text-white/40 text-[10px]">|</span>
                    <Mic className="w-3.5 h-3.5 text-white animate-pulse" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-[#4A3728] tracking-tight">
                      Voice-Assisted Registration
                    </h3>
                    <span className="bg-[#C05D4D]/10 text-[#C05D4D] text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap border border-[#C05D4D]/20">
                      9 Indian Languages
                    </span>
                  </div>
                </div>

                {/* Main Language Selector Dropdown */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 bg-white px-2.5 py-1 rounded-xl border border-[#D8C7B7] shadow-2xs">
                  <Globe className="w-3.5 h-3.5 text-[#C05D4D] shrink-0" />
                  <span className="text-[11px] font-bold text-[#7C6E62]">Language:</span>
                  <select
                    id="reg-voice-lang-select"
                    value={voiceLanguage}
                    onChange={(e) => {
                      stopTextToSpeech();
                      setIsPlayingGuide(false);
                      setVoiceLanguage(e.target.value);
                      if (role === 'artisan') {
                        setPreferredLanguage(e.target.value);
                      }
                    }}
                    className="text-xs font-bold py-0.5 bg-transparent text-[#C05D4D] focus:outline-none cursor-pointer pr-1"
                  >
                    {ALL_SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.nativeName} ({l.label})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Visual Guidance Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-[#EAD7C5]">
                  <span className="shrink-0 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold whitespace-nowrap flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-indigo-600" />
                    Sound (Ask)
                  </span>
                  <span className="text-[#6C5E53] text-[11px] leading-tight">
                    Tap to hear the field question spoken aloud
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-[#EAD7C5]">
                  <span className="shrink-0 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[11px] font-bold whitespace-nowrap flex items-center gap-1">
                    <Mic className="w-3 h-3 text-rose-600" />
                    Mic (Speak)
                  </span>
                  <span className="text-[#6C5E53] text-[11px] leading-tight">
                    Tap to speak your answer instead of typing
                  </span>
                </div>
              </div>

              {/* Row 3: Audio Guide & Voice Prompts Control Toolbar */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  id="btn-hear-voice-guide"
                  onClick={handlePlayVoiceGuide}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
                    isPlayingGuide
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-500/30 animate-pulse ring-2 ring-indigo-300'
                      : 'bg-white hover:bg-[#F3EAE1] text-[#C05D4D] border-[#D5C2B1]'
                  }`}
                  title="Tap to hear spoken instructions in your language"
                >
                  <Volume2 className={`w-3.5 h-3.5 shrink-0 ${isPlayingGuide ? 'animate-bounce text-white' : 'text-[#C05D4D]'}`} />
                  <span>
                    {isPlayingGuide
                      ? 'Speaking Guide...'
                      : AUDIO_GUIDE_LABELS[voiceLanguage] || 'Audio Guide'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isPlayingGuide) {
                      stopTextToSpeech();
                      setIsPlayingGuide(false);
                    }
                    setVoicePromptsEnabled(!voicePromptsEnabled);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
                    voicePromptsEnabled
                      ? 'bg-[#4A3728] text-white border-[#3B2B1F]'
                      : 'bg-white text-[#7C6E62] border-[#D5C2B1]'
                  }`}
                  title="When ON, questions are spoken aloud before recording your voice"
                >
                  {voicePromptsEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                      <span>Voice Prompts: ON</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 shrink-0" />
                      <span>Voice Prompts: OFF</span>
                    </>
                  )}
                </button>
              </div>

              {/* Spoken Guide Audio Subtitle when guide is active */}
              {isPlayingGuide && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-indigo-600 shrink-0 animate-bounce" />
                    <div>
                      <span className="font-bold text-indigo-800 mr-1">Voice Guide:</span>
                      <span>"{getGuideIntroPrompt(voiceLanguage)}"</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      stopTextToSpeech();
                      setIsPlayingGuide(false);
                    }}
                    className="text-xs font-bold px-2 py-1 bg-indigo-200 hover:bg-indigo-300 text-indigo-800 rounded-lg cursor-pointer shrink-0"
                  >
                    Stop
                  </button>
                </div>
              )}

              {/* Row 4: 9 Quick Language Switcher Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-[#EEDCCA]">
                <span className="text-[11px] font-semibold text-[#8C7A6B] mr-1 whitespace-nowrap">
                  Switch Speech Language:
                </span>
                {ALL_SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = lang.code === voiceLanguage;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      id={`voice-lang-btn-${lang.code}`}
                      onClick={() => {
                        stopTextToSpeech();
                        setIsPlayingGuide(false);
                        setVoiceLanguage(lang.code);
                        if (role === 'artisan') {
                          setPreferredLanguage(lang.code);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all font-medium cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#C05D4D] text-white font-bold shadow-2xs ring-2 ring-[#C05D4D]/20'
                          : 'bg-white text-[#5C4D42] border border-[#E5DACF] hover:bg-[#F9F4EE]'
                      }`}
                    >
                      {lang.nativeName} ({lang.label})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Basic Info */}
            <div className="border-b border-[#F0EDEA] pb-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="text-xs uppercase font-bold text-[#C05D4D] tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  1. Basic Contact & Account Verification
                </h4>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAF9F6] text-[#7C6E62] font-semibold border border-[#E5E1DA] self-start sm:self-auto">
                  {role === 'artisan'
                    ? 'Artisan Seller (Mobile Only • No Email Required)'
                    : 'Craft Buyer (Mobile & Email Required • Verify Either via OTP)'}
                </span>
              </div>

              {role === 'artisan' ? (
                <div className="p-3 bg-[#FFF9F3] border border-[#F0D5B8] rounded-2xl flex items-start gap-2.5 text-xs text-[#7A4B16]">
                  <Phone className="w-4 h-4 text-[#C05D4D] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#4A3728]">Artisan Quick Registration:</strong> We only require your mobile number. Authenticate using SMS OTP below to verify that this is your number. No email needed!
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#F4F9F6] border border-[#D5E8DD] rounded-2xl flex items-start gap-2.5 text-xs text-[#2D5A3E]">
                  <ShieldCheck className="w-4 h-4 text-[#3A7B55] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1E432D]">Buyer Registration Requirements:</strong> Please provide both your mobile number and email address. You only need to authenticate <strong>either one</strong> using a 6-digit OTP to complete registration.
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={role === 'artisan' ? '' : 'sm:col-span-2'}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#7C6E62] uppercase">
                      Full Name *
                    </label>
                    <VoiceInputButton
                      fieldLabel="Full Name"
                      currentLanguage={voiceLanguage}
                      askPrompt={voicePromptsEnabled}
                      onTranscript={(val) => setFullName(val)}
                    />
                  </div>
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    placeholder={role === 'artisan' ? 'e.g. Lakshmi Devi' : 'e.g. Priya Sharma'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <label className="block text-xs font-bold text-[#7C6E62] uppercase">
                        Mobile Number *
                      </label>
                      <span className="text-[10px] text-[#7C6E62]">10 digits</span>
                    </div>
                    <VoiceInputButton
                      fieldLabel="Mobile Number"
                      currentLanguage={voiceLanguage}
                      askPrompt={voicePromptsEnabled}
                      isNumericOnly={true}
                      onTranscript={(val) => {
                        const clean = val.slice(-10);
                        setMobile(clean);
                      }}
                    />
                  </div>
                  <div className="relative">
                    <input
                      id="reg-mobile"
                      type="tel"
                      required
                      maxLength={14}
                      placeholder="e.g. 9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className={`w-full text-sm p-3 rounded-xl border bg-[#FAF9F6] text-[#4A3728] focus:outline-none transition-all ${
                        isMobileVerified
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : mobileStatus && !mobileStatus.allowed
                          ? 'border-rose-400 focus:ring-2 focus:ring-rose-500 bg-rose-50/30'
                          : mobileStatus && mobileStatus.allowed
                          ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-500'
                          : 'border-[#E5E1DA] focus:ring-2 focus:ring-[#C05D4D]'
                      }`}
                    />
                    {isMobileVerified && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md text-[11px] font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Real-time status feedback */}
                  {checkingMobile && (
                    <p className="text-[11px] text-[#7C6E62] mt-1.5 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 border-2 border-[#C05D4D] border-t-transparent rounded-full animate-spin"></span>
                      Checking mobile number availability...
                    </p>
                  )}

                  {mobileStatus && !mobileStatus.allowed && !checkingMobile && (
                    <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-1.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-bold text-rose-800">Registration Restricted</p>
                        <p className="text-[11px] leading-tight">{mobileStatus.message}</p>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-[#7C6E62] mt-1">
                    * Policy: A mobile number registered as a seller cannot be registered as a buyer and vice versa.
                  </p>
                </div>

                {/* BUYER ONLY: Email Address Field with real-time check & verified badge */}
                {role === 'buyer' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-[#7C6E62] uppercase">
                        Email Address *
                      </label>
                      <VoiceInputButton
                        fieldLabel="Email Address"
                        currentLanguage={voiceLanguage}
                        askPrompt={voicePromptsEnabled}
                        onTranscript={(val) => {
                          const cleanEmail = val
                            .toLowerCase()
                            .replace(/\s+at\s+/g, '@')
                            .replace(/\s+dot\s+/g, '.')
                            .replace(/\s+/g, '');
                          setEmail(cleanEmail);
                        }}
                      />
                    </div>
                    <div className="relative">
                      <input
                        id="reg-email"
                        type="email"
                        required
                        placeholder="e.g. priya@craftbuyer.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full text-sm p-3 rounded-xl border bg-[#FAF9F6] text-[#4A3728] focus:outline-none transition-all ${
                          isEmailVerified
                            ? 'border-emerald-500 bg-emerald-50/20'
                            : emailStatus && !emailStatus.allowed
                            ? 'border-rose-400 focus:ring-2 focus:ring-rose-500 bg-rose-50/30'
                            : emailStatus && emailStatus.allowed
                            ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-500'
                            : 'border-[#E5E1DA] focus:ring-2 focus:ring-[#C05D4D]'
                        }`}
                      />
                      {isEmailVerified && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md text-[11px] font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Real-time email check feedback */}
                    {checkingEmail && (
                      <p className="text-[11px] text-[#7C6E62] mt-1.5 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 border-2 border-[#C05D4D] border-t-transparent rounded-full animate-spin"></span>
                        Checking email address availability...
                      </p>
                    )}

                    {emailStatus && !emailStatus.allowed && !checkingEmail && (
                      <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-1.5 animate-fadeIn">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-bold text-rose-800">Registration Restricted</p>
                          <p className="text-[11px] leading-tight">{emailStatus.message}</p>
                        </div>
                      </div>
                    )}

                    <p className="text-[10px] text-[#7C6E62] mt-1">
                      * Policy: An email registered as a seller cannot be registered as a buyer and vice versa.
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#7C6E62] uppercase">
                      Password *
                    </label>
                    <VoiceInputButton
                      fieldLabel="Password"
                      currentLanguage={voiceLanguage}
                      askPrompt={voicePromptsEnabled}
                      onTranscript={(val) => {
                        const clean = val.replace(/\s+/g, '');
                        setPassword(clean);
                      }}
                    />
                  </div>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-sm p-3 pr-10 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C6E62] hover:text-[#4A3728]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#7C6E62] uppercase">
                      Confirm Password *
                    </label>
                    <VoiceInputButton
                      fieldLabel="Confirm Password"
                      currentLanguage={voiceLanguage}
                      askPrompt={voicePromptsEnabled}
                      onTranscript={(val) => {
                        const clean = val.replace(/\s+/g, '');
                        setConfirmPassword(clean);
                      }}
                    />
                  </div>
                  <div className="relative">
                    <input
                      id="reg-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full text-sm p-3 pr-10 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C6E62] hover:text-[#4A3728]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* ARTISAN MOBILE OTP AUTHENTICATION BOX */}
                {role === 'artisan' && (
                  <div className="sm:col-span-2">
                    {isMobileVerified ? (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fadeIn">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                              <span>Mobile Number Authenticated Successfully</span>
                              <span className="bg-emerald-200 text-emerald-800 text-[10px] px-2 py-0.2 rounded-full font-bold">
                                Verified
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-800 mt-0.5">
                              +91 {mobile.replace(/\D/g, '')} is verified via OTP. You can sign in using this mobile number and password anytime.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileVerified(false);
                            setVerifiedMobile('');
                            setOtp('');
                            setOtpSent(false);
                            setDemoOtpCode(null);
                          }}
                          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline self-start sm:self-auto shrink-0"
                        >
                          Change Number
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#F0D5B8] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#4A3728]">
                            <ShieldCheck className="w-4 h-4 text-[#C05D4D]" />
                            <span>Mobile OTP Verification *</span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                            Authentication Required
                          </span>
                        </div>

                        {!otpSent ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <p className="text-xs text-[#7A4B16]">
                              Click to receive a 6-digit OTP on <strong>+91 {mobile.replace(/\D/g, '') || 'your mobile'}</strong> to verify that this is your number.
                            </p>
                            <button
                              id="reg-send-otp-btn"
                              type="button"
                              onClick={() => handleSendOtp('mobile')}
                              disabled={otpSending || mobile.replace(/\D/g, '').length < 10 || (mobileStatus && !mobileStatus.allowed)}
                              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                            >
                              {otpSending ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  <span>Sending OTP...</span>
                                </>
                              ) : (
                                <>
                                  <KeyRound className="w-4 h-4 text-amber-200" />
                                  <span>Send 6-Digit OTP</span>
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3 pt-1">
                            {/* Demo/Preview helper */}
                            {demoOtpCode && (
                              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                                <span>
                                  Preview Mode OTP: <strong className="font-mono text-sm tracking-wider font-bold text-[#C05D4D]">{demoOtpCode}</strong> (or 123456)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOtp(demoOtpCode);
                                  }}
                                  className="text-[11px] font-bold text-amber-900 underline hover:text-black"
                                >
                                  Auto-fill OTP
                                </button>
                              </div>
                            )}

                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-bold text-[#7C6E62]">Enter 6-Digit OTP Code</span>
                              <VoiceInputButton
                                fieldLabel="OTP Code"
                                currentLanguage={voiceLanguage}
                                askPrompt={voicePromptsEnabled}
                                isNumericOnly={true}
                                onTranscript={(val) => {
                                  const clean = val.replace(/\D/g, '').slice(0, 6);
                                  setOtp(clean);
                                }}
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  id="reg-artisan-otp"
                                  type="text"
                                  maxLength={6}
                                  placeholder="Enter 6-digit OTP"
                                  value={otp}
                                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                  className="w-full text-center font-mono font-bold text-base tracking-widest p-2.5 rounded-xl border border-[#E5E1DA] bg-white text-[#2D241E] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                                />
                              </div>

                              <button
                                id="reg-verify-otp-btn"
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={otpVerifying || otp.trim().length < 4}
                                className="py-2.5 px-5 rounded-xl bg-[#C05D4D] hover:bg-[#A34E41] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
                              >
                                {otpVerifying ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    <span>Verifying...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                    <span>Verify Mobile Number</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {otpError && (
                              <p className="text-xs font-semibold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                                {otpError}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-[11px] pt-0.5 text-[#7C6E62]">
                              <span>Didn't receive the SMS code?</span>
                              <button
                                type="button"
                                disabled={resendCountdown > 0 || otpSending}
                                onClick={() => handleSendOtp('mobile')}
                                className="font-bold text-[#C05D4D] hover:underline disabled:opacity-50 disabled:no-underline"
                              >
                                {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : 'Resend Code'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* BUYER DUAL-CHANNEL OTP AUTHENTICATION BOX (Verify EITHER Mobile OR Email) */}
                {role === 'buyer' && (
                  <div className="sm:col-span-2">
                    {isMobileVerified || isEmailVerified ? (
                      <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fadeIn">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                              <span>
                                {isEmailVerified ? 'Email Address Authenticated via OTP' : 'Mobile Number Authenticated via OTP'}
                              </span>
                              <span className="bg-emerald-200 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                Requirement Satisfied ✓
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-800 mt-0.5">
                              {isEmailVerified
                                ? `Email ${verifiedEmail || email} is verified with OTP. You have satisfied the verification requirement!`
                                : `Mobile +91 ${verifiedMobile || mobile.replace(/\D/g, '')} is verified with OTP. You have satisfied the verification requirement!`}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (isEmailVerified) {
                              setIsEmailVerified(false);
                              setVerifiedEmail('');
                            } else {
                              setIsMobileVerified(false);
                              setVerifiedMobile('');
                            }
                            setOtp('');
                            setOtpSent(false);
                            setDemoOtpCode(null);
                          }}
                          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline self-start sm:self-auto shrink-0"
                        >
                          Change / Re-verify
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF9F3] border border-[#F0D5B8] space-y-4 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#4A3728]">
                            <ShieldCheck className="w-4 h-4 text-[#C05D4D]" />
                            <span>Identity OTP Authentication *</span>
                          </div>
                          <span className="self-start sm:self-auto text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                            Verify Either 1 of 2
                          </span>
                        </div>

                        <p className="text-xs text-[#7A4B16]">
                          As a Buyer, choose whether you want to authenticate with <strong>Mobile Number OTP</strong> or <strong>Email Address OTP</strong> to confirm your registration:
                        </p>

                        {/* Option Selector Tabs */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-[#F4EDE4] rounded-xl">
                          <button
                            type="button"
                            id="buyer-otp-tab-mobile"
                            onClick={() => {
                              setBuyerAuthMethod('mobile');
                              setOtp('');
                              setOtpSent(false);
                              setDemoOtpCode(null);
                              setOtpError(null);
                            }}
                            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                              buyerAuthMethod === 'mobile'
                                ? 'bg-white text-[#C05D4D] shadow-xs'
                                : 'text-[#7C6E62] hover:text-[#4A3728]'
                            }`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Mobile OTP</span>
                            {mobile.replace(/\D/g, '').length >= 10 && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono">
                                +91 {mobile.replace(/\D/g, '').slice(-4)}
                              </span>
                            )}
                          </button>

                          <button
                            type="button"
                            id="buyer-otp-tab-email"
                            onClick={() => {
                              setBuyerAuthMethod('email');
                              setOtp('');
                              setOtpSent(false);
                              setDemoOtpCode(null);
                              setOtpError(null);
                            }}
                            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                              buyerAuthMethod === 'email'
                                ? 'bg-white text-[#C05D4D] shadow-xs'
                                : 'text-[#7C6E62] hover:text-[#4A3728]'
                            }`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email OTP</span>
                            {email.trim() && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded truncate max-w-[80px]">
                                {email.split('@')[0]}
                              </span>
                            )}
                          </button>
                        </div>

                        {/* OTP Action Area */}
                        {!otpSent ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <div className="text-xs text-[#7A4B16]">
                              {buyerAuthMethod === 'mobile' ? (
                                <span>
                                  Send a 6-digit SMS OTP to <strong>+91 {mobile.replace(/\D/g, '') || 'your mobile number'}</strong>.
                                </span>
                              ) : (
                                <span>
                                  Send a 6-digit verification code to <strong>{email.trim() || 'your email address'}</strong>.
                                </span>
                              )}
                            </div>

                            <button
                              id="buyer-send-otp-btn"
                              type="button"
                              onClick={() => handleSendOtp(buyerAuthMethod)}
                              disabled={
                                otpSending ||
                                (buyerAuthMethod === 'mobile'
                                  ? mobile.replace(/\D/g, '').length < 10 || (mobileStatus && !mobileStatus.allowed)
                                  : !email.trim() || !/\S+@\S+\.\S+/.test(email) || (emailStatus && !emailStatus.allowed))
                              }
                              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                            >
                              {otpSending ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  <span>Sending OTP...</span>
                                </>
                              ) : (
                                <>
                                  <KeyRound className="w-4 h-4 text-amber-200" />
                                  <span>Send {buyerAuthMethod === 'mobile' ? 'Mobile' : 'Email'} OTP</span>
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3 pt-1">
                            {/* Demo/Preview helper */}
                            {demoOtpCode && (
                              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                                <span>
                                  Preview Mode {activeOtpChannel === 'email' ? 'Email' : 'Mobile'} OTP: <strong className="font-mono text-sm tracking-wider font-bold text-[#C05D4D]">{demoOtpCode}</strong> (or 123456)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOtp(demoOtpCode);
                                  }}
                                  className="text-[11px] font-bold text-amber-900 underline hover:text-black"
                                >
                                  Auto-fill OTP
                                </button>
                              </div>
                            )}

                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-bold text-[#7C6E62]">
                                Enter 6-Digit {activeOtpChannel === 'email' ? 'Email' : 'Mobile'} OTP
                              </span>
                              <VoiceInputButton
                                fieldLabel="OTP Code"
                                currentLanguage={voiceLanguage}
                                askPrompt={voicePromptsEnabled}
                                isNumericOnly={true}
                                onTranscript={(val) => {
                                  const clean = val.replace(/\D/g, '').slice(0, 6);
                                  setOtp(clean);
                                }}
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  id="reg-buyer-otp"
                                  type="text"
                                  maxLength={6}
                                  placeholder={`Enter 6-digit ${activeOtpChannel === 'email' ? 'Email' : 'Mobile'} OTP`}
                                  value={otp}
                                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                  className="w-full text-center font-mono font-bold text-base tracking-widest p-2.5 rounded-xl border border-[#E5E1DA] bg-white text-[#2D241E] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                                />
                              </div>

                              <button
                                id="reg-buyer-verify-otp-btn"
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={otpVerifying || otp.trim().length < 4}
                                className="py-2.5 px-5 rounded-xl bg-[#C05D4D] hover:bg-[#A34E41] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
                              >
                                {otpVerifying ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    <span>Verifying...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                    <span>Verify {activeOtpChannel === 'email' ? 'Email' : 'Mobile'} OTP</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {otpError && (
                              <p className="text-xs font-semibold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                                {otpError}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-[11px] pt-0.5 text-[#7C6E62]">
                              <span>Didn't receive the {activeOtpChannel === 'email' ? 'email' : 'SMS'} code?</span>
                              <button
                                type="button"
                                disabled={resendCountdown > 0 || otpSending}
                                onClick={() => handleSendOtp(activeOtpChannel)}
                                className="font-bold text-[#C05D4D] hover:underline disabled:opacity-50 disabled:no-underline"
                              >
                                {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : 'Resend Code'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ARTISAN SPECIFIC FIELDS */}
            {role === 'artisan' && (
              <>
                {/* Language & Location */}
                <div className="border-b border-[#F0EDEA] pb-5 space-y-4">
                  <h4 className="text-xs uppercase font-bold text-[#C05D4D] tracking-wider">
                    2. Mother Tongue & Artisan Region
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-[#7C6E62] uppercase">
                          Preferred Language
                        </label>
                        <VoiceInputButton
                          fieldLabel="Language"
                          currentLanguage={voiceLanguage}
                          askPrompt={voicePromptsEnabled}
                          options={ALL_SUPPORTED_LANGUAGES.map((l) => `${l.nativeName} ${l.label}`)}
                          onTranscript={(val) => {
                            const found = ALL_SUPPORTED_LANGUAGES.find(
                              (l) =>
                                val.toLowerCase().includes(l.label.toLowerCase()) ||
                                val.toLowerCase().includes(l.nativeName.toLowerCase()) ||
                                l.label.toLowerCase().includes(val.toLowerCase())
                            );
                            if (found) {
                              setPreferredLanguage(found.code);
                              setVoiceLanguage(found.code);
                            }
                          }}
                        />
                      </div>
                      <select
                        id="reg-language"
                        value={preferredLanguage}
                        onChange={(e) => {
                          setPreferredLanguage(e.target.value);
                          setVoiceLanguage(e.target.value);
                        }}
                        className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                      >
                        {ALL_SUPPORTED_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.nativeName} ({lang.label})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-[#7C6E62] uppercase">
                          State
                        </label>
                        <VoiceInputButton
                          fieldLabel="State"
                          currentLanguage={voiceLanguage}
                          askPrompt={voicePromptsEnabled}
                          options={indianStates}
                          onTranscript={(val) => setArtisanState(val)}
                        />
                      </div>
                      <select
                        id="reg-state"
                        value={artisanState}
                        onChange={(e) => setArtisanState(e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                      >
                        {indianStates.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-[#7C6E62] uppercase">
                          District
                        </label>
                        <VoiceInputButton
                          fieldLabel="District"
                          currentLanguage={voiceLanguage}
                          askPrompt={voicePromptsEnabled}
                          onTranscript={(val) => setArtisanDistrict(val)}
                        />
                      </div>
                      <input
                        id="reg-district"
                        type="text"
                        required
                        placeholder="e.g. Visakhapatnam"
                        value={artisanDistrict}
                        onChange={(e) => setArtisanDistrict(e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Craft Heritage */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-bold text-[#C05D4D] tracking-wider">
                    3. Craft Heritage & Group
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-[#7C6E62] uppercase">
                          Primary Craft Type
                        </label>
                        <VoiceInputButton
                          fieldLabel="Craft Type"
                          currentLanguage={voiceLanguage}
                          askPrompt={voicePromptsEnabled}
                          options={craftCategories}
                          onTranscript={(val) => setCraftType(val)}
                        />
                      </div>
                      <select
                        id="reg-craft"
                        value={craftType}
                        onChange={(e) => setCraftType(e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                      >
                        {craftCategories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-[#7C6E62] uppercase">
                          Cooperative / SHG Name (Optional)
                        </label>
                        <VoiceInputButton
                          fieldLabel="Cooperative Name"
                          currentLanguage={voiceLanguage}
                          askPrompt={voicePromptsEnabled}
                          onTranscript={(val) => setCooperativeName(val)}
                        />
                      </div>
                      <input
                        id="reg-coop"
                        type="text"
                        placeholder="e.g. Giri Jan Kalyan Bamboo Producers"
                        value={cooperativeName}
                        onChange={(e) => setCooperativeName(e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* BUYER SPECIFIC FIELDS */}
            {role === 'buyer' && (
              <>
                {/* Location & Delivery */}
                <div className="border-b border-[#F0EDEA] pb-5 space-y-4">
                  <h4 className="text-xs uppercase font-bold text-[#C05D4D] tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    2. Location & Shipping Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-[#7C6E62] uppercase">
                          City / Town *
                        </label>
                        <VoiceInputButton
                          fieldLabel="City"
                          currentLanguage={voiceLanguage}
                          askPrompt={voicePromptsEnabled}
                          onTranscript={(val) => setBuyerCity(val)}
                        />
                      </div>
                      <input
                        id="reg-buyer-city"
                        type="text"
                        required
                        placeholder="e.g. Hyderabad, Bengaluru, Delhi"
                        value={buyerCity}
                        onChange={(e) => setBuyerCity(e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-[#7C6E62] uppercase">
                          State *
                        </label>
                        <VoiceInputButton
                          fieldLabel="State"
                          currentLanguage={voiceLanguage}
                          askPrompt={voicePromptsEnabled}
                          options={indianStates}
                          onTranscript={(val) => setBuyerState(val)}
                        />
                      </div>
                      <select
                        id="reg-buyer-state"
                        value={buyerState}
                        onChange={(e) => setBuyerState(e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                      >
                        {indianStates.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-[#7C6E62] uppercase flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-[#C05D4D]" />
                          Delivery Address (Optional)
                        </label>
                        <VoiceInputButton
                          fieldLabel="Delivery Address"
                          currentLanguage={voiceLanguage}
                          askPrompt={voicePromptsEnabled}
                          onTranscript={(val) => setDeliveryAddress(val)}
                        />
                      </div>
                      <input
                        id="reg-buyer-address"
                        type="text"
                        placeholder="e.g. Flat 402, Green Meadows, Banjara Hills"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Craft Categories Preference */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-bold text-[#C05D4D] tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    3. Categories You Are Interested In
                  </h4>
                  <p className="text-xs text-[#7C6E62]">
                    Select the handmade craft categories you want to browse and purchase:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {craftCategories.map((cat) => {
                      const selected = interestedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleBuyerCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            selected
                              ? 'bg-[#C05D4D] text-white font-bold shadow-xs'
                              : 'bg-[#FAF9F6] text-[#4A3728] border border-[#E5E1DA] hover:bg-[#F0EDEA]'
                          }`}
                        >
                          {selected ? '✓ ' : '+ '}
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <button
              id="reg-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {loading
                  ? 'Creating Account...'
                  : role === 'artisan'
                  ? 'Complete Artisan Registration'
                  : 'Complete Buyer Registration'}
              </span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#F0EDEA] text-center">
            <p className="text-xs text-[#7C6E62]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="font-bold text-[#C05D4D] hover:underline"
              >
                Sign In →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
