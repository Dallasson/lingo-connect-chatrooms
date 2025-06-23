
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, Smile, Image } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string, type: 'text' | 'gif') => void;
  placeholder?: string;
  disabled?: boolean;
}

const MessageInput = ({ onSendMessage, placeholder = "Type a message...", disabled = false }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);

  const emojis = ['😊', '😂', '🥰', '😍', '🤔', '👍', '👏', '🎉', '❤️', '🔥', '💯', '🙌'];
  
  // Simple GIF collection - in a real app, this would integrate with Giphy API
  const gifs = [
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
    'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif',
  ];

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const sendGif = (gifUrl: string) => {
    onSendMessage(gifUrl, 'gif');
    setShowGifPicker(false);
  };

  return (
    <div className="flex items-center space-x-2 p-4 border-t bg-white">
      <div className="flex-1 flex items-center space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />
        
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" disabled={disabled}>
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid grid-cols-6 gap-2">
              {emojis.map((emoji, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => insertEmoji(emoji)}
                  className="text-lg"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={showGifPicker} onOpenChange={setShowGifPicker}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" disabled={disabled}>
              <Image className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid grid-cols-2 gap-2">
              {gifs.map((gif, index) => (
                <img
                  key={index}
                  src={gif}
                  alt={`GIF ${index + 1}`}
                  className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                  onClick={() => sendGif(gif)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Button onClick={handleSend} disabled={!message.trim() || disabled}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MessageInput;
