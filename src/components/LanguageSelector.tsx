
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Language {
  id: string;
  code: string;
  name: string;
  flag_emoji: string;
  rooms_count?: number;
}

interface LanguageSelectorProps {
  onSelectLanguage: (language: { code: string; name: string }) => void;
}

const LanguageSelector = ({ onSelectLanguage }: LanguageSelectorProps) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguagesWithRoomCounts();
  }, []);

  const fetchLanguagesWithRoomCounts = async () => {
    try {
      // Fetch all languages
      const { data: languagesData, error: languagesError } = await supabase
        .from('languages')
        .select('*')
        .order('name');

      if (languagesError) {
        console.error('Error fetching languages:', languagesError);
        return;
      }

      // Fetch room counts for each language
      const languagesWithCounts = await Promise.all(
        (languagesData || []).map(async (language) => {
          const { count } = await supabase
            .from('rooms')
            .select('*', { count: 'exact', head: true })
            .eq('language_id', language.id)
            .eq('is_active', true);

          return {
            ...language,
            rooms_count: count || 0,
          };
        })
      );

      setLanguages(languagesWithCounts);
    } catch (error) {
      console.error('Error fetching languages with room counts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Choose Your Language</h2>
          <p className="text-muted-foreground text-lg">
            Loading available languages...
          </p>
        </div>
      </div>
    );
  }

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
                {language.flag_emoji}
              </div>
              <h3 className="font-semibold text-lg mb-1">{language.name}</h3>
              <p className="text-sm text-muted-foreground">
                {language.rooms_count} active room{language.rooms_count !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
