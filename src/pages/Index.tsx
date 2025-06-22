
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdBanner from '@/components/AdBanner';
import Header from '@/components/Header';
import LanguageSelector from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<{ code: string; name: string } | null>(null);

  const handleLanguageSelect = (language: { code: string; name: string }) => {
    setSelectedLanguage(language);
    // Navigate to rooms page with language filter
    navigate(`/rooms?language=${language.code}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lingo-50 via-white to-lingo-100">
      <AdBanner />
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Connect. Learn. 
              <span className="gradient-text"> Speak.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join live conversation rooms with native speakers and language learners from around the world. 
              Practice speaking naturally in a supportive community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-lingo-500 hover:bg-lingo-600 text-lg px-8 py-6">
                Start Speaking Now
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Browse Rooms
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Language Selection */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <LanguageSelector onSelectLanguage={handleLanguageSelect} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose LingoConnect?</h2>
            <p className="text-xl text-muted-foreground">
              The most natural way to practice languages with real people
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-lingo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🗣️</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Real Conversations</h3>
              <p className="text-muted-foreground">
                Practice speaking with native speakers and fellow learners in live voice rooms
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-lingo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Global Community</h3>
              <p className="text-muted-foreground">
                Connect with language learners and native speakers from around the world
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-lingo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">👑</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Host Your Own Rooms</h3>
              <p className="text-muted-foreground">
                Create and moderate your own language practice rooms with up to 16 participants
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
