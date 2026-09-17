import React, { useState } from 'react';
import { Sparkles, LogIn, ArrowRight, ShieldCheck, Eye, EyeOff, KeyRound, Smartphone, RefreshCw, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { api, authState } from '../api';

interface LoginPageProps {
  onLoginSuccess: (user: any, profile?: any) => void;
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  // Mode: 'password' | 'otp' | 'forgot_password'
  const [mode, setMode] = useState<'password' | 'otp' | 'forgot_password'>('password');

  // Common fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Login state
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  const [otpRecipientInfo, setOtpRecipientInfo] = useState<string>('');

  // Password reset state
  const [resetOtp, setResetOtp] = useState('');
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [receivedResetOtp, setReceivedResetOtp] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Instant 1-Click Demo Login for Catalog Image Generator
  const handleDemoCatalogLogin = async () => {
    setError(null);
    setDemoLoading(true);
    try {
      const res = await api.demoCatalogLogin();
      authState.setSession(res.token, res.user, res.profile);
      onLoginSuccess(res.user, res.profile);
      onNavigate('add-product');
    } catch (err: any) {
      console.error('Failed demo login:', err);
      setError('Could not connect to demo account. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  // Standard Password Login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await api.login(identifier, password);
      authState.setSession(res.token, res.user, res.profile);
      onLoginSuccess(res.user, res.profile);
    } catch (err: any) {
      const msg = err.message || 'Login failed.';
      if (msg.toLowerCase().includes('password')) {
        setError('Invalid password. Please check your spelling and capitalization using the eye icon (👁️), or click "Forgot Password? Reset Here" below to set a new password, or switch to "Mobile OTP Login".');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Send OTP for Mobile OTP Login
  const handleSendLoginOtp = async () => {
    if (!identifier.trim()) {
      setError('Please enter your registered mobile number or email.');
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await api.sendOtp(identifier.trim());
      setOtpSent(true);
      setReceivedOtp(res.otp);
      setOtp(res.otp); // Pre-fill for instant convenience in demo/rural usability
      setOtpRecipientInfo(res.mobileMasked || res.emailMasked || identifier);
      setSuccessMessage(`OTP sent to ${res.mobileMasked || res.emailMasked || identifier}. Enter the 6-digit code below.`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please check your mobile or email.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & Login
  const handleVerifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await api.verifyOtpLogin(identifier.trim(), otp.trim());
      authState.setSession(res.token, res.user, res.profile);
      onLoginSuccess(res.user, res.profile);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP for Password Reset
  const handleSendResetOtp = async () => {
    if (!identifier.trim()) {
      setError('Please enter your registered mobile number or email to receive a password reset OTP.');
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await api.sendOtp(identifier.trim());
      setResetOtpSent(true);
      setReceivedResetOtp(res.otp);
      setResetOtp(res.otp); // Pre-fill for friction-free reset
      setOtpRecipientInfo(res.mobileMasked || res.emailMasked || identifier);
      setSuccessMessage(`Verification OTP sent for ${res.artisanName || 'your account'}. Set your new password below.`);
    } catch (err: any) {
      setError(err.message || 'Could not find an account with that mobile number or email.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Password Reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await api.resetPassword(identifier.trim(), resetOtp.trim(), newPassword.trim());
      authState.setSession(res.token, res.user, res.profile);
      onLoginSuccess(res.user, res.profile);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  // One-click demo logins
  const handleQuickDemoLogin = async (mobile: string, pass: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await api.login(mobile, pass);
      authState.setSession(res.token, res.user, res.profile);
      onLoginSuccess(res.user, res.profile);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Header Logo */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C05D4D] to-[#A34E41] text-white flex items-center justify-center mx-auto shadow-xs mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-serif italic text-3xl font-bold text-[#4A3728] tracking-tight">
            Artisan Portal Login
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#7C6E62]">
            Access your catalog, AI selling kits, customer enquiries, and direct payouts.
          </p>
        </div>

        {/* Instant Demo Account Callout Card for Artisans */}
        <div className="mt-6 bg-[#FFF9F3] rounded-3xl border border-[#F0D5B8] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C05D4D]" />
              <span className="text-xs font-bold text-[#C05D4D] uppercase tracking-wider">
                Instant Catalog Image Generator Demo
              </span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              No Login Needed
            </span>
          </div>

          <p className="text-xs text-[#7A4B16] leading-relaxed mb-3">
            If you only want to generate the catalog image, you <strong>do not need to log in or register</strong>! Use our demo account naming <strong>Catalog Image Generator</strong> to directly access CraftWise right now:
          </p>

          <button
            type="button"
            id="login-as-catalog-generator-demo-btn"
            disabled={demoLoading}
            onClick={handleDemoCatalogLogin}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#C05D4D22] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {demoLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-200" />
            )}
            <span>
              {demoLoading ? 'Entering Demo Account...' : '✨ Enter as Catalog Image Generator (Instant Access)'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Clean State Callout Card */}
        <div className="mt-6 bg-[#FAF9F6] rounded-3xl border border-[#E5E1DA] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-[#4A3728] uppercase tracking-wider">
                Create New Account
              </span>
            </div>
            <span className="text-[10px] font-bold bg-[#C05D4D] text-white px-2 py-0.5 rounded">
              Ready
            </span>
          </div>

          <p className="text-xs text-[#7C6E62] mb-3">
            All previous accounts have been cleared. Register fresh as an Artisan (Seller) or a Buyer:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              id="register-as-artisan-btn"
              onClick={() => onNavigate('register')}
              className="py-2.5 px-3 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-200 shrink-0" />
              <span>Register as Artisan (Seller)</span>
            </button>

            <button
              type="button"
              id="register-as-buyer-btn"
              onClick={() => onNavigate('register')}
              className="py-2.5 px-3 bg-[#4A3728] hover:bg-[#382a1f] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-orange-200 shrink-0" />
              <span>Register as Buyer</span>
            </button>
          </div>
        </div>

        {/* Main Auth Container */}
        <div className="mt-6 bg-white py-6 px-6 shadow-xs rounded-3xl border border-[#E5E1DA] sm:px-10">
          {/* Method Tabs */}
          {mode !== 'forgot_password' && (
            <div className="flex rounded-xl bg-[#FAF9F6] p-1 border border-[#E5E1DA] mb-6">
              <button
                type="button"
                id="tab-password-login"
                onClick={() => { setMode('password'); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'password'
                    ? 'bg-white text-[#C05D4D] shadow-xs'
                    : 'text-[#7C6E62] hover:text-[#4A3728]'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Password Login</span>
              </button>
              <button
                type="button"
                id="tab-otp-login"
                onClick={() => { setMode('otp'); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'otp'
                    ? 'bg-white text-[#C05D4D] shadow-xs'
                    : 'text-[#7C6E62] hover:text-[#4A3728]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile OTP Login</span>
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. PASSWORD LOGIN FORM */}
          {/* ========================================================================= */}
          {mode === 'password' && (
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div>
                <label className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider mb-1">
                  Registered Mobile Number or Email
                </label>
                <input
                  id="login-identifier-input"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 9876543210 or name@example.com"
                  className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_password'); setError(null); setSuccessMessage(null); }}
                    className="text-xs font-bold text-[#C05D4D] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full text-sm p-3 pr-10 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C6E62] hover:text-[#4A3728]"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-[#7C6E62]">
                  Tip: Use the eye icon to verify spelling. Mobile keyboards may auto-capitalize the first letter.
                </p>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Verifying...' : 'Sign In with Password'}</span>
              </button>

              <div className="p-3 bg-[#FBF9F5] border border-[#EBE7DF] rounded-xl text-center">
                <p className="text-xs text-[#7C6E62]">
                  Having trouble with your password?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_password'); setError(null); }}
                    className="font-bold text-[#C05D4D] underline hover:text-[#923e32]"
                  >
                    Reset Password
                  </button>
                  {' '}or{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('otp'); setError(null); }}
                    className="font-bold text-[#C05D4D] underline hover:text-[#923e32]"
                  >
                    Sign In with Mobile OTP
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 2. MOBILE OTP LOGIN FORM */}
          {/* ========================================================================= */}
          {mode === 'otp' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider mb-1">
                  Registered Mobile Number or Email
                </label>
                <div className="flex gap-2">
                  <input
                    id="otp-identifier-input"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 9876543210 or name@example.com"
                    className="flex-1 text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                  />
                  <button
                    type="button"
                    onClick={handleSendLoginOtp}
                    disabled={loading || !identifier.trim()}
                    className="px-4 py-3 bg-[#4A3728] hover:bg-[#382a1e] text-white text-xs font-bold rounded-xl whitespace-nowrap disabled:opacity-50"
                  >
                    {otpSent ? 'Resend OTP' : 'Get OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <form onSubmit={handleVerifyOtpLogin} className="space-y-4 pt-2">
                  {/* Simulated SMS notification display */}
                  {receivedOtp && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-900 uppercase">Simulated SMS / OTP Notification</span>
                        <span className="text-xs font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                          {receivedOtp}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 mt-1">
                        Use this 6-digit OTP code to sign in directly without needing your password.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider mb-1">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      id="otp-code-input"
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="e.g. 458921"
                      className="w-full text-center text-xl tracking-widest font-mono p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                    />
                  </div>

                  <button
                    id="verify-otp-login-btn"
                    type="submit"
                    disabled={loading || otp.length < 4}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{loading ? 'Verifying OTP...' : 'Verify & Sign In'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. FORGOT / RESET PASSWORD VIEW */}
          {/* ========================================================================= */}
          {mode === 'forgot_password' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0EDEA] pb-3 mb-2">
                <h3 className="text-sm font-bold text-[#4A3728] flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#C05D4D]" />
                  <span>Reset Your Password</span>
                </h3>
                <button
                  type="button"
                  onClick={() => { setMode('password'); setError(null); setSuccessMessage(null); }}
                  className="text-xs font-bold text-[#7C6E62] hover:text-[#4A3728]"
                >
                  ← Back to Login
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider mb-1">
                  Registered Mobile Number or Email
                </label>
                <div className="flex gap-2">
                  <input
                    id="reset-identifier-input"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 9876543210 or name@example.com"
                    className="flex-1 text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                  />
                  <button
                    type="button"
                    onClick={handleSendResetOtp}
                    disabled={loading || !identifier.trim()}
                    className="px-4 py-3 bg-[#4A3728] hover:bg-[#382a1e] text-white text-xs font-bold rounded-xl whitespace-nowrap disabled:opacity-50"
                  >
                    {resetOtpSent ? 'Resend Code' : 'Send Code'}
                  </button>
                </div>
              </div>

              {resetOtpSent && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4 pt-1">
                  {receivedResetOtp && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-900 uppercase">Verification Code</span>
                        <span className="text-xs font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                          {receivedResetOtp}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 mt-1">
                        Enter this code and choose your new password below.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider mb-1">
                      Verification Code (OTP)
                    </label>
                    <input
                      id="reset-otp-input"
                      type="text"
                      maxLength={6}
                      required
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      placeholder="6-digit OTP code"
                      className="w-full text-center text-lg tracking-widest font-mono p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="reset-new-password-input"
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        className="w-full text-sm p-3 pr-10 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C6E62] hover:text-[#4A3728]"
                        title={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="submit-reset-password-btn"
                    type="submit"
                    disabled={loading || !newPassword}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? 'Updating Password...' : 'Save New Password & Sign In'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Registration Navigation */}
          <div className="mt-6 pt-4 border-t border-[#F0EDEA] text-center">
            <p className="text-xs text-[#7C6E62]">
              New to CraftWise?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="font-bold text-[#C05D4D] hover:underline"
              >
                Register as an Artisan or Buyer →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
