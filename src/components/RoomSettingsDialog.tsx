
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Language {
  id: string;
  name: string;
  flag_emoji: string;
}

interface RoomSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  room: {
    id: string;
    name: string;
    description?: string;
    language_id: string;
    max_participants: number;
  };
  onUpdate: () => void;
}

const RoomSettingsDialog = ({ isOpen, onClose, room, onUpdate }: RoomSettingsDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [formData, setFormData] = useState({
    name: room.name,
    description: room.description || '',
    language_id: room.language_id,
    max_participants: room.max_participants
  });

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    setFormData({
      name: room.name,
      description: room.description || '',
      language_id: room.language_id,
      max_participants: room.max_participants
    });
  }, [room]);

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
    setLoading(true);

    const { error } = await supabase
      .from('rooms')
      .update({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        language_id: formData.language_id,
        max_participants: formData.max_participants
      })
      .eq('id', room.id);

    if (error) {
      console.error('Error updating room:', error);
      toast({
        title: "Error",
        description: "Failed to update room settings",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Room settings updated successfully",
      });
      onUpdate();
      onClose();
    }

    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Room Settings</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update your room settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Room Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <Select
              value={formData.language_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, language_id: value }))}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {languages.map((language) => (
                  <SelectItem key={language.id} value={language.id} className="text-white hover:bg-slate-700">
                    {language.flag_emoji} {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Participants</label>
            <Select
              value={formData.max_participants.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, max_participants: parseInt(value) }))}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {[8, 12, 16, 20, 24].map((num) => (
                  <SelectItem key={num} value={num.toString()} className="text-white hover:bg-slate-700">
                    {num} participants
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Updating...' : 'Update Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoomSettingsDialog;
