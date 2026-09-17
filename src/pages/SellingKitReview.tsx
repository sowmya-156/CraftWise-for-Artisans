import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Globe2,
  SlidersHorizontal,
  Coins,
  MessageSquare,
  Package,
  Save,
  Send,
  ExternalLink,
  ArrowLeft,
  Info,
  Download,
  Loader2,
  Compass,
  FileText
} from 'lucide-react';
import { api } from '../api';
import { Product, User, ArtisanProfile, ALL_SUPPORTED_LANGUAGES, TranslationItem, Translations, MarketOpportunity } from '../types';
import { ImageCompare } from '../components/ImageCompare';
import { ProductCardPreview } from '../components/ProductCardPreview';
import { downloadCatalogImage } from '../utils/catalogImageGenerator';

interface SellingKitReviewProps {
  productId: string;
  user: User;
  profile?: ArtisanProfile;
  onNavigate: (page: string, params?: any) => void;
}

export const SellingKitReview: React.FC<SellingKitReviewProps> = ({
  productId,
  user,
  profile,
  onNavigate
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [downloadingCard, setDownloadingCard] = useState(false);
  const [cardDownloaded, setCardDownloaded] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeLangTab, setActiveLangTab] = useState<string>(profile?.preferredLanguage || 'te');
  const [translationsData, setTranslationsData] = useState<Record<string, TranslationItem>>({});
  const [marketOpportunities, setMarketOpportunities] = useState<MarketOpportunity[]>([]);

  // Form edit state
  const [formData, setFormData] = useState({
    title: '',
    artisanCustomName: user.fullName || '',
    artisanMobile: user.mobile || '',
    shortDescription: '',
    detailedDescription: '',
    craftCategory: '',
    price: 400,
    preferredImage: 'enhanced' as 'original' | 'enhanced',
    materialsString: '',
    handmadeAttributesString: '',
    tagsString: ''
  });

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await api.getProduct(productId);
      const prod = res.product;
      setProduct(prod);

      // Populate form data
      setFormData({
        title: prod.title || '',
        artisanCustomName: prod.artisanName || (user.fullName !== 'Catalog Image Generator' ? user.fullName : '') || 'Lakshmi Devi',
        artisanMobile: prod.artisanMobile || (user.mobile !== '9999900001' ? user.mobile : '') || '9876543210',
        shortDescription: prod.shortDescription || '',
        detailedDescription: prod.detailedDescription || '',
        craftCategory: prod.craftCategory || '',
        price: prod.price || 400,
        preferredImage: prod.preferredImage || 'enhanced',
        materialsString: (prod.materials || []).join(', '),
        handmadeAttributesString: (prod.handmadeAttributes || []).join(', '),
        tagsString: (prod.tags || []).join(', ')
      });

      setTranslationsData(prod.translations || {});

      try {
        const mRes = await api.getMarketRecommendations({
          craftType: prod.craftCategory,
          category: prod.craftCategory,
          productId: prod.id
        });
        setMarketOpportunities(mRes.recommendations || []);
      } catch (mErr) {
        console.warn('Market linkage fetch fallback:', mErr);
      }
    } catch (err) {
      console.error('Error loading product for review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSaveDraft = async () => {
    if (!product) return;
    setSaving(true);
    try {
      const updatedMaterials = formData.materialsString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const updatedAttributes = formData.handmadeAttributesString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const updatedTags = formData.tagsString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: Partial<Product> = {
        title: formData.title,
        shortDescription: formData.shortDescription,
        detailedDescription: formData.detailedDescription,
        craftCategory: formData.craftCategory,
        price: Number(formData.price),
        preferredImage: formData.preferredImage,
        materials: updatedMaterials,
        handmadeAttributes: updatedAttributes,
        tags: updatedTags,
        artisanName: formData.artisanCustomName.trim() || undefined,
        artisanMobile: formData.artisanMobile.trim() || undefined,
        translations: translationsData
      };

      const res = await api.updateProduct(product.id, payload);
      setProduct(res.product);
      alert('Draft saved successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to save updates');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveAndPublish = async () => {
    if (!product) return;
    setPublishing(true);
    try {
      // 1. First save all latest edits
      const updatedMaterials = formData.materialsString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const updatedAttributes = formData.handmadeAttributesString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const updatedTags = formData.tagsString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.updateProduct(product.id, {
        title: formData.title,
        shortDescription: formData.shortDescription,
        detailedDescription: formData.detailedDescription,
        craftCategory: formData.craftCategory,
        price: Number(formData.price),
        preferredImage: formData.preferredImage,
        materials: updatedMaterials,
        handmadeAttributes: updatedAttributes,
        tags: updatedTags,
        artisanName: formData.artisanCustomName.trim() || undefined,
        artisanMobile: formData.artisanMobile.trim() || undefined,
        translations: translationsData
      });

      // 2. Publish Product (Requires explicit artisan action!)
      const pubRes = await api.publishProduct(product.id);
      setProduct(pubRes.product);

      alert('🎉 Product approved & published! Your digital catalog link is now active.');
      onNavigate('product-detail', { id: product.id });
    } catch (err: any) {
      alert(err.message || 'Failed to publish product');
    } finally {
      setPublishing(false);
    }
  };

  const handleDownloadCatalogFlyer = async () => {
    if (!product) return;
    try {
      setDownloadingCard(true);
      const updatedProduct: Product = {
        ...product,
        title: formData.title,
        price: formData.price,
        craftCategory: formData.craftCategory,
        preferredImage: formData.preferredImage
      };
      const artisanName = formData.artisanCustomName.trim() || user.fullName || 'Verified Master Artisan';
      const artisanLocation = profile
        ? `${profile.district}, ${profile.state}`
        : 'Visakhapatnam, Andhra Pradesh';

      await downloadCatalogImage(updatedProduct, artisanName, artisanLocation, {
        language: activeLangTab,
        publicUrl: `${window.location.origin}/#public-product?slug=${product.slug}`,
        artisanPhone: formData.artisanMobile.trim() || user.mobile || '9999900001'
      });
      setCardDownloaded(true);
      setTimeout(() => setCardDownloaded(false), 3000);
    } catch (err) {
      console.error('Failed to download catalog:', err);
      alert('Could not generate the catalog picture.');
    } finally {
      setDownloadingCard(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 text-[#7C6E62]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#C05D4D] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium">Loading Digital Selling Kit...</p>
        </div>
      </div>
    );
  }

  const pricing = product.pricingRecommendation;
  const marketing = product.marketingContent;

  const isCatalogGeneratorUser =
    user.fullName === 'Catalog Image Generator' ||
    user.id === 'demo_catalog_generator';

  if (isCatalogGeneratorUser) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#2D241E] pb-24">
        {/* Header Bar */}
        <div className="bg-[#2D241E] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-[#3E3229]">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C05D4D]/20 text-orange-200 text-xs font-bold uppercase tracking-wider mb-2 border border-[#C05D4D]/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Catalog Image Ready
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
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2.5 bg-[#3D322B] hover:bg-[#4D3F36] text-stone-200 rounded-xl text-xs sm:text-sm font-bold border border-[#524235] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                id="catalog-top-download-btn"
                disabled={downloadingCard}
                onClick={handleDownloadCatalogFlyer}
                className="px-6 py-2.5 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {downloadingCard ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                ) : cardDownloaded ? (
                  <Check className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Download className="w-4 h-4 text-amber-200" />
                )}
                <span>{cardDownloaded ? 'Picture Downloaded!' : 'Download Catalog Picture'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
          {/* 1. GENERATED CATALOG IMAGE SECTION */}
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
                  Includes your artisan name, mobile number, craft details, and <strong>{(product as any).stock || 10} units</strong> ready stock.
                </p>
              </div>

              <button
                type="button"
                id="catalog-main-download-btn"
                disabled={downloadingCard}
                onClick={handleDownloadCatalogFlyer}
                className="px-8 py-3.5 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white rounded-2xl text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer self-start sm:self-auto"
              >
                {downloadingCard ? (
                  <Loader2 className="w-5 h-5 animate-spin text-amber-200" />
                ) : cardDownloaded ? (
                  <Check className="w-5 h-5 text-emerald-300" />
                ) : (
                  <Download className="w-5 h-5 text-amber-200" />
                )}
                <span>{cardDownloaded ? 'Picture Downloaded!' : 'Download Catalog Picture'}</span>
              </button>
            </div>

            <div className="max-w-md mx-auto">
              <ProductCardPreview
                product={{
                  ...product,
                  title: formData.title,
                  price: formData.price,
                  craftCategory: formData.craftCategory,
                  preferredImage: formData.preferredImage
                }}
                artisanName={formData.artisanCustomName.trim() || (product as any).artisanName || user.fullName || 'Verified Master Artisan'}
                artisanLocation={profile ? `${profile.district}, ${profile.state}` : 'Andhra Pradesh'}
                artisanPhone={formData.artisanMobile.trim() || (product as any).artisanMobile || user.mobile || '9876543210'}
                showDownloadAction={false}
              />
            </div>
          </section>

          {/* 2. MARKET LINKAGE BASED ON THE PRODUCT */}
          <section className="bg-white rounded-3xl border border-[#E5E1DA] shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
                <Compass className="w-3.5 h-3.5 text-emerald-600" /> Matched to {product.craftCategory || 'Your Craft'}
              </div>
              <h2 className="font-serif italic text-xl sm:text-2xl font-bold text-[#4A3728]">
                Market Linkage Based on This Product
              </h2>
              <p className="text-xs sm:text-sm text-[#7C6E62] mt-1 max-w-2xl">
                Verified institutional procurement portals and government buyers actively purchasing <strong>{product.craftCategory || 'handcrafted products'}</strong> directly from artisans without middleman fees.
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
                      <a
                        href={opp.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#4A3728] hover:bg-[#3D2C20] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ml-auto"
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

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D241E] pb-20">
      {/* Header Banner */}
      <div className="bg-[#4A3728] text-white border-b border-[#3D2C20] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="text-xs text-stone-300 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
              </button>
              <span className="text-stone-400">•</span>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Selling Kit Review
              </span>
            </div>
            <h1 className="font-serif italic text-2xl sm:text-3xl font-bold tracking-tight">
              Review Your Digital Selling Kit
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-0.5">
              Review AI-generated presentations, edit titles, verify fair pricing, and approve before going public.
            </p>
          </div>

          {/* Authenticity Guard Badge */}
          <div className="bg-[#2D241E]/90 border border-[#E5E1DA]/20 rounded-2xl p-3 flex items-center gap-3 self-start sm:self-auto shadow-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-300">
                Authenticity Guard Active
              </div>
              <div className="text-[11px] text-stone-300">
                Grounded strictly in artisan inputs. Zero AI hallucinations.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Instant Demo Account Mode Banner */}
        {user.fullName === 'Catalog Image Generator' && (
          <div className="p-4 sm:p-5 rounded-3xl bg-[#FFF9F3] border border-[#F0D5B8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C05D4D] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#C05D4D] uppercase tracking-wider">
                    Instant Demo Mode
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    No Login Required
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#4A3728] mt-0.5">
                  Logged in as Catalog Image Generator
                </h3>
                <p className="text-xs text-[#7A4B16] mt-0.5">
                  You can edit the details below, customize the artisan name on your flyer, and download your high-resolution digital catalog picture right away.
                </p>
              </div>
            </div>

            <button
              type="button"
              id="demo-banner-download-btn"
              disabled={downloadingCard}
              onClick={handleDownloadCatalogFlyer}
              className="px-4 py-2.5 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto disabled:opacity-60"
            >
              {downloadingCard ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
              ) : cardDownloaded ? (
                <Check className="w-4 h-4 text-emerald-300" />
              ) : (
                <Download className="w-4 h-4 text-amber-200" />
              )}
              <span>{cardDownloaded ? 'Flyer Downloaded!' : 'Download Catalog Picture'}</span>
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* SECTION 1: IMAGE ENHANCEMENT (BEFORE | AFTER)               */}
        {/* ============================================================ */}
        <section>
          <ImageCompare
            originalImage={product.primaryImage}
            enhancedImage={product.enhancedImage || product.primaryImage}
            selectedPreference={formData.preferredImage}
            onSelectPreference={(pref) =>
              setFormData({ ...formData, preferredImage: pref })
            }
          />
        </section>

        {/* ============================================================ */}
        {/* SECTION 2: VOICE TRANSCRIPT & DETECTED MOTHER TONGUE        */}
        {/* ============================================================ */}
        <section className="bg-white rounded-2xl border border-[#E5E1DA] shadow-xs p-4 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#4A3728] text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C05D4D]" />
              Artisan Voice Record & Detected Language
            </h3>
            <span className="text-xs font-bold text-[#C05D4D] bg-[#C05D4D0D] px-3 py-1 rounded-full border border-[#C05D4D22]">
              Language: {product.detectedLanguage || 'Telugu (తెలుగు)'}
            </span>
          </div>
          <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E5E1DA] text-xs sm:text-sm text-[#4A3728] leading-relaxed italic">
            “{product.voiceTranscript || product.voiceNotes || 'Handcrafted traditional artisan product made with natural materials.'}”
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 3: PRODUCT INFORMATION (EDITABLE)                    */}
        {/* ============================================================ */}
        <section className="bg-white rounded-2xl border border-[#E5E1DA] shadow-xs p-4 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#F0EDEA] pb-3">
            <h3 className="font-bold text-[#4A3728] text-base sm:text-lg">
              Product Information
            </h3>
            <span className="text-xs text-[#7C6E62] font-medium">
              Click any field to edit directly
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider mb-1">
                Product Title *
              </label>
              <input
                id="review-title-input"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-sm font-semibold p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] focus:bg-white text-[#2D241E] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider mb-1">
                  Artisan Name (Printed on Catalog Flyer)
                </label>
                <input
                  id="review-artisan-name-input"
                  type="text"
                  value={formData.artisanCustomName}
                  onChange={(e) => setFormData({ ...formData, artisanCustomName: e.target.value })}
                  placeholder="e.g. Lakshmi Devi"
                  className="w-full text-sm font-semibold p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] focus:bg-white text-[#2D241E] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                />
                <p className="text-[11px] text-[#7C6E62] mt-1">
                  Printed prominently as "Crafted by [Name]" on your generated catalog flyer.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider mb-1">
                  Mobile / WhatsApp (Printed on Catalog Flyer)
                </label>
                <input
                  id="review-artisan-mobile-input"
                  type="tel"
                  value={formData.artisanMobile}
                  onChange={(e) => setFormData({ ...formData, artisanMobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="e.g. 9876543210"
                  className="w-full text-sm font-semibold p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] focus:bg-white text-[#2D241E] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                />
                <p className="text-[11px] text-[#7C6E62] mt-1">
                  Printed as direct Call/WhatsApp contact for retail store owners and buyers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider mb-1">
                  Craft Category
                </label>
                <input
                  id="review-category-input"
                  type="text"
                  value={formData.craftCategory}
                  onChange={(e) => setFormData({ ...formData, craftCategory: e.target.value })}
                  className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] focus:bg-white text-[#2D241E] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider mb-1">
                  Materials (comma-separated)
                </label>
                <input
                  id="review-materials-input"
                  type="text"
                  value={formData.materialsString}
                  onChange={(e) => setFormData({ ...formData, materialsString: e.target.value })}
                  placeholder="e.g. Natural Bamboo, Cane bindings"
                  className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] focus:bg-white text-[#2D241E] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider mb-1">
                Short Description (Catalog & Share Card)
              </label>
              <textarea
                id="review-short-desc-input"
                rows={2}
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] focus:bg-white text-[#2D241E] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider mb-1">
                Detailed Artisan Description & Technique Story
              </label>
              <textarea
                id="review-detailed-desc-input"
                rows={4}
                value={formData.detailedDescription}
                onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] focus:bg-white text-[#2D241E] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider mb-1">
                  Handmade Attributes
                </label>
                <input
                  id="review-attributes-input"
                  type="text"
                  value={formData.handmadeAttributesString}
                  onChange={(e) => setFormData({ ...formData, handmadeAttributesString: e.target.value })}
                  placeholder="e.g. Hand-split, Zero plastic, Eco-friendly"
                  className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] focus:bg-white text-[#2D241E] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider mb-1">
                  Catalog Tags
                </label>
                <input
                  id="review-tags-input"
                  type="text"
                  value={formData.tagsString}
                  onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                  placeholder="e.g. bamboo, home decor, handmade"
                  className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] focus:bg-white text-[#2D241E] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 4: MULTILINGUAL CONTENT (ALL 9 REGIONAL LANGUAGES)   */}
        {/* ============================================================ */}
        <section className="bg-white rounded-2xl border border-[#E5E1DA] shadow-xs p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#F0EDEA] pb-3 gap-3">
            <div>
              <h3 className="font-bold text-[#4A3728] text-base sm:text-lg flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-[#C05D4D]" />
                Multilingual Translations (9 Regional Languages)
              </h3>
              <p className="text-xs text-[#7C6E62]">
                CraftWise automatically translates your craft into Telugu, Hindi, English, Tamil, Kannada, Malayalam, Marathi, Bengali, and Odia.
              </p>
            </div>

            {/* Language Tabs for all 9 languages */}
            <div className="flex flex-wrap bg-[#FAF9F6] border border-[#E5E1DA] p-1 rounded-xl text-xs font-bold gap-1">
              {ALL_SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = activeLangTab === lang.code;
                const hasContent = Boolean(translationsData[lang.code]?.title);
                return (
                  <button
                    key={lang.code}
                    type="button"
                    id={`tab-trans-${lang.code}`}
                    onClick={() => setActiveLangTab(lang.code)}
                    className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#C05D4D] text-white shadow-xs'
                        : 'text-[#4A3728] hover:bg-[#F0EDEA]'
                    }`}
                    title={lang.label}
                  >
                    <span>{lang.nativeName}</span>
                    {hasContent && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-emerald-500'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Language Editor */}
          {(() => {
            const activeLangObj =
              ALL_SUPPORTED_LANGUAGES.find((l) => l.code === activeLangTab) ||
              ALL_SUPPORTED_LANGUAGES[0];
            const currentTranslation = translationsData[activeLangTab] || {
              title: activeLangTab === 'en' ? formData.title : '',
              shortDescription: activeLangTab === 'en' ? formData.shortDescription : '',
              detailedDescription: activeLangTab === 'en' ? formData.detailedDescription : ''
            };

            const handleTransChange = (field: keyof TranslationItem, val: string) => {
              setTranslationsData((prev) => ({
                ...prev,
                [activeLangTab]: {
                  title: prev[activeLangTab]?.title || (activeLangTab === 'en' ? formData.title : ''),
                  shortDescription:
                    prev[activeLangTab]?.shortDescription ||
                    (activeLangTab === 'en' ? formData.shortDescription : ''),
                  detailedDescription:
                    prev[activeLangTab]?.detailedDescription ||
                    (activeLangTab === 'en' ? formData.detailedDescription : ''),
                  ...prev[activeLangTab],
                  [field]: val
                }
              }));
            };

            return (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between bg-[#FAF9F6] border border-[#E5E1DA] px-3.5 py-2 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#C05D4D] text-sm">
                      {activeLangObj.nativeName}
                    </span>
                    <span className="text-[#7C6E62]">({activeLangObj.label})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      // Fill from English if empty
                      if (formData.title && !currentTranslation.title) {
                        handleTransChange('title', formData.title);
                        handleTransChange('shortDescription', formData.shortDescription);
                        handleTransChange('detailedDescription', formData.detailedDescription);
                      }
                    }}
                    className="text-[11px] text-[#C05D4D] hover:underline font-semibold"
                  >
                    Auto-Fill from English Draft
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7C6E62] uppercase mb-1">
                    {activeLangObj.nativeName} Title ({activeLangObj.label})
                  </label>
                  <input
                    type="text"
                    id={`review-trans-title-${activeLangTab}`}
                    value={currentTranslation.title || ''}
                    onChange={(e) => handleTransChange('title', e.target.value)}
                    placeholder={`Enter product title in ${activeLangObj.label}`}
                    className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] focus:bg-white text-[#2D241E] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7C6E62] uppercase mb-1">
                    {activeLangObj.nativeName} Short Description ({activeLangObj.label})
                  </label>
                  <textarea
                    rows={2}
                    id={`review-trans-short-${activeLangTab}`}
                    value={currentTranslation.shortDescription || ''}
                    onChange={(e) => handleTransChange('shortDescription', e.target.value)}
                    placeholder={`Short description in ${activeLangObj.label}`}
                    className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] focus:bg-white text-[#2D241E] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7C6E62] uppercase mb-1">
                    {activeLangObj.nativeName} Detailed Technique Story ({activeLangObj.label})
                  </label>
                  <textarea
                    rows={4}
                    id={`review-trans-detailed-${activeLangTab}`}
                    value={currentTranslation.detailedDescription || ''}
                    onChange={(e) => handleTransChange('detailedDescription', e.target.value)}
                    placeholder={`Detailed artisan technique story in ${activeLangObj.label}`}
                    className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] focus:bg-white text-[#2D241E] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                  />
                </div>
              </div>
            );
          })()}
        </section>

        {/* ============================================================ */}
        {/* SECTION 5: AI-ASSISTED PRICING WITH TRANSPARENT BREAKDOWN    */}
        {/* ============================================================ */}
        <section className="bg-white rounded-2xl border border-[#E5E1DA] shadow-xs p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EDEA] pb-3">
            <div>
              <h3 className="font-bold text-[#4A3728] text-base sm:text-lg flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#C05D4D]" />
                AI-Assisted Fair Pricing Recommendation
              </h3>
              <p className="text-xs text-[#7C6E62]">
                Transparent calculation protecting artisans against distress sales.
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#7C6E62] bg-[#FAF9F6] border border-[#E5E1DA] px-2.5 py-1 rounded-md self-start sm:self-auto">
              AI-assisted estimate
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Recommended Range & Breakdown */}
            <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E5E1DA] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7C6E62] uppercase tracking-wider">
                  Suggested Price Range:
                </span>
                <span className="text-lg font-bold text-[#C05D4D] font-mono">
                  ₹{pricing?.suggestedMin || 350} – ₹{pricing?.suggestedMax || 500}
                </span>
              </div>

              <div className="text-xs text-[#4A3728] space-y-1.5 pt-2 border-t border-[#E5E1DA]">
                <strong className="block text-[#4A3728] font-bold mb-1">
                  Why this range? (Explainable Cost Breakdown):
                </strong>
                {pricing?.breakdown?.rationale?.map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[#7C6E62]">
                    <span className="text-[#C05D4D] font-bold">•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Final Price Input */}
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E1DA] space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A3728] uppercase tracking-wider mb-1">
                  Your Final Selling Price (₹) *
                </label>
                <p className="text-xs text-[#7C6E62] mb-2">
                  You have 100% control. You can set the price higher or lower as you see fit.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-[#4A3728]">₹</span>
                  <input
                    id="review-final-price-input"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                    className="w-40 text-2xl font-bold p-2.5 rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero platform commission. 100% of ₹{formData.price} goes directly to you.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 6: READY-TO-USE MARKETING ASSETS                    */}
        {/* ============================================================ */}
        <section className="bg-white rounded-2xl border border-[#E5E1DA] shadow-xs p-4 sm:p-6 space-y-4">
          <div className="border-b border-[#F0EDEA] pb-3">
            <h3 className="font-bold text-[#4A3728] text-base sm:text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#C05D4D]" />
              Direct Marketing & Social Content
            </h3>
            <p className="text-xs text-[#7C6E62]">
              Pre-formatted messages ready to copy directly into WhatsApp and Instagram.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WhatsApp Card */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-700" /> WhatsApp Message Copy
                </span>
                <button
                  type="button"
                  id="copy-whatsapp-btn"
                  onClick={() =>
                    handleCopyText(marketing?.whatsAppMessage || '', 'whatsapp')
                  }
                  className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-emerald-50"
                >
                  {copiedSection === 'whatsapp' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedSection === 'whatsapp' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs text-[#2D241E] font-sans whitespace-pre-wrap bg-white p-3 rounded-lg border border-emerald-100 line-clamp-6">
                {marketing?.whatsAppMessage || 'Authentic handcrafted product made by local artisan.'}
              </pre>
            </div>

            {/* Instagram Card */}
            <div className="p-4 rounded-xl bg-[#C05D4D0A] border border-[#C05D4D22] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C05D4D] flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-[#C05D4D]" /> Instagram & Social Caption
                </span>
                <button
                  type="button"
                  id="copy-instagram-btn"
                  onClick={() =>
                    handleCopyText(marketing?.instagramCaption || '', 'instagram')
                  }
                  className="px-2.5 py-1 bg-white border border-[#C05D4D33] text-[#C05D4D] rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-[#C05D4D0D]"
                >
                  {copiedSection === 'instagram' ? (
                    <Check className="w-3.5 h-3.5 text-[#C05D4D]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedSection === 'instagram' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs text-[#2D241E] font-sans whitespace-pre-wrap bg-white p-3 rounded-lg border border-[#C05D4D22] line-clamp-6">
                {marketing?.instagramCaption || 'Support traditional craftsmanship with CraftWise.'}
              </pre>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 7: DIGITAL PRODUCT CARD PREVIEW                      */}
        {/* ============================================================ */}
        <section>
          <ProductCardPreview
            product={{
              ...product,
              title: formData.title,
              price: formData.price,
              craftCategory: formData.craftCategory,
              preferredImage: formData.preferredImage
            }}
            artisanName={formData.artisanCustomName.trim() || (product as any).artisanName || user.fullName || 'Verified Master Artisan'}
            artisanLocation={profile ? `${profile.district}, ${profile.state}` : 'Andhra Pradesh'}
            artisanPhone={formData.artisanMobile.trim() || (product as any).artisanMobile || user.mobile || '9999900001'}
            onOpenPublicLink={() => onNavigate('public-product', { slug: product.slug })}
          />
        </section>

        {/* ============================================================ */}
        {/* SECTION 8: DOWNLOAD CATALOG FLYER (NO PUBLISH OPTION)        */}
        {/* ============================================================ */}
        <div className="bg-[#4A3728] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#3E3229] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Catalog Image Ready
            </div>
            <h3 className="font-serif italic text-xl sm:text-2xl font-bold">
              Download Your Product Catalog Flyer
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
              Your high-resolution catalog picture is ready with your artisan name and mobile number. Download and share directly with buyers on WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="review-download-catalog-btn"
              disabled={downloadingCard}
              onClick={handleDownloadCatalogFlyer}
              className="px-8 py-3.5 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white rounded-xl text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {downloadingCard ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-200" />
              ) : cardDownloaded ? (
                <Check className="w-5 h-5 text-emerald-300" />
              ) : (
                <Download className="w-5 h-5 text-amber-200" />
              )}
              <span>{cardDownloaded ? 'Picture Downloaded!' : 'Download Catalog Picture'}</span>
            </button>

            <button
              type="button"
              id="save-draft-btn"
              disabled={saving}
              onClick={handleSaveDraft}
              className="px-5 py-3.5 bg-[#3E3229] hover:bg-[#322820] text-stone-200 rounded-xl text-xs sm:text-sm font-bold border border-[#5A4839] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
