import React from 'react';
import { ShieldCheck, Heart, Award } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-[#FAF9F6] text-[#7C6E62] border-t border-[#E5E1DA] mt-16 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#C05D4D] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                CW
              </div>
              <span className="font-serif text-xl font-bold text-[#4A3728] tracking-tight uppercase">CraftWise</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#C05D4D0D] text-[#C05D4D] rounded border border-[#C05D4D22]">
                HERITAGE CRAFT
              </span>
            </div>
            <p className="text-[#7C6E62] text-xs sm:text-sm leading-relaxed max-w-md">
              <strong className="text-[#4A3728]">“{t('nav_slogan')}”</strong> AI-driven digital selling assistant and market linkage platform empowering marginalized Indian artisans to reach institutional, B2B, and digital markets without digital literacy barriers.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#C05D4D] pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Authenticity Guard Protected
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <Award className="w-3.5 h-3.5 text-[#C05D4D]" /> Cultural Heritage Preservation
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#4A3728] mb-3">
              {t('wiz_step1_photo')} & {t('wiz_step2_voice')}
            </h4>
            <ul className="space-y-2 text-xs text-[#7C6E62]">
              <li>1. {t('wiz_step1_photo')}</li>
              <li>2. {t('wiz_step2_voice')}</li>
              <li>3. {t('wiz_step3_ai')}</li>
              <li>4. {t('wiz_step4_review')}</li>
              <li>5. {t('nav_market_linkage')}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#4A3728] mb-3">
              {t('nav_market_linkage')}
            </h4>
            <ul className="space-y-2 text-xs text-[#7C6E62]">
              <li>• GeM (Government e-Marketplace)</li>
              <li>• TRIFED / Tribes India</li>
              <li>• ONDC Artisan Protocols</li>
              <li>• Flipkart Samarth & Amazon Karigar</li>
              <li>• EPCH Export Linkages</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E5E1DA] flex flex-col sm:flex-row items-center justify-between text-xs text-[#7C6E62] gap-4">
          <p>© 2026 CraftWise • Dedicated to Indian Cultural Artisans & Heritage Crafts.</p>
          <div className="flex items-center gap-2">
            <span>Preserving Indian Craft Heritage with Respect & Dignity</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
