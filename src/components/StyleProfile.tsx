import { useState, useEffect } from 'react';
import { supabase } from '../firebase/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, MapPin, Palette } from 'lucide-react';

const STYLE_PREFERENCES = [
  { id: 'minimalist', label: 'Minimalist', description: 'Clean lines and simple aesthetics' },
  { id: 'bohemian', label: 'Bohemian', description: 'Free-spirited and artistic' },
  { id: 'classic', label: 'Classic', description: 'Timeless and elegant' },
  { id: 'streetwear', label: 'Streetwear', description: 'Urban and trendy' },
  { id: 'preppy', label: 'Preppy', description: 'Polished and traditional' },
  { id: 'edgy', label: 'Edgy', description: 'Bold and daring' },
  { id: 'romantic', label: 'Romantic', description: 'Soft and feminine' },
  { id: 'sporty', label: 'Sporty', description: 'Active and comfortable' },
];

export function StyleProfile() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .maybeSingle();

    if (data) {
      setFullName(data.full_name);
      setLocation(data.location);
      setSelectedStyles(data.style_preferences?.styles || []);
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        location: location,
        style_preferences: { styles: selectedStyles },
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id);

    if (!error) {
      await loadProfile();
    }

    setSaving(false);
  };

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev =>
      prev.includes(styleId)
        ? prev.filter(s => s !== styleId)
        : [...prev, styleId]
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-4xl font-bold text-gray-950 mb-2">Style Profile</h2>
        <p className="text-gray-800 font-semibold">Personalize your experience with style preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-950 mb-2">
            <User className="w-4 h-4" />
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-gray-900 font-medium"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-950 mb-2">
            <MapPin className="w-4 h-4" />
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-gray-900 font-medium"
            placeholder="e.g., New York, NY"
          />
          <p className="text-sm text-gray-700 mt-1 font-medium">
            Used for weather-based outfit recommendations
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-5 h-5 text-rose-500" />
          <h3 className="text-lg font-bold text-gray-950">Style Preferences</h3>
        </div>
        <p className="text-gray-800 text-sm font-medium">
          Select styles that resonate with you to get better recommendations
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {STYLE_PREFERENCES.map(style => (
            <button
              key={style.id}
              onClick={() => toggleStyle(style.id)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                selectedStyles.includes(style.id)
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-gray-950 mb-1">{style.label}</h4>
                  <p className="text-sm text-gray-800 font-medium">{style.description}</p>
                </div>
                {selectedStyles.includes(style.id) && (
                  <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={saveProfile}
        disabled={saving}
        className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-5 rounded-xl hover:from-pink-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
}
