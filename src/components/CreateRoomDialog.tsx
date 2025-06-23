
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomCreated: () => void;
}

const CreateRoomDialog = ({ open, onOpenChange, onRoomCreated }: CreateRoomDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language_id: '',
    max_participants: 16,
  });

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
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to create a room",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('rooms')
      .insert([{
        name: formData.name,
        description: formData.description,
        language_id: formData.language_id,
        host_id: user.id,
        max_participants: formData.max_participants,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
    } else {
      // Add creator as host participant
      await supabase
        .from('room_participants')
        .insert({
          room_id: data.id,
          user_id: user.id,
          role: 'host'
        });

      toast({
        title: "Success",
        description: "Room created successfully!",
      });
      
      setFormData({
        name: '',
        description: '',
        language_id: '',
        max_participants: 16,
      });
      
      onRoomCreated();
      onOpenChange(false);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Room</DialogTitle>
          <DialogDescription>
            Create a language practice room and invite others to join the conversation.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Room Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., English Conversation Practice"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell people what this room is about..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language *</Label>
            <Select
              value={formData.language_id}
              onValueChange={(value) => setFormData({ ...formData, language_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
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

          <div className="space-y-2">
            <Label htmlFor="max_participants">Maximum Participants</Label>
            <Select
              value={formData.max_participants.toString()}
              onValueChange={(value) => setFormData({ ...formData, max_participants: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8 participants</SelectItem>
                <SelectItem value="12">12 participants</SelectItem>
                <SelectItem value="16">16 participants</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.language_id}
              className="bg-lingo-500 hover:bg-lingo-600"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomDialog;
