
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-lingo-500 to-lingo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">LC</span>
          </div>
          <span className="text-xl font-bold gradient-text">LingoConnect</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/rooms">
            <Button variant="ghost">Browse Rooms</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
