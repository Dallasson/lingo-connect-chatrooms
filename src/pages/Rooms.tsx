
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import RoomCard from '@/components/RoomCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus } from 'lucide-react';

// Mock data for demonstration
const mockRooms = [
  {
    id: '1',
    name: 'English Conversation Practice',
    language: 'English',
    languageFlag: '🇺🇸',
    currentUsers: 8,
    maxUsers: 16,
    host: { name: 'Sarah Johnson', avatar: '' },
    speakers: 3,
    isLive: true,
  },
  {
    id: '2',
    name: 'Spanish Learning Circle',
    language: 'Spanish',
    languageFlag: '🇪🇸',
    currentUsers: 12,
    maxUsers: 16,
    host: { name: 'Carlos Martinez', avatar: '' },
    speakers: 4,
    isLive: true,
  },
  {
    id: '3',
    name: 'French Culture & Language',
    language: 'French',
    languageFlag: '🇫🇷',
    currentUsers: 6,
    maxUsers: 12,
    host: { name: 'Marie Dubois', avatar: '' },
    speakers: 2,
    isLive: true,
  },
  {
    id: '4',
    name: 'Arabic for Beginners',
    language: 'Arabic',
    languageFlag: '🇸🇦',
    currentUsers: 4,
    maxUsers: 10,
    host: { name: 'Ahmed Al-Rashid', avatar: '' },
    speakers: 1,
    isLive: false,
  },
];

const Rooms = () => {
  const [searchParams] = useSearchParams();
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRooms, setFilteredRooms] = useState(mockRooms);

  useEffect(() => {
    let filtered = mockRooms;

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(room => 
        room.language.toLowerCase().includes(selectedLanguage.toLowerCase())
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.language.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRooms(filtered);
  }, [selectedLanguage, searchQuery]);

  const handleJoinRoom = (roomId: string) => {
    // This would typically check authentication and then redirect to room
    console.log('Joining room:', roomId);
    // For now, just show an alert
    alert('Please sign in to join a room!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lingo-50 via-white to-lingo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Find Your Perfect Room</h2>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Search Rooms</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name or language..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Language Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Language</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full bg-lingo-500 hover:bg-lingo-600">
                <Plus className="mr-2 h-4 w-4" />
                Create Room
              </Button>
            </div>
          </div>

          {/* Room Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Language Rooms</h1>
              <div className="text-sm text-muted-foreground">
                {filteredRooms.length} rooms available
              </div>
            </div>

            {filteredRooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No rooms found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or language filter
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onJoinRoom={handleJoinRoom}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
