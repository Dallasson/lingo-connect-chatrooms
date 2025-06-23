
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import RoomCard from '@/components/RoomCard';
import CreateRoomDialog from '@/components/CreateRoomDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: string;
  name: string;
  description?: string;
  language: {
    name: string;
    flag_emoji: string;
    code: string;
  };
  host: {
    full_name: string;
    avatar_url?: string;
  };
  participant_count: number;
  max_participants: number;
  is_active: boolean;
}

const Rooms = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  useEffect(() => {
    fetchLanguages();
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [selectedLanguage, searchQuery]);

  const fetchLanguages = async () => {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching languages:', error);
    } else {
      setLanguages(data || []);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    
    let query = supabase
      .from('rooms')
      .select(`
        *,
        languages (name, flag_emoji, code),
        profiles (full_name, avatar_url),
        room_participants (count)
      `)
      .eq('is_active', true);

    if (selectedLanguage !== 'all') {
      const selectedLang = languages.find(lang => lang.code === selectedLanguage);
      if (selectedLang) {
        query = query.eq('language_id', selectedLang.id);
      }
    }

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load rooms",
        variant: "destructive",
      });
    } else {
      const formattedRooms = data?.map((room: any) => ({
        id: room.id,
        name: room.name,
        description: room.description,
        language: {
          name: room.languages.name,
          flag_emoji: room.languages.flag_emoji,
          code: room.languages.code,
        },
        host: {
          full_name: room.profiles.full_name || 'Unknown Host',
          avatar_url: room.profiles.avatar_url,
        },
        participant_count: room.room_participants?.length || 0,
        max_participants: room.max_participants,
        is_active: room.is_active,
      })) || [];
      
      setRooms(formattedRooms);
    }
    
    setLoading(false);
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join a room",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    // Check if user is already in the room
    const { data: existingParticipant } = await supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    if (existingParticipant) {
      toast({
        title: "Already in Room",
        description: "You are already a participant in this room",
      });
      return;
    }

    // Add user to room participants
    const { error } = await supabase
      .from('room_participants')
      .insert({
        room_id: roomId,
        user_id: user.id,
        role: 'audience'
      });

    if (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Error",
        description: "Failed to join room",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Successfully joined the room!",
      });
      // Navigate to room page (to be implemented)
      navigate(`/room/${roomId}`);
    }
  };

  const handleCreateRoom = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a room",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    setShowCreateRoom(true);
  };

  const filteredRooms = rooms.filter(room => {
    const matchesLanguage = selectedLanguage === 'all' || room.language.code === selectedLanguage;
    const matchesSearch = !searchQuery || 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.language.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesLanguage && matchesSearch;
  });

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
                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.code}>
                        {lang.flag_emoji} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleCreateRoom}
                className="w-full bg-lingo-500 hover:bg-lingo-600"
              >
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

            {loading ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⏳</div>
                <h3 className="text-xl font-semibold mb-2">Loading rooms...</h3>
                <p className="text-muted-foreground">
                  Please wait while we fetch the latest rooms
                </p>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No rooms found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or language filter, or create your own room!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={{
                      id: room.id,
                      name: room.name,
                      language: room.language.name,
                      languageFlag: room.language.flag_emoji,
                      currentUsers: room.participant_count,
                      maxUsers: room.max_participants,
                      host: {
                        name: room.host.full_name,
                        avatar: room.host.avatar_url,
                      },
                      speakers: Math.min(room.participant_count, 8), // Assuming max 8 speakers
                      isLive: room.is_active,
                    }}
                    onJoinRoom={handleJoinRoom}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateRoomDialog 
        open={showCreateRoom}
        onOpenChange={setShowCreateRoom}
        onRoomCreated={fetchRooms}
      />
    </div>
  );
};

export default Rooms;
