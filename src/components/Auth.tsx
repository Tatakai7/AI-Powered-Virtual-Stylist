import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-rose-900/20 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl animate-float animate-float-delayed"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-3xl"></div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="text-white space-y-8 hidden lg:block">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-effect border border-white/10">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <span className="text-sm font-semibold text-white">AI-Powered Fashion Assistant</span>
            </div>

            <div>
              <h1 className="text-6xl font-bold mb-6 leading-tight">
                Your Personal
                <span className="block text-gradient">Style Revolution</span>
              </h1>
              <p className="text-xl text-gray-200 leading-relaxed font-medium">
                Elevate your wardrobe with intelligent outfit suggestions powered by advanced AI.
                Weather-aware recommendations that match your unique style.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-gradient">10K+</div>
                <div className="text-sm text-pink-500 font-medium">Outfits Created</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-gradient">98%</div>
                <div className="text-sm text-pink-500 font-medium">Satisfaction</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-gradient">5K+</div>
                <div className="text-sm text-pink-500 font-medium">Happy Users</div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto">
            <div className="glass-effect rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/10">
              <div className="text-center mb-8 lg:hidden">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl mb-4 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Virtual Stylist</h2>
              </div>

              <div className="flex gap-2 mb-8">
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                  }}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    !isSignUp
                      ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg'
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
                  }}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    isSignUp
                      ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg'
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {isSignUp && (
                  <div className="group">
                    <label htmlFor="fullName" className="block text-sm font-semibold text-white mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-pink-400 transition" />
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={isSignUp}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition outline-none"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>
                )}

                <div className="group">
                  <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-pink-400 transition" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-pink-400 transition" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition outline-none"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold py-4 rounded-xl hover:from-pink-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-pink-500/50 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    'Processing...'
                  ) : (
                    <>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-300 font-medium">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
