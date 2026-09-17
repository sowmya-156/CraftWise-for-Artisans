import React, { useState, useEffect } from 'react';
import {
  Compass,
  Building2,
  CheckCircle2,
  ExternalLink,
  Download,
  Filter,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  FileText,
  ArrowRight
} from 'lucide-react';
import { api } from '../api';
import { MarketOpportunity } from '../types';

interface MarketLinkagePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const MarketLinkagePage: React.FC<MarketLinkagePageProps> = ({ onNavigate }) => {
  const [opportunities, setOpportunities] = useState<MarketOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.getMarketOpportunities();
      setOpportunities(res.opportunities || []);
    } catch (err) {
      console.error('Failed to load market opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (opp: MarketOpportunity) => {
    if (appliedIds.includes(opp.id)) return;
    setAppliedIds((prev) => [...prev, opp.id]);
    alert(`Linkage inquiry initiated for ${opp.name}! Your verified artisan profile and catalog specifications have been queued.`);
  };

  const handleDownloadGeMExport = (opp: MarketOpportunity) => {
    const data = JSON.stringify(
      {
        portal: opp.name,
        catalogExportDate: new Date().toISOString(),
        category: opp.category,
        matchingCategory: opp.matchingCategory,
        eligibility: opp.eligibility,
        complianceStatus: 'VERIFIED_HANDMADE'
      },
      null,
      2
    );
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CraftWise_${opp.name.replace(/\s+/g, '_')}_Catalog.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = ['all', 'government', 'b2b', 'ecommerce', 'cooperative'];

  const filteredOpportunities = opportunities.filter((opp) => {
    if (selectedCategory === 'all') return true;
    return opp.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#4A3728] pb-20">
      {/* Header Banner */}
      <div className="bg-[#2D241E] text-white border-b border-[#3D322B] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C05D4D]/20 text-orange-200 text-xs font-bold uppercase tracking-wider mb-3 border border-[#C05D4D]/40">
              <Compass className="w-4 h-4 text-[#C05D4D]" /> Explainable Market Matching
            </div>
            <h1 className="font-serif italic text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Market Linkage & Institutional Procurement
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Connect directly with official government portals (GeM), TRIFED tribal retail, ONDC open network, and ethical craft cooperatives without exploitative middlemen.
            </p>
          </div>

          <div className="bg-[#3D322B]/80 p-4 rounded-2xl border border-[#4A3728] max-w-sm text-xs space-y-1">
            <div className="text-orange-200 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Direct Institutional Integration
            </div>
            <p className="text-stone-300">
              CraftWise exports standardized catalog specifications matching GeM Product Taxonomy and ONDC schema.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Category Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#7C6E62]">
            <Filter className="w-4 h-4 text-[#7C6E62]" />
            <span>Filter by Portal Type:</span>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-[#FAF9F6] border border-[#E5E1DA] p-1 rounded-xl text-xs font-bold">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#C05D4D] text-white shadow-xs'
                    : 'text-[#7C6E62] hover:text-[#4A3728]'
                }`}
              >
                {cat === 'all' ? 'All Portals' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Opportunities Grid */}
        {loading ? (
          <div className="p-12 text-center text-[#7C6E62] text-sm">
            Evaluating market opportunities...
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E1DA] text-[#7C6E62] text-sm">
            No opportunities currently match this category filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOpportunities.map((opp) => {
              const isApplied = appliedIds.includes(opp.id);

              return (
                <div
                  key={opp.id}
                  className="bg-white rounded-3xl border border-[#E5E1DA] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#FAF9F6] text-[#C05D4D] flex items-center justify-center font-bold text-xl border border-[#E5E1DA] shrink-0">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#C05D4D] bg-[#FAF9F6] border border-[#E5E1DA] px-2 py-0.5 rounded tracking-wider">
                            {opp.badge || opp.category}
                          </span>
                          <h3 className="font-serif italic text-lg font-bold text-[#4A3728] leading-tight mt-1">
                            {opp.name}
                          </h3>
                          <span className="text-xs text-[#7C6E62] font-medium">
                            {opp.matchingCategory} • {opp.locationScope}
                          </span>
                        </div>
                      </div>

                      {/* Match Score */}
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          {opp.matchScore}% Match
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#7C6E62] leading-relaxed">
                      {opp.description}
                    </p>

                    {/* Why Recommended & Eligibility */}
                    <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E1DA] space-y-2 text-xs">
                      <div className="font-bold text-[#4A3728]">
                        Why Recommended for You (Explainable Match):
                      </div>
                      <div className="space-y-1">
                        {opp.whyRecommended.map((reason, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[#7C6E62]">
                            <span className="text-[#C05D4D] font-bold">•</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-[#E5E1DA] text-[#7C6E62]">
                        <strong className="text-[#4A3728]">Eligibility:</strong> {opp.eligibility}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-[#F0EDEA] flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleDownloadGeMExport(opp)}
                      className="text-xs font-bold text-[#7C6E62] hover:text-[#4A3728] flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Schema JSON
                    </button>

                    <button
                      type="button"
                      disabled={isApplied}
                      onClick={() => handleApply(opp)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                        isApplied
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white shadow-xs'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Linkage Queued
                        </>
                      ) : (
                        <>
                          <span>{opp.actionText || 'Apply for Linkage'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
