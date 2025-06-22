
import { useState } from 'react';
import { X } from 'lucide-react';

const AdBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-lingo-500 to-lingo-600 text-white px-4 py-2 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1 text-center">
          <p className="text-sm font-medium">
            🎉 Welcome to LingoConnect! Join language rooms and practice with native speakers worldwide
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AdBanner;
