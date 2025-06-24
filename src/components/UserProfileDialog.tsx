
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { countries } from '@/data/countries';

interface UserProfile {
  user_id: string;
  role: 'host' | 'co_host' | 'speaker' | 'audience';
  profiles: {
    full_name: string;
    avatar_url?: string;
    country?: string;
    email?: string;
  };
}

interface UserProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

const UserProfileDialog = ({ isOpen, onClose, user }: UserProfileDialogProps) => {
  if (!user) return null;

  const getCountryFlag = (countryName?: string) => {
    if (!countryName) return '🌍';
    const country = countries.find(c => c.name === countryName);
    return country?.flag || '🌍';
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'host': return 'default';
      case 'co_host': return 'secondary';
      case 'speaker': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'host': return 'Host';
      case 'co_host': return 'Co-Host';
      case 'speaker': return 'Speaker';
      default: return 'Audience';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.profiles.avatar_url} />
              <AvatarFallback className="bg-slate-700 text-white text-2xl">
                {user.profiles.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 text-2xl">
              {getCountryFlag(user.profiles.country)}
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">{user.profiles.full_name}</h3>
            {user.profiles.email && (
              <p className="text-slate-400 text-sm">{user.profiles.email}</p>
            )}
            {user.profiles.country && (
              <p className="text-slate-300">{user.profiles.country}</p>
            )}
          </div>

          <Badge variant={getRoleBadgeVariant(user.role)} className="mt-2">
            {getRoleDisplayName(user.role)}
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
