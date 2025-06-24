
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Users, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import CreateRoomDialog from '@/components/CreateRoomDialog';
import { useLanguage } from '@/hooks/useLanguage';
import { countries } from '@/data/countries';

interface Room {
  id: string;
  name: string;
  description?: string;
  host_id: string;
  language_id: string;
  max_participants: number;
  created_at: string;
  languages: {
    name: string;
    flag_emoji: string;
  };
  profiles: {
    full_name: string;
    avatar_url?: string;
    country?: string;
  };
  participant_count?: number;
}

const Rooms = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchRooms();
  }, [user, navigate]);

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        languages (name, flag_emoji),
        profiles (full_name, avatar_url, country),
        room_participants (count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rooms:', error);
    } else {
      const roomsWithCount = data?.map(room => ({
        ...room,
        participant_count: room.room_participants?.length || 0
      })) || [];
      setRooms(roomsWithCount);
    }
    setLoading(false);
  };

  const getCountryFlag = (countryName?: string) => {
    if (!countryName) return '🌍';
    const country = countries.find(c => c.name === countryName);
    return country?.flag || '🌍';
  };

  const joinRoom = async (roomId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('room_participants')
      .insert({
        room_id: roomId,
        user_id: user.id,
        role: 'audience'
      });

    if (error) {
      console.error('Error joining room:', error);
    } else {
      navigate(`/room/${roomId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">Loading rooms...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('rooms')}</h1>
            <p className="text-slate-300">Join language exchange rooms and practice with native speakers</p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('create_room')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Globe className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No rooms available</h3>
              <p className="text-slate-400 mb-6">Be the first to create a language exchange room!</p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('create_room')}
              </Button>
            </div>
          ) : (
            rooms.map((room) => (
              <Card key={room.id} className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{room.languages.flag_emoji}</div>
                      <div>
                        <CardTitle className="text-white text-lg">{room.name}</CardTitle>
                        <Badge variant="secondary" className="bg-blue-900 text-blue-100 text-xs">
                          {room.languages.name}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center text-slate-400 text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      {room.participant_count}/{room.max_participants}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {room.description && (
                    <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                      {room.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={room.profiles.avatar_url} />
                          <AvatarFallback className="bg-slate-700 text-white text-xs">
                            {room.profiles.full_name?.charAt(0) || 'H'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -left-1 text-xs">
                          {getCountryFlag(room.profiles.country)}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-300 text-xs">Host</p>
                        <p className="text-white text-sm font-medium">
                          {room.profiles.full_name}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => joinRoom(room.id)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={room.participant_count >= room.max_participants}
                    >
                      {room.participant_count >= room.max_participants ? 'Full' : t('join_room')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <CreateRoomDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onRoomCreated={() => {
          setShowCreateDialog(false);
          fetchRooms();
        }}
      />
    </div>
  );
};

export default Rooms;
