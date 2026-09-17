import React from 'react';
import {
  Camera,
  Mic,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe2,
  TrendingUp,
  Building2,
  Award,
  CheckCircle2,
  ShoppingBag,
  Store
} from 'lucide-react';
import { SAMPLE_BAMBOO_BASKET_IMAGE } from '../data/samples';
import { useI18n } from '../i18n/I18nContext';

interface LandingPageProps {
  onNavigate: (page: string, params?: any) => void;
  onQuickDemoLogin?: () => void;
  onLaunchDemoCatalog?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onQuickDemoLogin,
  onLaunchDemoCatalog
}) => {
  const { t } = useI18n();

  const handleDemoLogin = () => {
    if (onLaunchDemoCatalog) {
      onLaunchDemoCatalog();
    } else if (onQuickDemoLogin) {
      onQuickDemoLogin();
    } else {
      onNavigate('login');
    }
  };
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D241E]">
      {/* Cultural Heritage Preservation Banner */}
      <div className="bg-[#2D241E] text-[#FAF9F6] text-xs py-2.5 px-4 border-b border-[#4A3728]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#C05D4D] text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
              AUTHENTIC HERITAGE
            </span>
            <span className="font-semibold text-stone-100">Preserving Indian Traditional Crafts</span>
            <span className="hidden sm:inline text-stone-300">• Direct Artisan Empowerment</span>
          </div>
          <div className="text-stone-200 text-[11px] flex items-center gap-1.5 font-medium">
            <Award className="w-3.5 h-3.5 text-[#C05D4D]" />
            AI-Driven Market Linkage & Smart Cataloging for Marginalized Artisans
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#E5E1DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C05D4D0D] border border-[#C05D4D22] text-[#C05D4D] text-xs sm:text-sm font-semibold">
                <Sparkles className="w-4 h-4 text-[#C05D4D]" />
                AI-Powered Digital Selling Assistant for Artisans
              </div>

              <h1 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#4A3728] leading-[1.15]">
                One Photo. One Voice. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C05D4D] to-[#A34E41]">
                  Market Ready.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#7C6E62] leading-relaxed max-w-2xl">
                Marginalized artisans possess immense craft mastery but face steep digital barriers. CraftWise transforms a single phone photo and a short voice description in their mother tongue into a complete professional digital selling kit and connects them with institutional buyers.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  type="button"
                  id="hero-create-product-btn"
                  onClick={() => onNavigate('add-product')}
                  className="px-6 py-4 rounded-xl bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white font-bold text-base shadow-lg shadow-[#C05D4D22] transition-all flex items-center justify-center gap-2 group"
                >
                  <Store className="w-5 h-5" />
                  <span>Artisan: + {t('nav_create_catalog')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  id="hero-browse-marketplace-btn"
                  onClick={() => onNavigate('marketplace')}
                  className="px-6 py-4 rounded-xl bg-[#4A3728] hover:bg-[#382a1f] text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5 text-orange-200" />
                  <span>Buyer: Explore Crafts by Category</span>
                </button>

                <button
                  type="button"
                  id="hero-register-btn"
                  onClick={() => onNavigate('register')}
                  className="px-5 py-4 rounded-xl bg-white hover:bg-[#FDFBF7] text-[#4A3728] font-semibold text-sm sm:text-base border border-[#E5E1DA] shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#C05D4D]" />
                  <span>Register (Artisan or Buyer)</span>
                </button>
              </div>

              {/* Instant Demo Feature Callout for Artisans who just want a catalog image */}
              <div className="pt-2">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF9F3] to-[#FFF4EA] border border-[#F0D9C5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C05D4D] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Sparkles className="w-5 h-5 text-amber-200" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#C05D4D] uppercase tracking-wider">
                          Instant Demo • No Login Required
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Zero Barrier
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#4A3728] mt-0.5">
                        Only want to generate the catalog image?
                      </h3>
                      <p className="text-xs text-[#7C6E62]">
                        Directly use CraftWise with the <strong>Catalog Image Generator</strong> demo account. No registration or credentials needed!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    id="landing-launch-catalog-demo-btn"
                    onClick={onLaunchDemoCatalog || (() => onNavigate('add-product'))}
                    className="px-4 py-2.5 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Generate Catalog Image (Demo)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Trust & Scope Badge */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-[#7C6E62]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Authenticity Guard (No AI Hallucinations)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-[#C05D4D]" />
                  9 Indian Regional Languages Native
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#4A3728]" />
                  GeM, TRIFED & ONDC Ready
                </span>
              </div>
            </div>

            {/* Right Interactive Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-xl border border-[#E5E1DA]">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EDEA]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-[#4A3728]">Live AI Selling Kit Preview</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#C05D4D] bg-[#C05D4D0D] px-2.5 py-0.5 rounded border border-[#C05D4D22]">
                    Visakhapatnam Bamboo
                  </span>
                </div>

                <div className="mt-4 rounded-2xl overflow-hidden bg-[#FAF9F6] aspect-square relative group border border-[#E5E1DA]">
                  <img
                    src={SAMPLE_BAMBOO_BASKET_IMAGE}
                    alt="Handcrafted Bamboo Basket"
                    className="w-full h-full object-contain p-2"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-[#4A3728]/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" /> Enhanced Studio Presentation
                  </div>
                  <div className="absolute bottom-3 right-3 bg-[#C05D4D] text-white font-bold text-sm px-3.5 py-1 rounded-xl shadow-md">
                    ₹420
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-xs text-[#C05D4D] font-bold uppercase tracking-wider">
                    Handmade Bamboo & Cane
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#4A3728]">
                    Handcrafted Traditional Bamboo Storage Basket
                  </h4>
                  <p className="text-xs text-[#7C6E62] leading-relaxed">
                    “100% natural hill bamboo split by hand. Over 3 hours of artisan weaving by Lakshmi in Visakhapatnam.”
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-[#F0EDEA] text-[#7C6E62]">
                    <span>{t('rev_multilingual_title')}</span>
                    <button
                      type="button"
                      onClick={() => onNavigate('public-product', { slug: 'handcrafted-bamboo-basket-visakha1' })}
                      className="text-[#C05D4D] font-bold hover:underline flex items-center gap-1"
                    >
                      {t('common_view')} →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Core Workflow Section */}
      <section className="py-16 sm:py-20 bg-[#FAF9F6] border-b border-[#E5E1DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C05D4D] bg-[#C05D4D0D] px-3 py-1 rounded-full border border-[#C05D4D22]">
              The Artisan Experience
            </span>
            <h2 className="font-serif italic text-3xl sm:text-4xl font-bold text-[#4A3728] mt-3">
              How CraftWise Solves the Digital Divide
            </h2>
            <p className="text-[#7C6E62] text-sm sm:text-base mt-2">
              No typing needed. No photography equipment. No complex dashboards. Designed for artisans with basic smartphones and zero technical background.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E1DA] shadow-xs relative hover:border-[#C05D4D55] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#F4F1ED] text-[#C05D4D] flex items-center justify-center font-bold text-lg mb-4">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-[#7C6E62] uppercase tracking-wider">Step 1</span>
              <h3 className="text-lg font-bold text-[#4A3728] mt-1">1. Take One Photo</h3>
              <p className="text-xs text-[#7C6E62] mt-2 leading-relaxed">
                The artisan captures a photo on their phone. CraftWise automatically balances lighting, cleans up the backdrop, and sharpens handcraft textures.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E1DA] shadow-xs relative hover:border-[#C05D4D55] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#F4F1ED] text-[#C05D4D] flex items-center justify-center font-bold text-lg mb-4">
                <Mic className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-[#7C6E62] uppercase tracking-wider">Step 2</span>
              <h3 className="text-lg font-bold text-[#4A3728] mt-1">2. Speak in Mother Tongue</h3>
              <p className="text-xs text-[#7C6E62] mt-2 leading-relaxed">
                The artisan taps one large mic button and speaks in Telugu, Hindi, or their mother tongue. They describe the craft, materials, and time spent.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E1DA] shadow-xs relative hover:border-[#C05D4D55] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#F4F1ED] text-[#C05D4D] flex items-center justify-center font-bold text-lg mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-[#7C6E62] uppercase tracking-wider">Step 3</span>
              <h3 className="text-lg font-bold text-[#4A3728] mt-1">3. AI Selling Kit Ready</h3>
              <p className="text-xs text-[#7C6E62] mt-2 leading-relaxed">
                Multimodal AI generates titles, storytelling descriptions, 3-language translations, WhatsApp message copy, and fair pricing estimates.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E1DA] shadow-xs relative hover:border-[#C05D4D55] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#F4F1ED] text-[#C05D4D] flex items-center justify-center font-bold text-lg mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-[#7C6E62] uppercase tracking-wider">Step 4</span>
              <h3 className="text-lg font-bold text-[#4A3728] mt-1">4. Market Linkage</h3>
              <p className="text-xs text-[#7C6E62] mt-2 leading-relaxed">
                Artisan reviews and approves. The product is published with a shareable digital card, QR link, and matched to GeM, TRIFED, and institutional buyers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Purpose: NOT an Amazon clone */}
      <section className="py-16 bg-white border-b border-[#E5E1DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C05D4D] bg-[#C05D4D0D] px-3 py-1 rounded-full border border-[#C05D4D22]">
                Core Purpose & Ethics
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#4A3728] mt-3 leading-snug">
                Why CraftWise is an Assistant, <br />
                Not an Extractive Marketplace
              </h2>
              <p className="text-[#7C6E62] text-sm mt-3 leading-relaxed">
                Traditional e-commerce platforms force rural artisans to navigate complex commission structures, shipping logistics, and listing hierarchies that favor mass-produced factories.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm text-[#4A3728]">Empowers Artisan Independence:</strong>
                    <p className="text-xs text-[#7C6E62] mt-0.5">Artisans own their digital selling kit, share direct WhatsApp links, and receive 100% of customer payments directly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm text-[#4A3728]">Strict Authenticity Guard:</strong>
                    <p className="text-xs text-[#7C6E62] mt-0.5">AI is grounded only in the artisan’s photo and words. It never fabricates certifications, awards, or fake claims.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm text-[#4A3728]">Artisan Approval Mandate:</strong>
                    <p className="text-xs text-[#7C6E62] mt-0.5">AI assists but NEVER automatically publishes. The artisan must review and approve every single product.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-[#FDFBF7] rounded-2xl border border-[#E5E1DA] p-6">
              <h4 className="font-bold text-sm text-[#4A3728] uppercase tracking-wider mb-4">
                Comparison: Generic E-Commerce vs. CraftWise
              </h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#E5E1DA]">
                  <span className="font-bold text-red-700">Generic Marketplace:</span>
                  <p className="text-[#7C6E62] mt-0.5">Demands English typing, high studio fees, 25-30% platform commissions, algorithmic suppression of small sellers.</p>
                </div>

                <div className="p-3 bg-[#C05D4D0D] rounded-xl border border-[#C05D4D22]">
                  <span className="font-bold text-[#C05D4D]">CraftWise:</span>
                  <p className="text-[#4A3728] mt-0.5 font-medium">Voice in mother tongue, automated photo lighting, zero platform commission, direct UPI buyer connection, and official government procurement linkages.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-gradient-to-br from-[#4A3728] to-[#2D241E] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="inline-block px-3 py-1 bg-[#C05D4D] text-white rounded-full text-xs font-semibold shadow-xs">
            Empowering Rural & Tribal Artisans
          </span>
          <h2 className="font-serif italic text-3xl sm:text-4xl font-bold tracking-tight">
            Empower India’s Heritage Artisans Today
          </h2>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Experience how Lakshmi from Visakhapatnam turned a handwoven bamboo basket into a market-ready digital kit in under 60 seconds.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              id="cta-start-btn"
              onClick={() => onNavigate('add-product')}
              className="px-8 py-4 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] text-white font-bold rounded-xl shadow-lg shadow-[#C05D4D22] hover:opacity-95 transition-all text-base"
            >
              + Create Product with AI
            </button>
            <button
              type="button"
              id="cta-demo-btn"
              onClick={handleDemoLogin}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 text-base transition-colors"
            >
              Artisan Dashboard (Lakshmi)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
