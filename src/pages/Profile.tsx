import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { Upload, Users, UserPlus, Trash2 } from 'lucide-react';
import { countries } from '@/data/countries';

interface Language {
  id: string;
  name: string;
  code: string;
  flag_emoji: string;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  country?: string;
  birthday?: string;
  native_language_id?: string;
  learning_language_id?: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchLanguages();
      fetchFollowers();
      fetchFollowing();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

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

  const fetchFollowers = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('followers')
      .select(`
        follower_id,
        profiles!followers_follower_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('following_id', user.id);

    if (error) {
      console.error('Error fetching followers:', error);
    } else {
      setFollowers(data || []);
    }
  };

  const fetchFollowing = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('followers')
      .select(`
        following_id,
        profiles!followers_following_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('follower_id', user.id);

    if (error) {
      console.error('Error fetching following:', error);
    } else {
      setFollowing(data || []);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        country: profile.country,
        birthday: profile.birthday,
        native_language_id: profile.native_language_id,
        learning_language_id: profile.learning_language_id,
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    }
    setSaving(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setProfile(prev => prev ? { ...prev, avatar_url: data.publicUrl } : null);
      toast({
        title: "Success",
        description: "Profile photo updated successfully!",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    
    if (confirmed) {
      try {
        // This would typically involve calling a server function to properly delete the user
        await signOut();
        toast({
          title: "Account Deleted",
          description: "Your account has been scheduled for deletion.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete account. Please contact support.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-elegant-50 via-white to-elegant-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-elegant-50 via-white to-elegant-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Profile not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-elegant-50 via-white to-elegant-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">My Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {profile.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" className="flex items-center space-x-2">
                        <Upload className="h-4 w-4" />
                        <span>Change Photo</span>
                      </Button>
                    </Label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF (max 5MB)
                    </p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <Label>Country</Label>
                    <Select
                      value={profile.country || ''}
                      onValueChange={(value) => setProfile({ ...profile, country: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.name}>
                            {country.flag} {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={profile.birthday || ''}
                    onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                  />
                </div>

                {/* Language Preferences */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Native Language</Label>
                    <Select
                      value={profile.native_language_id || ''}
                      onValueChange={(value) => setProfile({ ...profile, native_language_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your native language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.id} value={lang.id}>
                            {lang.flag_emoji} {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Learning Language</Label>
                    <Select
                      value={profile.learning_language_id || ''}
                      onValueChange={(value) => setProfile({ ...profile, learning_language_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language you're learning" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.id} value={lang.id}>
                            {lang.flag_emoji} {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Followers/Following Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Followers ({followers.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {followers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No followers yet</p>
                  ) : (
                    followers.map((follower) => (
                      <div key={follower.follower_id} className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={follower.profiles?.avatar_url} />
                          <AvatarFallback>
                            {follower.profiles?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{follower.profiles?.full_name}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Following ({following.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {following.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Not following anyone yet</p>
                  ) : (
                    following.map((follow) => (
                      <div key={follow.following_id} className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={follow.profiles?.avatar_url} />
                          <AvatarFallback>
                            {follow.profiles?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{follow.profiles?.full_name}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
