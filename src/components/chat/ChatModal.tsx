import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Store,
  Clock,
  Globe2,
  ChevronRight,
  ArrowLeft,
  Search,
  Plus,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../api';
import { ChatConversation, User } from '../../types';
import { ChatWindow } from './ChatWindow';
import { CHAT_LANGUAGES } from './ChatLanguages';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  conversationId?: string;
  currentUser?: User | null;
  onNavigateToProduct?: (slug?: string) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  productId,
  conversationId: propConversationId,
  currentUser,
  onNavigateToProduct
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    propConversationId || null
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // When productId changes, or modal opens with productId
  useEffect(() => {
    if (!isOpen) return;

    const initChat = async () => {
      if (propConversationId) {
        setSelectedConversationId(propConversationId);
        return;
      }

      if (productId) {
        setLoading(true);
        try {
          const res = await api.startChatConversation({
            productId,
            buyerName: currentUser?.fullName || 'Interested Buyer',
            buyerLanguage: currentUser?.preferredLanguage || 'en'
          });
          setSelectedConversationId(res.conversation.id);
        } catch (err) {
          console.error('Failed to initialize product chat:', err);
        } finally {
          setLoading(false);
        }
      } else {
        // Load all conversations for user
        loadConversations();
      }
    };

    initChat();
  }, [isOpen, productId, propConversationId, currentUser]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await api.getChatConversations({
        userId: currentUser?.id,
        role: currentUser?.role
      });
      setConversations(res.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !currentUser) return null;

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.productTitle.toLowerCase().includes(q) ||
      c.artisanName.toLowerCase().includes(q) ||
      c.buyerName.toLowerCase().includes(q) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-[92vh] sm:h-[84vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[#E5E1DA]">
        {selectedConversationId ? (
          <div className="relative flex-1 flex flex-col h-full">
            {/* Back button overlay on mobile / top bar */}
            <div className="bg-[#FAF9F6] border-b border-[#E5E1DA] px-3 py-1.5 flex items-center justify-between text-xs text-[#7C6E62]">
              <button
                type="button"
                onClick={() => {
                  setSelectedConversationId(null);
                  loadConversations();
                }}
                className="flex items-center gap-1 hover:text-[#C05D4D] font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Conversations</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:text-[#C05D4D] transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <ChatWindow
                conversationId={selectedConversationId}
                currentUser={currentUser}
                onClose={onClose}
                onNavigateToProduct={(slug) => {
                  onClose();
                  if (onNavigateToProduct) onNavigateToProduct(slug);
                }}
              />
            </div>
          </div>
        ) : (
          /* CONVERSATIONS LIST VIEW */
          <div className="flex-1 flex flex-col h-full bg-[#FAF9F6]">
            {/* Header */}
            <div className="bg-white border-b border-[#E5E1DA] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#C05D4D]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base text-[#4A3728]">
                    Multilingual Chat & Enquiries
                  </h2>
                  <p className="text-xs text-[#7C6E62]">
                    Automatic 9-Language Translation & Price Bargaining
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl border border-[#E5E1DA] hover:bg-stone-100 text-[#7C6E62] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search filter */}
            <div className="p-3 bg-white/70 border-b border-[#E5E1DA]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#7C6E62] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search craft conversations or messages..."
                  className="w-full bg-[#FAF9F6] border border-[#E5E1DA] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-[#4A3728] focus:outline-hidden focus:border-[#C05D4D]"
                />
              </div>
            </div>

            {/* Conversations list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#C05D4D] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12 px-4 text-[#7C6E62]">
                  <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="font-bold text-sm text-[#4A3728]">No active chats yet</p>
                  <p className="text-xs mt-1 max-w-sm mx-auto">
                    Click the <strong>Chat with Artisan</strong> button on any craft in the Marketplace to start a live multilingual enquiry!
                  </p>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const artisanLang = CHAT_LANGUAGES[c.artisanLanguage]?.native || c.artisanLanguage;
                  const buyerLang = CHAT_LANGUAGES[c.buyerLanguage]?.native || c.buyerLanguage;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedConversationId(c.id)}
                      className="bg-white hover:bg-[#FDFBF7] border border-[#E5E1DA] hover:border-[#C05D4D]/50 p-3 rounded-2xl cursor-pointer transition-all shadow-2xs flex items-center gap-3.5 group"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-[#F4F1ED] overflow-hidden shrink-0 border border-[#E5E1DA]">
                        <img
                          src={c.productImage}
                          alt={c.productTitle}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>

                      {/* Conversation Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <h4 className="font-serif font-bold text-sm text-[#4A3728] truncate">
                              {c.productTitle}
                            </h4>
                            {c.isBlocked && (
                              <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 text-[10px] font-bold border border-red-200 flex items-center gap-0.5 shrink-0">
                                <Lock className="w-2.5 h-2.5" /> Blocked
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-[#C05D4D] shrink-0">
                            ₹{c.productPrice.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#7C6E62] mt-0.5">
                          <span className="flex items-center gap-1 font-medium text-[#4A3728]">
                            <Store className="w-3 h-3 text-[#C05D4D]" />
                            {c.artisanName}
                          </span>
                          <span>•</span>
                          <span className="text-[11px]">
                            {buyerLang} ↔ {artisanLang}
                          </span>
                        </div>

                        {c.lastMessage && (
                          <p className="text-xs text-[#7C6E62] truncate mt-1 italic">
                            "{c.lastMessage}"
                          </p>
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-[#C05D4D] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
