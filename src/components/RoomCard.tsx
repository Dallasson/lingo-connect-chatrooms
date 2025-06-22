
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Crown, Users, Mic, MicOff } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  language: string;
  languageFlag: string;
  currentUsers: number;
  maxUsers: number;
  host: {
    name: string;
    avatar?: string;
  };
  speakers: number;
  isLive: boolean;
}

interface RoomCardProps {
  room: Room;
  onJoinRoom: (roomId: string) => void;
}

const RoomCard = ({ room, onJoinRoom }: RoomCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{room.languageFlag}</span>
            <Badge variant="secondary">{room.language}</Badge>
            {room.isLive && (
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {room.currentUsers}/{room.maxUsers}
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{room.name}</h3>

        <div className="flex items-center space-x-2 mb-4">
          <Avatar className="h-6 w-6">
            <AvatarImage src={room.host.avatar} />
            <AvatarFallback className="text-xs">
              {room.host.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            Hosted by {room.host.name}
          </span>
          <Crown className="h-4 w-4 text-yellow-500" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{room.currentUsers}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mic className="h-4 w-4" />
              <span>{room.speakers}</span>
            </div>
          </div>
          
          <Button 
            onClick={() => onJoinRoom(room.id)}
            size="sm"
            className="bg-lingo-500 hover:bg-lingo-600"
          >
            Join Room
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
