
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/Header';
import MessageInput from '@/components/MessageInput';

interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  updated_at: string;
  other_participant: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  gif_url?: string;
  sender: {
    full_name: string;
    avatar_url?: string;
  };
}

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation && user) {
      fetchMessages();
    }
  }, [selectedConversation, user]);

  const fetchConversations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1:profiles!conversations_participant_1_id_fkey (full_name, avatar_url),
        participant_2:profiles!conversations_participant_2_id_fkey (full_name, avatar_url)
      `)
      .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
    } else {
      const formattedConversations = data?.map((conv: any) => ({
        ...conv,
        other_participant: conv.participant_1_id === user.id ? conv.participant_2 : conv.participant_1
      })) || [];
      setConversations(formattedConversations);
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles (full_name, avatar_url)
      `)
      .eq('conversation_id', selectedConversation)
      .order('created_at');

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
  };

  const handleSendMessage = async (content: string, gifUrl?: string) => {
    if (!selectedConversation || !user) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        content,
        gif_url: gifUrl
      });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      fetchMessages();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Messages</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    No conversations yet
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedConversation === conversation.id
                          ? 'bg-slate-700'
                          : 'hover:bg-slate-700'
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.other_participant.avatar_url} />
                          <AvatarFallback className="bg-slate-700 text-white">
                            {conversation.other_participant.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-white">
                            {conversation.other_participant.full_name}
                          </p>
                          <p className="text-sm text-slate-400">
                            {new Date(conversation.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <div className="md:col-span-2">
            {selectedConversation ? (
              <Card className="h-full flex flex-col bg-slate-800 border-slate-700">
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-slate-600 text-white'
                              : 'bg-slate-700 text-white'
                          }`}
                        >
                          {message.gif_url ? (
                            <img
                              src={message.gif_url}
                              alt="GIF"
                              className="rounded max-w-full h-auto"
                            />
                          ) : (
                            <p>{message.content}</p>
                          )}
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="p-4 border-t border-slate-700">
                  <MessageInput onSendMessage={handleSendMessage} />
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center bg-slate-800 border-slate-700">
                <div className="text-center text-slate-400">
                  <p>Select a conversation to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
