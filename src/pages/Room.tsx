
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Users, Settings, LogOut } from 'lucide-react';
import Header from '@/components/Header';

interface RoomData {
  id: string;
  name: string;
  description?: string;
  host_id: string;
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
  profiles: {
    full_name: string;
    avatar_url?: string;
    country?: string;
  };
}

const Room = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [room, setRoom] = useState<RoomData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (roomId) {
      fetchRoomData();
      fetchParticipants();
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
    } else {
      setRoom(data);
    }
    setLoading(false);
  };

  const fetchParticipants = async () => {
    const { data, error } = await supabase
      .from('room_participants')
      .select(`
        user_id,
        role,
        profiles (full_name, avatar_url, country)
      `)
      .eq('room_id', roomId);

    if (error) {
      console.error('Error fetching participants:', error);
    } else {
      setParticipants(data || []);
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

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // WebRTC implementation would go here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-elegant-50 via-white to-elegant-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading room...</div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-elegant-50 via-white to-elegant-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Room not found</div>
        </div>
      </div>
    );
  }

  const speakers = participants.filter(p => p.role === 'host' || p.role === 'co_host' || p.role === 'speaker');
  const audience = participants.filter(p => p.role === 'audience');
  const isHost = user?.id === room.host_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-elegant-50 via-white to-elegant-100">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Room Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{room.language.flag_emoji}</div>
                <div>
                  <h1 className="text-2xl font-bold">{room.name}</h1>
                  <p className="text-muted-foreground">{room.description}</p>
                  <Badge variant="secondary" className="mt-2">
                    {room.language.name}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  {participants.length}
                </Button>
                {isHost && (
                  <Button variant="outline" size="sm">
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

        {/* Speakers Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Speakers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Generate 8 speaker slots */}
              {Array.from({ length: 8 }, (_, index) => {
                const speaker = speakers[index];
                return (
                  <div key={index} className="flex flex-col items-center p-4 border-2 border-dashed border-elegant-200 rounded-lg">
                    {speaker ? (
                      <>
                        <div className="relative">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={speaker.profiles.avatar_url} />
                            <AvatarFallback>
                              {speaker.profiles.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {speaker.profiles.country && (
                            <div className="absolute -bottom-1 -left-1 text-sm">
                              🌍
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium mt-2 text-center">
                          {speaker.profiles.full_name}
                        </p>
                        <Badge variant={speaker.role === 'host' ? 'default' : 'secondary'} className="text-xs mt-1">
                          {speaker.role === 'host' ? 'Host' : speaker.role === 'co_host' ? 'Co-Host' : 'Speaker'}
                        </Badge>
                      </>
                    ) : (
                      <>
                        <div className="h-16 w-16 rounded-full bg-elegant-100 flex items-center justify-center">
                          <Users className="h-8 w-8 text-elegant-400" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Empty seat</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Audience Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Audience ({audience.length})</h2>
            <div className="flex flex-wrap gap-3">
              {audience.map((member) => (
                <div key={member.user_id} className="flex items-center space-x-2">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.profiles.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {member.profiles.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {member.profiles.country && (
                      <div className="absolute -bottom-1 -right-1 text-xs">
                        🌍
                      </div>
                    )}
                  </div>
                  <span className="text-sm">{member.profiles.full_name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex justify-center">
          <Button
            size="lg"
            variant={isMuted ? "outline" : "default"}
            onClick={toggleMute}
            className="flex items-center space-x-2"
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Room;
