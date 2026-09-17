import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { Product } from '../types';
import { downloadCatalogImage, shareCatalogImage } from '../utils/catalogImageGenerator';

interface ProductCardPreviewProps {
  product: Product;
  artisanName: string;
  artisanLocation: string;
  artisanPhone?: string;
  onOpenPublicLink?: () => void;
}

export const ProductCardPreview: React.FC<ProductCardPreviewProps> = ({
  product,
  artisanName,
  artisanLocation,
  artisanPhone,
  onOpenPublicLink
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isSharingImage, setIsSharingImage] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const publicUrl = `${window.location.origin}/#public-product?slug=${product.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = async () => {
    try {
      setIsDownloading(true);
      await downloadCatalogImage(product, artisanName, artisanLocation, {
        publicUrl,
        artisanPhone
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to download catalog image:', err);
      alert('Could not generate the catalog image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareImage = async () => {
    try {
      setIsSharingImage(true);
      await shareCatalogImage(product, artisanName, artisanLocation, {
        publicUrl,
        artisanPhone
      });
    } catch (err) {
      console.error('Failed to share catalog image:', err);
    } finally {
      setIsSharingImage(false);
    }
  };

  const handleShareLink = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.title,
          text: `Check out authentic handcrafted ${product.craftCategory} by artisan ${artisanName} on CraftWise!`,
          url: publicUrl
        })
        .catch(() => handleCopyLink());
    } else {
      handleCopyLink();
    }
  };

  const activeImage =
    product.preferredImage === 'enhanced'
      ? product.enhancedImage || product.primaryImage
      : product.primaryImage;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1DA] shadow-xs p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-[#4A3728] text-base sm:text-lg flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#C05D4D]" />
            Digital Catalog Image Preview
          </h3>
          <p className="text-xs text-[#7C6E62]">
            Shareable smart catalog image for WhatsApp, social media, exhibitions, and buyers.
          </p>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Verified Artisan
        </span>
      </div>

      {/* Visual Branded Product Card Container */}
      <div
        ref={cardRef}
        id="digital-artisan-product-card"
        className="max-w-md mx-auto bg-[#2D241E] text-stone-100 rounded-2xl overflow-hidden border border-[#3E3229] shadow-xl"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#C05D4D] via-[#A34E41] to-[#8C3E33] px-4 py-2.5 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1.5 font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" /> CRAFTWISE AUTHENTIC ARTISAN
          </div>
          <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded font-medium border border-white/20">
            100% HANDMADE
          </span>
        </div>

        {/* Product Image Stage */}
        <div className="relative aspect-square bg-[#221A15] overflow-hidden flex items-center justify-center p-2">
          <img
            src={activeImage}
            alt={product.title}
            className="w-full h-full object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
          {product.price > 0 && (
            <div className="absolute bottom-4 right-4 bg-[#2D241E]/95 backdrop-blur-md text-[#FAF9F6] border border-[#C05D4D]/50 px-3.5 py-1.5 rounded-xl font-bold text-lg shadow-lg">
              ₹{product.price}
            </div>
          )}
        </div>

        {/* Body Details */}
        <div className="p-4 sm:p-5 space-y-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-300">
              {product.craftCategory || 'Heritage Handicraft'}
            </span>
            <h4 className="font-serif italic text-lg font-bold text-white mt-0.5 leading-snug">
              {product.title}
            </h4>
          </div>

          <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
            {product.shortDescription || product.detailedDescription}
          </p>

          {/* Materials & Attributes */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(product.materials || ['Natural Raw Materials']).slice(0, 3).map((mat, i) => (
              <span
                key={i}
                className="text-[10px] bg-[#3E3229] text-stone-200 px-2 py-0.5 rounded border border-[#524235]"
              >
                🌿 {mat}
              </span>
            ))}
          </div>

          {/* Artisan Signature Footer */}
          <div className="pt-3 border-t border-[#3E3229] flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                Artisan Name
              </span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {artisanName}
              </span>
            </div>

            {artisanPhone && (
              <div className="text-right">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                  Mobile Number
                </span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">
                  {artisanPhone.startsWith('+91') ? artisanPhone : `+91 ${artisanPhone}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Sharing & Download Actions */}
      <div className="mt-6 pt-5 border-t border-[#F0EDEA] space-y-3">
        {/* Primary Download & Share Picture Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button
            type="button"
            id="download-catalog-image-btn"
            disabled={isDownloading}
            onClick={handleDownloadImage}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#C05D4D22] transition-all flex items-center justify-center gap-2 group disabled:opacity-75"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : downloadSuccess ? (
              <Check className="w-4 h-4 text-emerald-200" />
            ) : (
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            )}
            <span>
              {isDownloading
                ? 'Generating Picture...'
                : downloadSuccess
                ? 'Picture Downloaded!'
                : 'Download Catalog Picture (PNG)'}
            </span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-normal">
              1080×1350 HD
            </span>
          </button>

          <button
            type="button"
            id="share-catalog-image-btn"
            disabled={isSharingImage}
            onClick={handleShareImage}
            className="px-4 py-3 bg-[#FAF9F6] hover:bg-[#F0EDEA] text-[#4A3728] border border-[#E5E1DA] rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {isSharingImage ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#C05D4D]" />
            ) : (
              <Share2 className="w-4 h-4 text-[#C05D4D]" />
            )}
            <span>{isSharingImage ? 'Preparing Picture...' : 'Share Picture (WhatsApp/Social)'}</span>
          </button>
        </div>

        {/* Secondary Link & Buyer Page Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            id="copy-card-link-btn"
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-white hover:bg-[#FAF9F6] text-[#7C6E62] hover:text-[#4A3728] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#E5E1DA]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Link Copied!' : 'Copy Direct Link'}
          </button>

          <button
            type="button"
            id="share-card-btn"
            onClick={handleShareLink}
            className="px-3.5 py-2 bg-white hover:bg-[#FAF9F6] text-[#7C6E62] hover:text-[#4A3728] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#E5E1DA]"
          >
            <Share2 className="w-3.5 h-3.5 text-[#7C6E62]" />
            Share URL
          </button>

          {onOpenPublicLink && (
            <button
              type="button"
              id="view-live-buyer-page-btn"
              onClick={onOpenPublicLink}
              className="px-3.5 py-2 bg-[#4A3728] hover:bg-[#3D2C20] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
              Preview Buyer View
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
