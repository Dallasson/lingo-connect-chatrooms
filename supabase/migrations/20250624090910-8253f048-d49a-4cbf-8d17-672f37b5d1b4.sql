
-- Create room_messages table for chat functionality
CREATE TABLE public.room_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'gif')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for room messages
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow participants to view messages in rooms they're part of
CREATE POLICY "Participants can view room messages" 
  ON public.room_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.room_participants 
      WHERE room_participants.room_id = room_messages.room_id 
      AND room_participants.user_id = auth.uid()
    )
  );

-- Policy to allow participants to send messages in rooms they're part of
CREATE POLICY "Participants can send room messages" 
  ON public.room_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.room_participants 
      WHERE room_participants.room_id = room_messages.room_id 
      AND room_participants.user_id = auth.uid()
    )
  );

-- Enable realtime for room messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_messages;
