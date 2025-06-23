
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomCreated?: () => void;
}

interface Language {
  id: string;
  name: string;
  code: string;
  flag_emoji: string;
}

const CreateRoomDialog = ({ open, onOpenChange, onRoomCreated }: CreateRoomDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language_id: '',
    max_participants: 50
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      fetchLanguages();
    }
  }, [open]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreating(true);

    try {
      const { data: room, error } = await supabase
        .from('rooms')
        .insert({
          name: formData.name,
          description: formData.description,
          language_id: formData.language_id,
          host_id: user.id,
          max_participants: formData.max_participants,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add the host as a participant
      const { error: participantError } = await supabase
        .from('room_participants')
        .insert({
          room_id: room.id,
          user_id: user.id,
          role: 'host'
        });

      if (participantError) {
        console.error('Error adding host as participant:', participantError);
      }

      toast({
        title: "Success",
        description: "Room created successfully!",
      });

      onOpenChange(false);
      onRoomCreated?.();
      
      // Navigate to the created room
      navigate(`/room/${room.id}`);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        language_id: '',
        max_participants: 50
      });
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
    }

    setCreating(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Room Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter room name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your room..."
              rows={3}
            />
          </div>

          <div>
            <Label>Language</Label>
            <Select 
              value={formData.language_id} 
              onValueChange={(value) => setFormData({ ...formData, language_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.flag_emoji} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="maxParticipants">Max Participants</Label>
            <Select 
              value={formData.max_participants.toString()} 
              onValueChange={(value) => setFormData({ ...formData, max_participants: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 participants</SelectItem>
                <SelectItem value="25">25 participants</SelectItem>
                <SelectItem value="50">50 participants</SelectItem>
                <SelectItem value="100">100 participants</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomDialog;
