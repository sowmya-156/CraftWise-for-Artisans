import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Minus,
  AlertTriangle,
  TrendingUp,
  Package,
  Search,
  CheckCircle2,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { api } from '../api';
import { Product } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface InventoryPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ onNavigate }) => {
  const { t, language } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts();
      setProducts(res.products || []);
    } catch (err: any) {
      console.warn('Inventory loading notice:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    setUpdatingId(productId);
    try {
      const res = await api.updateProductStock(productId, newStock);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: res.stock, status: res.status } : p))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.stock || 0) * (p.price || 0), 0);
  const lowStockCount = products.filter((p) => p.stock <= 3).length;

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.craftCategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#4A3728] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E1DA] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#4A3728]">
              Inventory & Stock Control
            </h1>
            <p className="text-xs sm:text-sm text-[#7C6E62] mt-0.5">
              1-tap stock counter to prevent overselling and track direct unit costs.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('add-product')}
            className="px-4 py-2.5 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
          >
            + Add New Craft Item
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E5E1DA] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#7C6E62] uppercase tracking-wider">
                Total Units in Stock
              </span>
              <div className="text-2xl font-bold text-[#4A3728] mt-1">
                {totalStockUnits} <span className="text-sm font-normal text-[#7C6E62]">items</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FBF6F0] text-[#C05D4D] flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E1DA] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#7C6E62] uppercase tracking-wider">
                Total Inventory Value
              </span>
              <div className="text-2xl font-bold text-[#4A3728] mt-1 font-mono">
                ₹{totalInventoryValue.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E1DA] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#7C6E62] uppercase tracking-wider">
                Low Stock Warnings
              </span>
              <div className="text-2xl font-bold text-orange-600 mt-1">
                {lowStockCount} <span className="text-sm font-normal text-[#7C6E62]">crafts</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#7C6E62] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter inventory by craft title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D] shadow-2xs"
          />
        </div>

        {/* Inventory List / Table */}
        <div className="bg-white rounded-3xl border border-[#E5E1DA] overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-[#7C6E62] text-sm">
              Loading inventory levels...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-[#7C6E62] text-sm">
              No products found.
            </div>
          ) : (
            <div className="divide-y divide-[#F0EDEA]">
              {filteredProducts.map((prod) => {
                const activeImg =
                  prod.preferredImage === 'enhanced'
                    ? prod.enhancedImage || prod.primaryImage
                    : prod.primaryImage;
                const isLow = prod.stock <= 3;

                return (
                  <div
                    key={prod.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#FAF9F6]/80 transition-colors"
                  >
                    {/* Craft Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#FAF9F6] overflow-hidden shrink-0 border border-[#E5E1DA] p-1 flex items-center justify-center">
                        <img
                          src={activeImg}
                          alt={prod.title}
                          className="w-full h-full object-contain rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-[#7C6E62]">
                            {prod.craftCategory}
                          </span>
                          {isLow && (
                            <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Low Stock
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-[#4A3728]">{prod.title}</h4>
                        <div className="text-xs text-[#7C6E62] mt-0.5 flex items-center gap-3">
                          <span className="font-bold text-[#4A3728]">₹{prod.price}</span>
                          <span>•</span>
                          <span>Value: ₹{(prod.stock * prod.price).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Counter Stepper */}
                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="flex items-center gap-2 bg-[#FAF9F6] p-1 rounded-xl border border-[#E5E1DA]">
                        <button
                          type="button"
                          disabled={updatingId === prod.id || prod.stock <= 0}
                          onClick={() => handleStockUpdate(prod.id, prod.stock - 1)}
                          className="w-8 h-8 rounded-lg bg-white text-[#4A3728] font-bold flex items-center justify-center hover:bg-[#F0EDEA] disabled:opacity-40 shadow-2xs border border-[#E5E1DA]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <span className="w-12 text-center text-sm font-bold text-[#4A3728] font-mono">
                          {prod.stock}
                        </span>

                        <button
                          type="button"
                          disabled={updatingId === prod.id}
                          onClick={() => handleStockUpdate(prod.id, prod.stock + 1)}
                          className="w-8 h-8 rounded-lg bg-[#C05D4D] text-white font-bold flex items-center justify-center hover:bg-[#A34E41] disabled:opacity-40 shadow-2xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onNavigate('product-detail', { id: prod.id })}
                        className="text-xs font-bold text-[#C05D4D] hover:text-[#8C3E33] transition-colors"
                      >
                        Details →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
