
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { countries } from '@/data/countries';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  country?: string;
  native_language: {
    name: string;
    flag_emoji: string;
  };
  learning_language: {
    name: string;
    flag_emoji: string;
  };
}

const UserSearch = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedNativeLanguage, setSelectedNativeLanguage] = useState('all');
  const [selectedLearningLanguage, setSelectedLearningLanguage] = useState('all');
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedCountry, selectedNativeLanguage, selectedLearningLanguage]);

  const fetchLanguages = async () => {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('name');

    if (!error && data) {
      setLanguages(data);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        avatar_url,
        country,
        native_language:languages!profiles_native_language_id_fkey(name, flag_emoji),
        learning_language:languages!profiles_learning_language_id_fkey(name, flag_emoji)
      `)
      .not('full_name', 'is', null);

    if (!error && data) {
      const formattedUsers = data
        .filter(user => user.native_language && user.learning_language)
        .map(user => ({
          id: user.id,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          country: user.country,
          native_language: user.native_language,
          learning_language: user.learning_language
        }));
      
      setUsers(formattedUsers);
    }
    setLoading(false);
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCountry !== 'all') {
      filtered = filtered.filter(user => user.country === selectedCountry);
    }

    if (selectedNativeLanguage !== 'all') {
      filtered = filtered.filter(user => user.native_language.name === selectedNativeLanguage);
    }

    if (selectedLearningLanguage !== 'all') {
      filtered = filtered.filter(user => user.learning_language.name === selectedLearningLanguage);
    }

    setFilteredUsers(filtered);
  };

  const getCountryFlag = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    return country?.flag || '🌍';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-white">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>

        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white hover:bg-slate-700">All Countries</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.name} className="text-white hover:bg-slate-700">
                {country.flag} {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedNativeLanguage} onValueChange={setSelectedNativeLanguage}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Native Language" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white hover:bg-slate-700">All Native Languages</SelectItem>
            {languages.map((lang) => (
              <SelectItem key={lang.id} value={lang.name} className="text-white hover:bg-slate-700">
                {lang.flag_emoji} {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLearningLanguage} onValueChange={setSelectedLearningLanguage}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Learning Language" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white hover:bg-slate-700">All Learning Languages</SelectItem>
            {languages.map((lang) => (
              <SelectItem key={lang.id} value={lang.name} className="text-white hover:bg-slate-700">
                {lang.flag_emoji} {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Language Partners</h2>
        <div className="text-sm text-slate-400">
          {filteredUsers.length} users found
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No users found</h3>
          <p className="text-slate-400">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-slate-700 text-white">
                        {user.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {user.country && (
                      <div className="absolute -bottom-1 -left-1 text-lg">
                        {getCountryFlag(user.country)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{user.full_name}</h3>
                    <p className="text-sm text-slate-400">{user.country}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <Badge variant="secondary" className="bg-slate-700 text-white">
                      Native: {user.native_language.flag_emoji} {user.native_language.name}
                    </Badge>
                  </div>
                  <div>
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      Learning: {user.learning_language.flag_emoji} {user.learning_language.name}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
