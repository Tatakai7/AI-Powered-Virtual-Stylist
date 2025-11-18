import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { WardrobeItem, Outfit } from '../lib/supabase';
import { generateOutfitSuggestions, fetchWeather, type WeatherData } from '../lib/ai';
import { Sparkles, Heart, Save, Cloud, Sun, CloudRain, Snowflake, Wind } from 'lucide-react';

const OCCASIONS = ['casual', 'work', 'formal', 'date', 'workout', 'party', 'weekend'];

export function OutfitSuggestions() {
  const { user } = useAuth();
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [suggestions, setSuggestions] = useState<Array<{ items: WardrobeItem[]; score: number; reason: string }>>([]);
  const [selectedOccasion, setSelectedOccasion] = useState('casual');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);

  useEffect(() => {
    if (user) {
      loadWardrobeItems();
      loadSavedOutfits();
      loadWeather();
    }
  }, [user]);

  const loadWardrobeItems = async () => {
    const { data } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user!.id);

    if (data) {
      setWardrobeItems(data);
    }
  };

  const loadSavedOutfits = async () => {
    const { data } = await supabase
      .from('outfits')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (data) {
      setSavedOutfits(data);
    }
  };

  const loadWeather = async () => {
    const weatherData = await fetchWeather('default');
    setWeather(weatherData);
  };

  const generateSuggestions = () => {
    setLoading(true);
    const results = generateOutfitSuggestions(wardrobeItems, selectedOccasion, weather || undefined);
    setSuggestions(results);
    setLoading(false);
  };

  const saveOutfit = async (outfitItems: WardrobeItem[], score: number, reason: string) => {
    const itemIds = outfitItems.map(item => item.id);

    const { error } = await supabase.from('outfits').insert({
      user_id: user!.id,
      name: `${selectedOccasion.charAt(0).toUpperCase() + selectedOccasion.slice(1)} Outfit`,
      occasion: selectedOccasion,
      season: wardrobeItems[0]?.season || 'all-season',
      items: itemIds,
      ai_score: score,
      reason: reason,
      is_favorite: false,
    });

    if (!error) {
      await loadSavedOutfits();
    }
  };

  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="w-5 h-5" />;

    switch (weather.condition) {
      case 'rainy':
      case 'drizzle':
        return <CloudRain className="w-5 h-5" />;
      case 'snowy':
        return <Snowflake className="w-5 h-5" />;
      case 'stormy':
        return <Wind className="w-5 h-5" />;
      default:
        return <Sun className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-bold text-gray-950 mb-2">AI Outfit Suggestions</h2>
        <p className="text-gray-800 font-semibold">Get personalized outfit recommendations powered by AI</p>
      </div>

      {weather && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 flex items-center gap-3">
          <div className="text-blue-600">
            {getWeatherIcon()}
          </div>
          <div>
            <p className="text-sm text-gray-800 font-semibold">Current Weather</p>
            <p className="font-bold text-gray-950">
              {Math.round(weather.temp)}°F • {weather.condition}
            </p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-bold text-gray-950 mb-3">
          Select Occasion
        </label>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map(occasion => (
            <button
              key={occasion}
              onClick={() => setSelectedOccasion(occasion)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                selectedOccasion === occasion
                  ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 font-semibold'
              }`}
            >
              {occasion}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={generateSuggestions}
        disabled={loading || wardrobeItems.length < 2}
        className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-4 rounded-xl hover:from-pink-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
      >
        <Sparkles className="w-5 h-5" />
        {loading ? 'Generating...' : 'Generate AI Suggestions'}
      </button>

      {wardrobeItems.length < 2 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-900 font-semibold">Add at least 2 items to your wardrobe to get outfit suggestions</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-950">Recommended Outfits</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-rose-500" />
                    <span className="font-bold text-gray-950">
                      AI Score: {Math.round(suggestion.score * 100)}%
                    </span>
                  </div>
                  <button
                    onClick={() => saveOutfit(suggestion.items, suggestion.score, suggestion.reason)}
                    className="text-rose-500 hover:text-rose-600 transition"
                    aria-label="Save Outfit"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-gray-800 mb-4 font-semibold">{suggestion.reason}</p>

                <div className="grid grid-cols-2 gap-3">
                  {suggestion.items.map(item => (
                    <div
                      key={item.id}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3"
                    >
                      <div className="aspect-square bg-white rounded-lg mb-2 flex items-center justify-center">
                        <div
                          className="w-12 h-12 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                      <p className="text-sm font-bold text-gray-950 truncate">{item.name}</p>
                      <p className="text-xs text-gray-800 capitalize font-semibold">{item.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {savedOutfits.length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="text-2xl font-bold text-gray-950">Saved Outfits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedOutfits.slice(0, 6).map(outfit => (
              <div
                key={outfit.id}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-950">{outfit.name}</h4>
                  <Heart className={outfit.is_favorite ? 'fill-rose-500 text-rose-500' : 'text-gray-400'} />
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full capitalize">
                    {outfit.occasion}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Score: {Math.round(outfit.ai_score * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
