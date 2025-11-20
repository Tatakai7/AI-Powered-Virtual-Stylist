import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { WardrobeManager } from './WardrobeManager';
import { OutfitSuggestions } from './OutfitSuggestions';
import { OutfitCatalog } from './OutfitCatalog';
import { StyleProfile } from './StyleProfile';
import { Sparkles, Shirt, BookOpen, User, LogOut, Menu, X } from 'lucide-react';

type Tab = 'suggestions' | 'wardrobe' | 'catalog' | 'profile';

export function Dashboard() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('suggestions');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'suggestions' as Tab, label: 'AI Suggestions', icon: Sparkles, description: 'Get AI outfit recommendations' },
    { id: 'wardrobe' as Tab, label: 'My Wardrobe', icon: Shirt, description: 'Manage your clothing items' },
    { id: 'catalog' as Tab, label: 'Outfit Catalog', icon: BookOpen, description: 'Browse saved outfits' },
    { id: 'profile' as Tab, label: 'Style Profile', icon: User, description: 'Update preferences' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      <nav className="glass-effect sticky top-0 z-40 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Virtual Stylist</h1>
                <p className="text-xs text-gray-700 font-semibold">AI-Powered Fashion</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-800 hover:bg-gray-100 rounded-xl transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className={`lg:w-72 flex-shrink-0 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-3 space-y-2 sticky top-24 border border-gray-100">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-start gap-4 px-5 py-4 rounded-xl transition-all group ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg scale-[1.02]'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-6 h-6 flex-shrink-0 ${activeTab === tab.id ? '' : 'text-gray-600 group-hover:text-pink-500'}`} />
                    <div className="text-left">
                      <div className="font-semibold">{tab.label}</div>
                      <div className={`text-xs mt-0.5 ${activeTab === tab.id ? 'text-white/90' : 'text-gray-700'}`}>
                        {tab.description}
                      </div>
                    </div>
                  </button>
                );
              })}


            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-10 border border-gray-100 min-h-[600px]">
              {activeTab === 'suggestions' && <OutfitSuggestions />}
              {activeTab === 'wardrobe' && <WardrobeManager />}
              {activeTab === 'catalog' && <OutfitCatalog />}
              {activeTab === 'profile' && <StyleProfile />}
            </div>
          </main>
        </div>
      </div>

      <button
        onClick={signOut}
        className="fixed bottom-4 left-4 flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-xl transition shadow-lg z-50"
      >
        <LogOut className="w-4 h-4" />
        <span className="font-semibold">Sign Out</span>
      </button>
    </div>
  );
}
