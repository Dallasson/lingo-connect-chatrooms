
import { Card, CardContent } from '@/components/ui/card';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', rooms: 45 },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', rooms: 32 },
  { code: 'fr', name: 'French', flag: '🇫🇷', rooms: 28 },
  { code: 'de', name: 'German', flag: '🇩🇪', rooms: 21 },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', rooms: 18 },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', rooms: 25 },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', rooms: 19 },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', rooms: 16 },
  { code: 'it', name: 'Italian', flag: '🇮🇹', rooms: 14 },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', rooms: 22 },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', rooms: 13 },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', rooms: 11 }
];

interface LanguageSelectorProps {
  onSelectLanguage: (language: { code: string; name: string }) => void;
}

const LanguageSelector = ({ onSelectLanguage }: LanguageSelectorProps) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Language</h2>
        <p className="text-muted-foreground text-lg">
          Select a language to join conversation rooms and practice with native speakers
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {languages.map((language) => (
          <Card 
            key={language.code}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 group"
            onClick={() => onSelectLanguage(language)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {language.flag}
              </div>
              <h3 className="font-semibold text-lg mb-1">{language.name}</h3>
              <p className="text-sm text-muted-foreground">
                {language.rooms} active rooms
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
