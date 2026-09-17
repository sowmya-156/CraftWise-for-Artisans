import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Save,
  CreditCard,
  LogOut,
  Sparkles,
  Award,
  ShoppingBag,
  MessageSquare,
  Truck,
  Tag
} from 'lucide-react';
import { api, authState } from '../api';
import { User as UserType, ArtisanProfile, ALL_SUPPORTED_LANGUAGES } from '../types';

interface ProfilePageProps {
  user: UserType;
  profile?: ArtisanProfile;
  onUpdateSuccess: (updatedProfile: ArtisanProfile) => void;
  onLogout: () => void;
  onNavigate: (page: string, params?: any) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  profile,
  onUpdateSuccess,
  onLogout,
  onNavigate
}) => {
  const isBuyer = user.role === 'buyer';

  const [formData, setFormData] = useState({
    craftType: profile?.craftType || 'Bamboo Handicrafts',
    state: profile?.state || user.state || 'Andhra Pradesh',
    district: profile?.district || 'Visakhapatnam',
    villageOrCity: profile?.villageOrCity || user.city || 'Araku Valley',
    preferredLanguage: profile?.preferredLanguage || user.preferredLanguage || 'te',
    cooperativeName: profile?.cooperativeName || 'Giri Jan Kalyan Bamboo Producers',
    yearsOfExperience: String(profile?.yearsOfExperience || '12'),
    craftDescription: profile?.craftDescription || '',
    artisanCardId: 'IND-ART-AP-2024-892',
    bankAccountNo: '912010045678912',
    bankIfsc: 'SBIN0001234',
    bankName: 'State Bank of India'
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        craftType: profile.craftType || prev.craftType,
        state: profile.state || prev.state,
        district: profile.district || prev.district,
        villageOrCity: profile.villageOrCity || prev.villageOrCity,
        preferredLanguage: profile.preferredLanguage || prev.preferredLanguage,
        cooperativeName: profile.cooperativeName || prev.cooperativeName,
        yearsOfExperience: String(profile.yearsOfExperience || prev.yearsOfExperience),
        craftDescription: profile.craftDescription || prev.craftDescription
      }));
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBuyer) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await api.updateProfile({
        craftType: formData.craftType,
        state: formData.state,
        district: formData.district,
        villageOrCity: formData.villageOrCity,
        preferredLanguage: formData.preferredLanguage,
        cooperativeName: formData.cooperativeName,
        yearsOfExperience: Number(formData.yearsOfExperience) || 10,
        craftDescription: formData.craftDescription
      });

      onUpdateSuccess(res.profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#4A3728] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E1DA] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C05D4D] to-[#8C3E33] text-white font-serif font-bold text-2xl flex items-center justify-center shadow-md shadow-[#C05D4D22]">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif italic text-2xl font-bold text-[#4A3728]">
                  {user.fullName}
                </h1>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                  isBuyer
                    ? 'bg-orange-50 text-[#C05D4D] border-orange-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  <ShieldCheck className="w-3 h-3" />
                  {isBuyer ? 'Registered Craft Buyer' : 'Verified Artisan Maker'}
                </span>
              </div>
              <p className="text-xs text-[#7C6E62] mt-0.5">
                {isBuyer
                  ? `Craft Collector • ${user.city || 'Hyderabad'}, ${user.state || 'Telangana'}`
                  : `${formData.craftType} • ${formData.district}, ${formData.state}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isBuyer ? (
              <button
                type="button"
                onClick={() => onNavigate('marketplace')}
                className="px-4 py-2 bg-[#C05D4D] hover:bg-[#A34E41] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Browse Crafts
              </button>
            ) : null}

            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2 bg-[#FAF9F6] hover:bg-[#F0EDEA] text-[#4A3728] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto border border-[#E5E1DA]"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* BUYER PROFILE VIEW */}
        {isBuyer ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#E5E1DA] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#F0EDEA] pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#4A3728] text-lg flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#C05D4D]" />
                    Buyer Account & Delivery Profile
                  </h3>
                  <p className="text-xs text-[#7C6E62] mt-0.5">
                    Your details for placing inquiries and receiving authentic crafts from artisans.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#7C6E62] uppercase mb-1">
                    Contact Mobile
                  </label>
                  <div className="flex items-center gap-2 text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728]">
                    <Phone className="w-4 h-4 text-[#C05D4D]" />
                    <span>{user.mobile}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7C6E62] uppercase mb-1">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728]">
                    <Mail className="w-4 h-4 text-[#C05D4D]" />
                    <span>{user.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7C6E62] uppercase mb-1">
                    City / Town
                  </label>
                  <div className="flex items-center gap-2 text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728]">
                    <MapPin className="w-4 h-4 text-[#C05D4D]" />
                    <span>{user.city || 'Hyderabad'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7C6E62] uppercase mb-1">
                    State
                  </label>
                  <div className="text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728]">
                    {user.state || 'Telangana'}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#7C6E62] uppercase mb-1">
                    Delivery Address
                  </label>
                  <div className="flex items-center gap-2 text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728]">
                    <Truck className="w-4 h-4 text-[#C05D4D]" />
                    <span>{user.deliveryAddress || 'Plot 42, Jubilee Hills, Road No 36, Hyderabad - 500033'}</span>
                  </div>
                </div>
              </div>

              {/* Interested Categories */}
              <div className="border-t border-[#F0EDEA] pt-4">
                <h4 className="text-xs font-bold text-[#7C6E62] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#C05D4D]" />
                  Favorite Craft Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(user.interestedCategories || [
                    'Clay & Terracotta Pottery',
                    'Handloom & Traditional Weaving',
                    'Brass & Bell Metal Crafts',
                    'Bamboo & Cane Handicrafts'
                  ]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => onNavigate('marketplace', { category: cat })}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F0EDEA] border border-[#E5E1DA] text-xs font-medium text-[#4A3728] transition-colors flex items-center gap-1.5"
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] text-[#C05D4D] font-bold">Browse →</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Buyer Quick Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => onNavigate('marketplace')}
                className="p-5 bg-white rounded-3xl border border-[#E5E1DA] hover:border-[#C05D4D] cursor-pointer transition-all shadow-xs group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#C05D4D15] text-[#C05D4D] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#4A3728]">Explore All Crafts by Category</h4>
                <p className="text-xs text-[#7C6E62] mt-1">
                  Discover authentic products from artisans across India, filter by price and heritage technique.
                </p>
              </div>

              <div
                onClick={() => onNavigate('buyer-enquiries')}
                className="p-5 bg-white rounded-3xl border border-[#E5E1DA] hover:border-[#C05D4D] cursor-pointer transition-all shadow-xs group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#C05D4D15] text-[#C05D4D] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#4A3728]">My Direct Artisan Inquiries</h4>
                <p className="text-xs text-[#7C6E62] mt-1">
                  Track the status of your product requests and direct communication with artisan sellers.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ARTISAN PROFILE VIEW */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identity & Heritage */}
            <div className="bg-white rounded-3xl border border-[#E5E1DA] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#F0EDEA] pb-4">
                <h3 className="font-bold text-[#4A3728] text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C05D4D]" />
                  Artisan Heritage & Cluster Profile
                </h3>
                <p className="text-xs text-[#7C6E62] mt-0.5">
                  Details used by the AI Cataloging Engine to establish authentic provenance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A3728] uppercase mb-1">
                    Primary Craft Category
                  </label>
                  <input
                    type="text"
                    value={formData.craftType}
                    onChange={(e) => setFormData({ ...formData, craftType: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3728] uppercase mb-1">
                    Cooperative / SHG Name
                  </label>
                  <input
                    type="text"
                    value={formData.cooperativeName}
                    onChange={(e) => setFormData({ ...formData, cooperativeName: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3728] uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3728] uppercase mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3728] uppercase mb-1">
                    Village / Town / Cluster
                  </label>
                  <input
                    type="text"
                    value={formData.villageOrCity}
                    onChange={(e) => setFormData({ ...formData, villageOrCity: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3728] uppercase mb-1">
                    Years of Craft Experience
                  </label>
                  <input
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#4A3728] uppercase mb-1">
                    Preferred Cataloging Language
                  </label>
                  <select
                    value={formData.preferredLanguage}
                    onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                  >
                    {ALL_SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeName} ({lang.label})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#4A3728] uppercase mb-1">
                    Artisan Story & Heritage Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.craftDescription}
                    onChange={(e) => setFormData({ ...formData, craftDescription: e.target.value })}
                    placeholder="Describe your family's craft lineage, traditional techniques used, and cooperative members involved..."
                    className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D]"
                  />
                </div>
              </div>
            </div>

            {/* Financial / Pehchan Verification */}
            <div className="bg-white rounded-3xl border border-[#E5E1DA] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#F0EDEA] pb-4">
                <h3 className="font-bold text-[#4A3728] text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#C05D4D]" />
                  Direct Payout & Verification
                </h3>
                <p className="text-xs text-[#7C6E62] mt-0.5">
                  Direct bank transfer for buyer inquiries and order disbursements.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A3728] uppercase mb-1">
                    Pehchan / Artisan ID Card No.
                  </label>
                  <input
                    type="text"
                    value={formData.artisanCardId}
                    onChange={(e) => setFormData({ ...formData, artisanCardId: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3728] uppercase mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccountNo}
                    onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3728] uppercase mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={formData.bankIfsc}
                    onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3728] uppercase mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728]"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between">
              {saveSuccess ? (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Profile saved successfully!
                </span>
              ) : (
                <div></div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3.5 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
