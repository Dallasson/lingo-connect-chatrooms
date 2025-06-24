
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MoreHorizontal, 
  UserPlus, 
  Mic, 
  MicOff, 
  UserMinus, 
  ArrowDown,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { countries } from '@/data/countries';

interface Participant {
  user_id: string;
  role: 'host' | 'co_host' | 'speaker' | 'audience';
  profiles: {
    full_name: string;
    avatar_url?: string;
    country?: string;
  };
}

interface RoomControlsProps {
  roomId: string;
  isHost: boolean;
  participants: Participant[];
  onParticipantUpdate: () => void;
  onCloseRoom: () => void;
}

const RoomControls = ({ roomId, isHost, participants, onParticipantUpdate, onCloseRoom }: RoomControlsProps) => {
  const { toast } = useToast();
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const getCountryFlag = (countryName?: string) => {
    if (!countryName) return '🌍';
    const country = countries.find(c => c.name === countryName);
    return country?.flag || '🌍';
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('room_participants')
      .update({ role: newRole })
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating participant role:', error);
      toast({
        title: "Error",
        description: "Failed to update participant role",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Participant role updated to ${newRole}`,
      });
      onParticipantUpdate();
    }
  };

  const handleKickParticipant = async (userId: string) => {
    const { error } = await supabase
      .from('room_participants')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error kicking participant:', error);
      toast({
        title: "Error",
        description: "Failed to remove participant",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Participant removed from room",
      });
      onParticipantUpdate();
    }
  };

  const handleCloseRoom = async () => {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (error) {
      console.error('Error closing room:', error);
      toast({
        title: "Error",
        description: "Failed to close room",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Room closed successfully",
      });
      onCloseRoom();
    }
  };

  const audience = participants.filter(p => p.role === 'audience');

  if (!isHost) return null;

  return (
    <>
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Host Controls</h3>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowCloseDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Close Room
            </Button>
          </div>

          {audience.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Audience</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {audience.map((participant) => (
                  <div key={participant.user_id} className="flex items-center justify-between p-2 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.profiles.avatar_url} />
                          <AvatarFallback className="bg-slate-600 text-white text-xs">
                            {participant.profiles.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -left-1 text-xs">
                          {getCountryFlag(participant.profiles.country)}
                        </div>
                      </div>
                      <span className="text-sm text-white truncate max-w-20">
                        {participant.profiles.full_name}
                      </span>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(participant.user_id, 'speaker')}
                          className="text-white hover:bg-slate-700"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite to Stage
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(participant.user_id, 'co_host')}
                          className="text-white hover:bg-slate-700"
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          Make Co-Host
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleKickParticipant(participant.user_id)}
                          className="text-red-400 hover:bg-slate-700"
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove from Room
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Close Room</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to close this room? This action cannot be undone and all participants will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleCloseRoom}>
              Close Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoomControls;
