
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdBanner from '@/components/AdBanner';
import Header from '@/components/Header';
import LanguageSelector from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<{ code: string; name: string } | null>(null);

  const handleLanguageSelect = (language: { code: string; name: string }) => {
    setSelectedLanguage(language);
    navigate(`/rooms?language=${language.code}`);
  };

  const handleStartSpeaking = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/rooms');
    }
  };

  const handleBrowseRooms = () => {
    navigate('/rooms');
  };

  const handleGetStarted = () => {
    if (!user) {
      navigate('/signup');
    } else {
      navigate('/rooms');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-lingo-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-lingo-200/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -z-10"></div>
      
      <AdBanner />
      <Header />
      
      {/* Hero Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-lingo-100/50 backdrop-blur-sm border border-lingo-200/50 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-lingo-600" />
              <span className="text-sm font-medium text-lingo-700">Join the global conversation</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              Connect. Learn.{' '}
              <span className="bg-gradient-to-r from-lingo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Speak.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join live conversation rooms with native speakers and language learners from around the world. 
              Practice speaking naturally in a supportive community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg" 
                onClick={handleStartSpeaking}
                className="bg-gradient-to-r from-lingo-500 to-lingo-600 hover:from-lingo-600 hover:to-lingo-700 text-white text-lg px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
              >
                Start Speaking Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleBrowseRooms}
                className="text-lg px-10 py-6 rounded-2xl border-2 border-slate-200 hover:border-lingo-300 hover:bg-lingo-50 transition-all duration-300"
              >
                Browse Rooms
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Language Selection */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <LanguageSelector onSelectLanguage={handleLanguageSelect} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-lingo-50/50 to-white/80 backdrop-blur-sm"></div>
        <div className="container mx-auto relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-lingo-100 to-purple-100 rounded-full px-6 py-3 mb-6">
              <Globe className="h-5 w-5 text-lingo-600" />
              <span className="text-sm font-semibold text-lingo-700 uppercase tracking-wide">Why Choose LingoConnect</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              The most natural way to practice
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Connect with real people and practice languages in live conversations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="group relative p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-lingo-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-lingo-500 to-lingo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <span className="text-3xl">🗣️</span>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-slate-800">Real Conversations</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Practice speaking with native speakers and fellow learners in live voice rooms
                </p>
              </div>
            </div>
            
            <div className="group relative p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-slate-800">Global Community</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Connect with language learners and native speakers from around the world
                </p>
              </div>
            </div>
            
            <div className="group relative p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-orange-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <span className="text-3xl">👑</span>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-slate-800">Host Your Own Rooms</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Create and moderate your own language practice rooms with up to 16 participants
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-lingo-500 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to start speaking?</h2>
              <p className="text-xl mb-8 text-lingo-100">Join thousands of language learners already practicing daily</p>
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-white text-lingo-600 hover:bg-lingo-50 text-lg px-10 py-6 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
