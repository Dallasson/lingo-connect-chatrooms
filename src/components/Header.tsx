
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import { User, Settings, LogOut, MessageCircle, Users, Search } from 'lucide-react';

const Header = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LC</span>
            </div>
            <span className="font-bold text-xl text-white">LingoConnect</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/rooms" className="text-slate-300 hover:text-white font-medium">
              {t('rooms')}
            </Link>
            <Link to="/find-users" className="text-slate-300 hover:text-white font-medium">
              {t('find_users')}
            </Link>
            <Link to="/contact" className="text-slate-300 hover:text-white font-medium">
              {t('contact')}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-slate-800">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                      <AvatarFallback className="bg-slate-700 text-white">
                        {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end" forceMount>
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="text-white hover:bg-slate-700">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/messages')} className="text-white hover:bg-slate-700">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>{t('messages')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/rooms')} className="text-white hover:bg-slate-700">
                    <Users className="mr-2 h-4 w-4" />
                    <span>{t('rooms')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/find-users')} className="text-white hover:bg-slate-700">
                    <Search className="mr-2 h-4 w-4" />
                    <span>{t('find_users')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="text-white hover:bg-slate-700">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('settings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem onClick={handleSignOut} className="text-white hover:bg-slate-700">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:bg-slate-800">{t('sign_in')}</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-slate-700 hover:bg-slate-600 text-white">{t('get_started')}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
