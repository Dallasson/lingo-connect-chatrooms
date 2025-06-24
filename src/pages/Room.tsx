
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Mic, MicOff, Users, Settings, LogOut } from 'lucide-react';
import Header from '@/components/Header';
import RoomControls from '@/components/RoomControls';
import RoomChat from '@/components/RoomChat';
import RoomSettingsDialog from '@/components/RoomSettingsDialog';
import { countries } from '@/data/countries';

interface RoomData {
  id: string;
  name: string;
  description?: string;
  host_id: string;
  language_id: string;
  max_participants: number;
  language: {
    name: string;
    flag_emoji: string;
  };
  profiles: {
    full_name: string;
    avatar_url?: string;
    country?: string;
  };
}

interface Participant {
  user_id: string;
  role: 'host' | 'co_host' | 'speaker' | 'audience';
  is_muted: boolean;
  profiles: {
    full_name: string;
    avatar_url?: string;
    country?: string;
    email?: string;
  };
}

const Room = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [room, setRoom] = useState<RoomData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const { isMuted, toggleMute } = useWebRTC(roomId || '', user?.id || '');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (roomId) {
      fetchRoomData();
      fetchParticipants();
      joinRoom();
    }
  }, [roomId, user]);

  const fetchRoomData = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        languages (name, flag_emoji),
        profiles (full_name, avatar_url, country)
      `)
      .eq('id', roomId)
      .single();

    if (error) {
      console.error('Error fetching room:', error);
      toast({
        title: "Error",
        description: "Failed to load room",
        variant: "destructive",
      });
      navigate('/rooms');
    } else if (data) {
      const roomData: RoomData = {
        id: data.id,
        name: data.name,
        description: data.description,
        host_id: data.host_id,
        language_id: data.language_id,
        max_participants: data.max_participants,
        language: {
          name: data.languages.name,
          flag_emoji: data.languages.flag_emoji,
        },
        profiles: {
          full_name: data.profiles.full_name,
          avatar_url: data.profiles.avatar_url,
          country: data.profiles.country,
        }
      };
      setRoom(roomData);
    }
    setLoading(false);
  };

  const fetchParticipants = async () => {
    const { data, error } = await supabase
      .from('room_participants')
      .select(`
        user_id,
        role,
        is_muted,
        profiles (full_name, avatar_url, country, email)
      `)
      .eq('room_id', roomId);

    if (error) {
      console.error('Error fetching participants:', error);
    } else if (data) {
      const typedParticipants: Participant[] = data.map(p => ({
        user_id: p.user_id,
        role: p.role as 'host' | 'co_host' | 'speaker' | 'audience',
        is_muted: p.is_muted,
        profiles: {
          full_name: p.profiles?.full_name || 'Unknown',
          avatar_url: p.profiles?.avatar_url,
          country: p.profiles?.country,
          email: p.profiles?.email,
        }
      }));
      setParticipants(typedParticipants);
    }
  };

  const joinRoom = async () => {
    if (!user || !roomId) return;

    const { data: existingParticipant } = await supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    if (!existingParticipant) {
      const { error } = await supabase
        .from('room_participants')
        .insert({
          room_id: roomId,
          user_id: user.id,
          role: user.id === room?.host_id ? 'host' : 'audience'
        });

      if (error) {
        console.error('Error joining room:', error);
      } else {
        fetchParticipants();
      }
    }
  };

  const leaveRoom = async () => {
    const { error } = await supabase
      .from('room_participants')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', user?.id);

    if (error) {
      console.error('Error leaving room:', error);
    } else {
      navigate('/rooms');
    }
  };

  const getCountryFlag = (countryName?: string) => {
    if (!countryName) return '🌍';
    const country = countries.find(c => c.name === countryName);
    return country?.flag || '🌍';
  };

  const handleCloseRoom = () => {
    navigate('/rooms');
  };

  const handleUpdateRoom = () => {
    fetchRoomData();
    setShowSettings(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">Loading room...</div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">Room not found</div>
        </div>
      </div>
    );
  }

  const speakers = participants.filter(p => p.role === 'host' || p.role === 'co_host' || p.role === 'speaker');
  const audience = participants.filter(p => p.role === 'audience');
  const isHost = user?.id === room.host_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Room Header */}
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{room.language.flag_emoji}</div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{room.name}</h1>
                  <p className="text-slate-300">{room.description}</p>
                  <Badge variant="secondary" className="mt-2 bg-slate-700 text-white">
                    {room.language.name}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="border-slate-600 text-white hover:bg-slate-700">
                  <Users className="h-4 w-4 mr-2" />
                  {participants.length}/{room.max_participants}
                </Button>
                {isHost && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-slate-600 text-white hover:bg-slate-700"
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={leaveRoom}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Leave
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Speakers Section */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-white">Speakers</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: Math.min(8, room.max_participants / 2) }, (_, index) => {
                    const speaker = speakers[index];
                    return (
                      <div key={index} className="flex flex-col items-center p-4 border-2 border-dashed border-slate-600 rounded-lg">
                        {speaker ? (
                          <>
                            <div className="relative">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={speaker.profiles.avatar_url} />
                                <AvatarFallback className="bg-slate-700 text-white">
                                  {speaker.profiles.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -left-1 text-sm">
                                {getCountryFlag(speaker.profiles.country)}
                              </div>
                              {speaker.is_muted && (
                                <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                                  <MicOff className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-medium mt-2 text-center text-white">
                              {speaker.profiles.full_name}
                            </p>
                            <Badge variant={speaker.role === 'host' ? 'default' : 'secondary'} className="text-xs mt-1">
                              {speaker.role === 'host' ? 'Host' : speaker.role === 'co_host' ? 'Co-Host' : 'Speaker'}
                            </Badge>
                          </>
                        ) : (
                          <>
                            <div className="h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center">
                              <Users className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-400 mt-2">Empty seat</p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Audience Section - Only show real participants */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-white">Audience ({audience.length})</h2>
                <div className="flex flex-wrap gap-3">
                  {audience.map((member) => (
                    <div key={member.user_id} className="flex flex-col items-center space-y-1">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.profiles.avatar_url} />
                          <AvatarFallback className="text-xs bg-slate-700 text-white">
                            {member.profiles.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -left-1 text-xs">
                          {getCountryFlag(member.profiles.country)}
                        </div>
                        {member.is_muted && (
                          <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5">
                            <MicOff className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-white text-center max-w-[60px] truncate">
                        {member.profiles.full_name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Host Controls */}
            {isHost && (
              <RoomControls
                roomId={roomId!}
                isHost={isHost}
                participants={participants}
                onParticipantUpdate={fetchParticipants}
                onCloseRoom={handleCloseRoom}
              />
            )}

            {/* Controls */}
            <div className="flex justify-center">
              <Button
                size="lg"
                variant={isMuted ? "outline" : "default"}
                onClick={toggleMute}
                className="flex items-center space-x-2 border-slate-600 text-white hover:bg-slate-700"
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </Button>
            </div>
          </div>

          {/* Chat sidebar */}
          <div className="lg:col-span-1">
            <RoomChat roomId={roomId!} />
          </div>
        </div>
      </div>

      {/* Room Settings Dialog */}
      {room && (
        <RoomSettingsDialog
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          room={{
            id: room.id,
            name: room.name,
            description: room.description,
            language_id: room.language_id,
            max_participants: room.max_participants
          }}
          onUpdate={handleUpdateRoom}
        />
      )}
    </div>
  );
};

export default Room;
