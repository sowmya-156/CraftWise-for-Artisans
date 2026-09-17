import React from 'react';
import { ShieldCheck, Award, Sparkles, CheckCircle2, Building2, HelpCircle, HeartHandshake, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#4A3728] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header Header Card */}
        <div className="bg-[#2D241E] text-white rounded-3xl p-6 sm:p-10 shadow-lg border border-[#3D322B]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C05D4D]/20 text-orange-200 text-xs font-bold uppercase tracking-wider mb-4 border border-[#C05D4D]/40">
            <Award className="w-4 h-4 text-[#C05D4D]" /> Cultural Heritage & Traditional Craft Initiative
          </div>
          <h1 className="font-serif italic text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            CraftWise: AI-Driven Market Linkage for Marginalized Artisans
          </h1>
          <p className="text-orange-200/90 text-sm sm:text-base mt-3 font-medium">
            Empowering Traditional Indian Handicrafts • Direct Artisan-to-Buyer Economic Freedom
          </p>
          <div className="mt-6 pt-6 border-t border-[#3D322B] flex flex-wrap gap-4 text-xs text-stone-300">
            <span>USP: “One Photo. One Voice. Market Ready.”</span>
            <span>•</span>
            <span>Target: Marginalized Indian Craftspeople & SHGs</span>
            <span>•</span>
            <span>Focus: Dignity, Fair Pricing & Direct Linkages</span>
          </div>
        </div>

        {/* Section 1: The Problem */}
        <div className="bg-white rounded-3xl border border-[#E5E1DA] p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="font-serif italic text-2xl font-bold text-[#4A3728]">
            The Problem Facing India’s 20+ Million Artisans
          </h2>
          <p className="text-sm text-[#7C6E62] leading-relaxed">
            India’s craft heritage is one of the richest in human civilization. From bamboo weaving in Visakhapatnam to terracotta pottery in Gorakhpur and handloom in Pochampally, rural artisans create extraordinary sustainable wares. However, they remain economically marginalized because:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E1DA]">
              <h4 className="font-bold text-sm text-[#4A3728]">Low Digital Literacy</h4>
              <p className="text-xs text-[#7C6E62] mt-1">Typing English descriptions, configuring complex SKU attributes, and navigating merchant portals is prohibitive.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E1DA]">
              <h4 className="font-bold text-sm text-[#4A3728]">Poor Presentation Barrier</h4>
              <p className="text-xs text-[#7C6E62] mt-1">Unedited smartphone photos with poor ambient lighting fail to attract urban buyers and e-commerce portals.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E1DA]">
              <h4 className="font-bold text-sm text-[#4A3728]">Severe Price Exploitation</h4>
              <p className="text-xs text-[#7C6E62] mt-1">Intermediary middlemen purchase handmade treasures at distress rates (e.g. ₹50) and resell in metros for ₹600.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E1DA]">
              <h4 className="font-bold text-sm text-[#4A3728]">Isolation from Official Schemes</h4>
              <p className="text-xs text-[#7C6E62] mt-1">Government portals like GeM, TRIFED, and ONDC exist, but rural artisans lack cataloging pipelines to access them.</p>
            </div>
          </div>
        </div>

        {/* Section 2: CraftWise Architectural Solution */}
        <div className="bg-white rounded-3xl border border-[#E5E1DA] p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="font-serif italic text-2xl font-bold text-[#4A3728]">
            The CraftWise Architectural Principles
          </h2>

          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] text-[#C05D4D] border border-[#E5E1DA] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-[#4A3728]">1. Multimodal AI Assistance (Photo + Voice)</h4>
                <p className="text-xs text-[#7C6E62] mt-1">
                  Artisans do not type. They upload or snap one photo, and speak in their mother tongue (Telugu, Hindi, etc.). The AI processes texture, geometry, and artisan voice to generate titles, descriptions, translations, and marketing assets.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-[#4A3728]">2. Strict Authenticity Guard</h4>
                <p className="text-xs text-[#7C6E62] mt-1">
                  AI must NEVER hallucinate. Ground truth comes only from the artisan’s description and visible image attributes. CraftWise will never invent fake certifications, false GI tags, or deceptive sustainability claims.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] text-[#C05D4D] border border-[#E5E1DA] flex items-center justify-center shrink-0 mt-0.5">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-[#4A3728]">3. Artisan Sovereignty & Approval Mandate</h4>
                <p className="text-xs text-[#7C6E62] mt-1">
                  AI assists, but NEVER automatically publishes. The artisan reviews every generated element, toggles between original and enhanced image, adjusts the final price, and explicitly approves before anything goes public.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-[#4A3728]">4. Explainable Market Linkage Engine</h4>
                <p className="text-xs text-[#7C6E62] mt-1">
                  Instead of locking artisans into a walled garden, CraftWise maps their craft to actual procurement avenues: GeM public procurement, TRIFED tribal retail, ONDC open e-commerce, and curated artisan societies like Dastkar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Call to action */}
        <div className="p-6 rounded-3xl bg-[#FAF9F6] border border-[#E5E1DA] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#4A3728] text-base">Ready to test the workflow?</h3>
            <p className="text-xs text-[#7C6E62] mt-0.5">Create a craft product using one photo and one voice note in 60 seconds.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('add-product')}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white font-bold text-sm shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            Try It Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
