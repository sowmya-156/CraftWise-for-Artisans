import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Edit,
  Boxes,
  MessageSquare,
  Share2,
  CheckCircle2,
  Compass,
  Copy,
  Check,
  Package,
  Plus,
  Minus,
  Sparkles,
  Download,
  Loader2,
  QrCode,
  Camera
} from 'lucide-react';
import { api, authState } from '../api';
import { Product, Enquiry } from '../types';
import { downloadCatalogImage, shareCatalogImage } from '../utils/catalogImageGenerator';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onNavigate
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [artisanProfile, setArtisanProfile] = useState<any>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [updatingStock, setUpdatingStock] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isSharingImage, setIsSharingImage] = useState(false);
  const [selectedImageView, setSelectedImageView] = useState<'original' | 'enhanced'>('original');

  const currentUser = authState.getUser();

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, eRes, profRes] = await Promise.all([
        api.getProduct(productId),
        api.getEnquiries(productId),
        api.getProfile().catch(() => ({ profile: null }))
      ]);
      setProduct(pRes.product);
      if (pRes.product?.preferredImage) {
        setSelectedImageView(pRes.product.preferredImage);
      }
      setEnquiries(eRes.enquiries || []);
      setArtisanProfile(profRes.profile);
    } catch (err) {
      console.error('Failed to load product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCatalog = async () => {
    if (!product) return;
    try {
      setIsDownloading(true);
      const artisanName = artisanProfile?.businessName || currentUser?.fullName || 'Verified Artisan';
      const artisanLocation = artisanProfile
        ? `${artisanProfile.district}, ${artisanProfile.state}`
        : 'Andhra Pradesh, India';

      const publicUrl = `${window.location.origin}/#public-product?slug=${product.slug}`;
      await downloadCatalogImage(product, artisanName, artisanLocation, {
        publicUrl,
        artisanPhone: currentUser?.mobile || artisanProfile?.contactNumber || (product as any).artisanMobile || '9999900001'
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to download catalog:', err);
      alert('Could not download catalog image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareCatalog = async () => {
    if (!product) return;
    try {
      setIsSharingImage(true);
      const artisanName = artisanProfile?.businessName || currentUser?.fullName || 'Verified Artisan';
      const artisanLocation = artisanProfile
        ? `${artisanProfile.district}, ${artisanProfile.state}`
        : 'Andhra Pradesh, India';

      const publicUrl = `${window.location.origin}/#public-product?slug=${product.slug}`;
      await shareCatalogImage(product, artisanName, artisanLocation, {
        publicUrl,
        artisanPhone: currentUser?.mobile || artisanProfile?.contactNumber || (product as any).artisanMobile || '9999900001'
      });
    } catch (err) {
      console.error('Failed to share catalog:', err);
    } finally {
      setIsSharingImage(false);
    }
  };

  const handleStockChange = async (delta: number) => {
    if (!product || updatingStock) return;
    const newStock = Math.max(0, product.stock + delta);
    setUpdatingStock(true);
    try {
      const res = await api.updateProductStock(product.id, newStock);
      setProduct((prev) => (prev ? { ...prev, stock: res.stock, status: res.status } : null));
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    } finally {
      setUpdatingStock(false);
    }
  };

  const handleCopyPublicLink = () => {
    if (!product) return;
    const url = `${window.location.origin}/#public-product?slug=${product.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 text-[#7C6E62]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#C05D4D] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-[#4A3728]">Loading craft details...</p>
        </div>
      </div>
    );
  }

  const originalPic = product.primaryImage;
  const enhancedPic = product.enhancedImage;
  const hasDistinctEnhanced = Boolean(enhancedPic && enhancedPic !== originalPic);
  const activeImg = selectedImageView === 'enhanced' && hasDistinctEnhanced ? enhancedPic : originalPic;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#4A3728] pb-20">
      {/* Top Breadcrumb */}
      <div className="bg-white border-b border-[#E5E1DA] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('my-products')}
            className="text-xs font-bold text-[#7C6E62] hover:text-[#4A3728] flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Products
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="detail-download-catalog-btn"
              disabled={isDownloading}
              onClick={handleDownloadCatalog}
              className="px-3.5 py-1.5 bg-white border border-[#E5E1DA] hover:border-[#C05D4D] text-[#4A3728] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-60"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C05D4D]" />
              ) : downloadSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#C05D4D]" />
              )}
              <span>{downloadSuccess ? 'Downloaded!' : 'Download Catalog Picture'}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('selling-kit', { productId: product.id })}
              className="px-3.5 py-1.5 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Edit className="w-3.5 h-3.5" /> Edit Selling Kit
            </button>

            {product.status === 'published' && (
              <button
                type="button"
                onClick={() => onNavigate('public-product', { slug: product.slug })}
                className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-100 flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Public Buyer View
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
        {/* Main Product Card */}
        <div className="bg-white rounded-3xl border border-[#E5E1DA] p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left: Product Image */}
          <div className="md:col-span-5 space-y-3">
            <div className="aspect-square bg-[#FAF9F6] rounded-2xl overflow-hidden p-3 border border-[#E5E1DA] flex items-center justify-center relative">
              <img
                src={activeImg}
                alt={product.title}
                className="w-full h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1">
                <Camera className="w-3 h-3 text-amber-300" />
                {selectedImageView === 'original' ? 'Artisan Original Photo' : 'Enhanced Studio View'}
              </div>
            </div>

            {hasDistinctEnhanced && (
              <div className="flex items-center gap-2 p-1.5 bg-[#FAF9F6] rounded-xl border border-[#E5E1DA]">
                <button
                  type="button"
                  onClick={() => setSelectedImageView('original')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    selectedImageView === 'original'
                      ? 'bg-[#C05D4D] text-white shadow-xs'
                      : 'text-[#7C6E62] hover:text-[#4A3728]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Original Photo
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImageView('enhanced')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    selectedImageView === 'enhanced'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-[#7C6E62] hover:text-[#4A3728]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Enhanced Studio
                </button>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-[#7C6E62] px-1">
              <span>Image mode: <strong className="capitalize text-[#4A3728]">{product.preferredImage}</strong></span>
              <button
                type="button"
                onClick={handleCopyPublicLink}
                className="font-bold text-[#C05D4D] hover:underline flex items-center gap-1"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedLink ? 'Link Copied' : 'Copy Buyer Link'}
              </button>
            </div>

            {/* Smart Digital Catalog Download Banner */}
            <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E5E1DA] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A3728]">
                  <QrCode className="w-4 h-4 text-[#C05D4D]" />
                  <span>Smart Digital Catalog Picture</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  With Scannable QR
                </span>
              </div>
              <p className="text-[11px] text-[#7C6E62] leading-relaxed">
                Download a high-resolution, branded flyer card of this craft with photo, fair price, and scannable QR code to share on WhatsApp or print for exhibitions.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  id="detail-card-download-btn"
                  disabled={isDownloading}
                  onClick={handleDownloadCatalog}
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : downloadSuccess ? (
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{downloadSuccess ? 'Downloaded!' : 'Download Catalog Picture (PNG)'}</span>
                </button>

                <button
                  type="button"
                  id="detail-card-share-btn"
                  disabled={isSharingImage}
                  onClick={handleShareCatalog}
                  className="p-2.5 bg-white border border-[#E5E1DA] hover:bg-[#FAF9F6] text-[#4A3728] rounded-xl text-xs font-semibold flex items-center justify-center transition-colors disabled:opacity-60"
                  title="Share Picture"
                >
                  {isSharingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#C05D4D]" />
                  ) : (
                    <Share2 className="w-4 h-4 text-[#C05D4D]" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Details & Stock Controls */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-[#7C6E62]">
                  {product.craftCategory}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    product.status === 'published'
                      ? 'bg-emerald-100 text-emerald-800'
                      : product.status === 'ready_for_review'
                      ? 'bg-[#C05D4D15] text-[#C05D4D] border border-[#C05D4D33]'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {product.status.toUpperCase()}
                </span>
              </div>
              <h1 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#4A3728] mt-1">
                {product.title}
              </h1>
              <div className="text-2xl font-bold text-[#4A3728] mt-2 font-mono">
                ₹{product.price}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#7C6E62] leading-relaxed">
              {product.detailedDescription || product.shortDescription}
            </p>

            {/* Stock Control Card */}
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E1DA] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C6E62] block">
                  Current Stock Available
                </span>
                <span className="text-xl font-bold text-[#4A3728]">
                  {product.stock} units
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={updatingStock || product.stock <= 0}
                  onClick={() => handleStockChange(-1)}
                  className="w-10 h-10 rounded-xl bg-white border border-[#E5E1DA] text-[#4A3728] font-bold flex items-center justify-center hover:bg-stone-100 disabled:opacity-40 transition-colors"
                  title="Decrease stock by 1"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={updatingStock}
                  onClick={() => handleStockChange(1)}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white font-bold flex items-center justify-center disabled:opacity-40 shadow-xs transition-colors"
                  title="Increase stock by 1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Materials & Attributes */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7C6E62] block">
                Raw Materials & Handmade Story
              </span>
              <div className="flex flex-wrap gap-2">
                {(product.materials || []).map((m, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white text-[#4A3728] font-medium px-2.5 py-1 rounded-lg border border-[#E5E1DA]"
                  >
                    🌿 {m}
                  </span>
                ))}
                {(product.handmadeAttributes || []).map((a, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-[#C05D4D0D] text-[#8C3E33] font-medium px-2.5 py-1 rounded-lg border border-[#C05D4D33]"
                  >
                    ✨ {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Enquiries */}
        <div className="bg-white rounded-3xl border border-[#E5E1DA] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0EDEA] pb-3">
            <h3 className="font-bold text-[#4A3728] text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#C05D4D]" />
              Buyer Enquiries for this Product ({enquiries.length})
            </h3>
          </div>

          {enquiries.length === 0 ? (
            <p className="text-xs text-[#7C6E62] italic py-4">
              No buyer enquiries received yet for this craft. Share your public link on WhatsApp groups or Instagram!
            </p>
          ) : (
            <div className="space-y-3">
              {enquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E1DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#4A3728]">{enq.buyerName}</span>
                      <span className="text-[11px] text-[#7C6E62]">• {enq.buyerContact}</span>
                      {enq.quantity && (
                        <span className="text-[10px] font-bold bg-[#C05D4D15] text-[#C05D4D] px-2 py-0.5 rounded">
                          Qty: {enq.quantity}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#4A3728] mt-1 italic">“{enq.message}”</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full self-start sm:self-auto ${
                      enq.status === 'new'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {enq.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
