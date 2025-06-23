
-- First drop the existing policies that depend on recipient_id
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON public.messages;

-- Add profile fields for user customization
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS native_language_id UUID REFERENCES public.languages(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS learning_language_id UUID REFERENCES public.languages(id);

-- Create user blocked table for 24-hour kick restrictions
CREATE TABLE IF NOT EXISTS public.user_blocked (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  blocked_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, room_id)
);

-- Create conversations table for private messaging
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant_1_id, participant_2_id)
);

-- Update messages table to support conversations and GIFs
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS gif_url TEXT;

-- Now safely drop the recipient_id column
ALTER TABLE public.messages DROP COLUMN IF EXISTS recipient_id;

-- Add more languages
INSERT INTO public.languages (name, code, flag_emoji) VALUES
  ('Dutch', 'nl', '🇳🇱'),
  ('Swedish', 'sv', '🇸🇪'),
  ('Norwegian', 'no', '🇳🇴'),
  ('Danish', 'da', '🇩🇰'),
  ('Finnish', 'fi', '🇫🇮'),
  ('Polish', 'pl', '🇵🇱'),
  ('Czech', 'cs', '🇨🇿'),
  ('Hungarian', 'hu', '🇭🇺'),
  ('Greek', 'el', '🇬🇷'),
  ('Turkish', 'tr', '🇹🇷'),
  ('Hebrew', 'he', '🇮🇱'),
  ('Thai', 'th', '🇹🇭'),
  ('Vietnamese', 'vi', '🇻🇳')
ON CONFLICT (code) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.user_blocked ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_blocked
CREATE POLICY "Users can view their own blocks" ON public.user_blocked FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage blocks" ON public.user_blocked FOR ALL USING (true);

-- RLS Policies for conversations
CREATE POLICY "Users can view their conversations" ON public.conversations 
  FOR SELECT USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);
CREATE POLICY "Users can create conversations" ON public.conversations 
  FOR INSERT WITH CHECK (auth.uid() = participant_1_id);

-- Create new messages policies for conversations
CREATE POLICY "Users can view conversation messages" ON public.messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
    )
  );
CREATE POLICY "Users can send conversation messages" ON public.messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update conversation messages" ON public.messages 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
    )
  );

-- Add updated_at trigger for conversations
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
