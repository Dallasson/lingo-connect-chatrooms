
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, Smile, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  room_id: string;
  message_type: 'text' | 'image' | 'gif';
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
}

interface RoomChatProps {
  roomId: string;
}

const RoomChat = ({ roomId }: RoomChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const emojis = ['😊', '😂', '🥰', '😍', '🤔', '👍', '👏', '🎉', '❤️', '🔥', '💯', '🙌'];
  const gifs = [
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
    'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif',
  ];

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to real-time messages
    const channel = supabase
      .channel(`room-chat:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'room_messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        console.log('New message:', payload);
        fetchMessages(); // Refetch to get profile data
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('room_messages')
      .select(`
        *,
        profiles!sender_id (full_name, avatar_url)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      // Transform the data to match our Message interface
      const transformedMessages = data?.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        room_id: msg.room_id,
        message_type: msg.message_type as 'text' | 'image' | 'gif',
        created_at: msg.created_at,
        profiles: {
          full_name: msg.profiles?.full_name || 'Unknown User',
          avatar_url: msg.profiles?.avatar_url
        }
      })) || [];
      setMessages(transformedMessages);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string, type: 'text' | 'image' | 'gif' = 'text') => {
    if (!user || !content.trim()) return;

    const { error } = await supabase
      .from('room_messages')
      .insert({
        room_id: roomId,
        sender_id: user.id,
        content: content.trim(),
        message_type: type
      });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

  const handleSend = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage, 'text');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const sendGif = (gifUrl: string) => {
    sendMessage(gifUrl, 'gif');
    setShowGifPicker(false);
  };

  return (
    <Card className="bg-slate-800 border-slate-700 h-96 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg">Room Chat</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-2">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={message.profiles.avatar_url} />
                <AvatarFallback className="bg-slate-700 text-white text-xs">
                  {message.profiles.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-white">
                    {message.profiles.full_name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="bg-slate-700 rounded-lg px-3 py-2 inline-block max-w-full">
                  {message.message_type === 'gif' ? (
                    <img
                      src={message.content}
                      alt="GIF"
                      className="rounded max-w-32 h-auto"
                    />
                  ) : (
                    <p className="text-sm text-white break-words">{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
            
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-slate-800 border-slate-700">
                <div className="grid grid-cols-6 gap-2">
                  {emojis.map((emoji, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => insertEmoji(emoji)}
                      className="text-lg hover:bg-slate-700"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={showGifPicker} onOpenChange={setShowGifPicker}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Image className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-slate-800 border-slate-700">
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

            <Button onClick={handleSend} disabled={!newMessage.trim()} className="bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomChat;
