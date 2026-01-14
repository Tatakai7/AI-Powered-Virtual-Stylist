import { useState, useEffect } from 'react';
import { supabase } from '../firebase/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { WardrobeItem } from '../firebase/supabase';
import { Plus, X, Shirt, Tag, Calendar, Palette, Sparkles } from 'lucide-react';

const CATEGORIES = ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear'];
const SEASONS = ['spring', 'summer', 'fall', 'winter', 'all-season'];
const COLORS = [
  { name: 'black', hex: '#000000' },
  { name: 'white', hex: '#FFFFFF' },
  { name: 'gray', hex: '#6B7280' },
  { name: 'beige', hex: '#D4C5B9' },
  { name: 'navy', hex: '#1E3A8A' },
  { name: 'blue', hex: '#3B82F6' },
  { name: 'green', hex: '#10B981' },
  { name: 'red', hex: '#EF4444' },
  { name: 'pink', hex: '#EC4899' },
  { name: 'orange', hex: '#F97316' },
  { name: 'yellow', hex: '#FBBF24' },
  { name: 'brown', hex: '#78350F' },
];
const STYLE_TAGS = ['casual', 'formal', 'sporty', 'elegant', 'bohemian', 'minimalist', 'streetwear', 'vintage'];

export function WardrobeManager() {
  const { user } = useAuth();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'tops' as WardrobeItem['category'],
    color: 'black',
    season: 'all-season' as WardrobeItem['season'],
    style_tags: [] as string[],
    image_url: '',
  });

  useEffect(() => {
    if (user) {
      loadWardrobeItems();
    }
  }, [user]);

  const loadWardrobeItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  const addItem = async () => {
    if (!newItem.name.trim()) return;

    const { error } = await supabase.from('wardrobe_items').insert({
      user_id: user!.id,
      ...newItem,
    });

    if (!error) {
      await loadWardrobeItems();
      setShowAddModal(false);
      setNewItem({
        name: '',
        category: 'tops',
        color: 'black',
        season: 'all-season',
        style_tags: [],
        image_url: '',
      });
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('wardrobe_items')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadWardrobeItems();
    }
  };

  const toggleStyleTag = (tag: string) => {
    setNewItem(prev => ({
      ...prev,
      style_tags: prev.style_tags.includes(tag)
        ? prev.style_tags.filter(t => t !== tag)
        : [...prev.style_tags, tag],
    }));
  };

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory);

  const getColorHex = (colorName: string) => {
    return COLORS.find(c => c.name === colorName)?.hex || '#000000';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">My Wardrobe</h2>
          <p className="text-gray-800 flex items-center gap-2 font-semibold">
            <Shirt className="w-4 h-4" />
            {items.length} pieces in your collection
          </p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 font-semibold'
          }`}
        >
          All Items
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-3 rounded-xl font-medium transition-all capitalize whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 font-semibold'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
          >
            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <div className="relative">
                  <div
                    className="w-32 h-32 rounded-full shadow-xl group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: getColorHex(item.color) }}
                  />
                  <Shirt className="absolute inset-0 m-auto w-16 h-16 text-white/30" />
                </div>
              )}
              <button
                onClick={() => deleteItem(item.id)}
                className="absolute top-3 right-3 bg-red-500 text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg transform hover:scale-110"
                aria-label="Delete Item"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-gray-950 mb-3 text-lg truncate">{item.name}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <span className="px-3 py-1 bg-pink-50 text-pink-700 text-xs font-medium rounded-full capitalize">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full capitalize">
                    {item.season}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-gray-600" />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full shadow-sm border-2 border-white"
                      style={{ backgroundColor: getColorHex(item.color) }}
                    />
                    <span className="text-sm text-gray-900 capitalize font-semibold">{item.color}</span>
                  </div>
                </div>
              </div>
              {item.style_tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-100">
                  {item.style_tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-900 text-xs rounded-lg capitalize font-medium">
                      {tag}
                    </span>
                  ))}
                  {item.style_tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-900 text-xs rounded-lg font-medium">
                      +{item.style_tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-pink-500" />
          </div>
          <p className="text-gray-950 text-xl font-bold mb-2">No items yet</p>
          <p className="text-gray-800 mb-6 font-medium">
            {selectedCategory === 'all'
              ? 'Start building your digital wardrobe'
              : `Add some ${selectedCategory} to your collection`}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-orange-600 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Your First Item
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-950">Add New Item</h3>
                  <p className="text-sm text-gray-700 font-medium">Build your digital wardrobe</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition"
                aria-label="Close Add Item Modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label htmlFor="item-name" className="block text-sm font-bold text-gray-950 mb-3">
                  Item Name
                </label>
                <input
                  id="item-name"
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition outline-none text-gray-900 placeholder-gray-400"
                  placeholder="e.g., Blue Denim Jacket"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-950 mb-3">
                  Category
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewItem({ ...newItem, category: cat as WardrobeItem['category'] })}
                      className={`py-3 px-4 rounded-xl font-medium transition-all capitalize ${
                        newItem.category === cat
                          ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-950 mb-3">
                  Color
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {COLORS.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setNewItem({ ...newItem, color: color.name })}
                      className={`relative h-16 rounded-xl transition-all ${
                        newItem.color === color.name ? 'ring-4 ring-pink-500 ring-offset-2 scale-110' : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: color.hex,
                        border: color.name === 'white' ? '2px solid #E5E7EB' : 'none'
                      }}
                      title={color.name}
                    >
                      {newItem.color === color.name && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-950 mb-3">
                  Season
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {SEASONS.map(season => (
                    <button
                      key={season}
                      onClick={() => setNewItem({ ...newItem, season: season as WardrobeItem['season'] })}
                      className={`py-3 px-4 rounded-xl font-medium transition-all capitalize ${
                        newItem.season === season
                          ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-950 mb-3">
                  Style Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleStyleTag(tag)}
                      className={`px-5 py-2.5 rounded-xl font-medium transition-all capitalize ${
                        newItem.style_tags.includes(tag)
                          ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="image-url" className="block text-sm font-bold text-gray-950 mb-3">
                  Image URL <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="image-url"
                  type="text"
                  value={newItem.image_url}
                  onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition outline-none text-gray-900 placeholder-gray-400"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <button
                onClick={addItem}
                disabled={!newItem.name.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-5 rounded-xl hover:from-pink-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-pink-500/50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Add to Wardrobe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
