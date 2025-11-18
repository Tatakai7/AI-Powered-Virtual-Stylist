import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Outfit, WardrobeItem } from '../lib/supabase';
import { Heart, Trash2, Share2, Filter } from 'lucide-react';

export function OutfitCatalog() {
  const { user } = useAuth();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOccasion, setFilterOccasion] = useState<string>('all');
  const [shareModalOutfit, setShareModalOutfit] = useState<Outfit | null>(null);
  const [shareLink, setShareLink] = useState('');

  const occasions = ['all', 'casual', 'work', 'formal', 'date', 'workout', 'party', 'weekend'];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);

    const [outfitsResult, itemsResult] = await Promise.all([
      supabase
        .from('outfits')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user!.id),
    ]);

    if (outfitsResult.data) setOutfits(outfitsResult.data);
    if (itemsResult.data) setWardrobeItems(itemsResult.data);

    setLoading(false);
  };

  const toggleFavorite = async (outfit: Outfit) => {
    const { error } = await supabase
      .from('outfits')
      .update({ is_favorite: !outfit.is_favorite })
      .eq('id', outfit.id);

    if (!error) {
      await loadData();
    }
  };

  const deleteOutfit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this outfit?')) return;

    const { error } = await supabase
      .from('outfits')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadData();
    }
  };

  const shareOutfit = async (outfit: Outfit) => {
    const { data, error } = await supabase
      .from('shared_outfits')
      .insert({
        outfit_id: outfit.id,
        user_id: user!.id,
      })
      .select()
      .single();

    if (!error && data) {
      const link = `${window.location.origin}/shared/${data.share_token}`;
      setShareLink(link);
      setShareModalOutfit(outfit);
    }
  };

  const getOutfitItems = (outfit: Outfit): WardrobeItem[] => {
    const itemIds = Array.isArray(outfit.items) ? outfit.items : [];
    return itemIds
      .map(id => wardrobeItems.find(item => item.id === id))
      .filter(Boolean) as WardrobeItem[];
  };

  const filteredOutfits = filterOccasion === 'all'
    ? outfits
    : outfits.filter(outfit => outfit.occasion === filterOccasion);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-gray-950">Outfit Catalog</h2>
          <p className="text-gray-800 mt-1 font-semibold">{outfits.length} saved outfits</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-gray-700" />
        <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
          {occasions.map(occasion => (
            <button
              key={occasion}
              onClick={() => setFilterOccasion(occasion)}
              className={`px-6 py-3 rounded-xl font-semibold transition capitalize whitespace-nowrap ${
                filterOccasion === occasion
                  ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {occasion}
            </button>
          ))}
        </div>
      </div>

      {filteredOutfits.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-900 text-lg font-bold">No outfits found</p>
          <p className="text-gray-800 mt-2 font-semibold">
            {filterOccasion === 'all'
              ? 'Generate some AI suggestions to save your first outfit'
              : `No outfits saved for ${filterOccasion} occasions`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOutfits.map(outfit => {
            const items = getOutfitItems(outfit);
            return (
              <div
                key={outfit.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-6">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {items.slice(0, 4).map(item => (
                      <div
                        key={item.id}
                        className="aspect-square bg-white rounded-lg flex items-center justify-center shadow-sm"
                      >
                        <div
                          className="w-16 h-16 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-950 mb-1">{outfit.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full capitalize">
                          {outfit.occasion}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {Math.round(outfit.ai_score * 100)}% match
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(outfit)}
                      className="text-gray-400 hover:text-rose-500 transition"
                      aria-label="Toggle Favorite"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          outfit.is_favorite ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => shareOutfit(outfit)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button
                      onClick={() => deleteOutfit(outfit.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                      aria-label="Delete Outfit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {shareModalOutfit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-950 mb-4">Share Outfit</h3>
            <p className="text-gray-800 mb-4 font-semibold">
              Share this outfit with your friends! They can view it even without an account.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="w-full bg-transparent text-sm text-gray-900 outline-none font-medium"
                aria-label="Share Link"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                }}
                className="flex-1 bg-gradient-to-r from-rose-400 to-orange-400 text-white font-semibold py-2 rounded-lg hover:from-rose-500 hover:to-orange-500 transition"
              >
                Copy Link
              </button>
              <button
                onClick={() => {
                  setShareModalOutfit(null);
                  setShareLink('');
                }}
                className="px-6 bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
