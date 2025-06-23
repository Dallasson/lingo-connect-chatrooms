
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { Moon, Sun, Mail, MessageSquare, Shield } from 'lucide-react';

interface UserSettings {
  allow_messages_from_strangers: boolean;
  email_notifications: boolean;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({
    allow_messages_from_strangers: true,
    email_notifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
    // Check if dark mode is enabled from localStorage
    const isDarkMode = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
    } else if (data) {
      setSettings({
        allow_messages_from_strangers: data.allow_messages_from_strangers,
        email_notifications: data.email_notifications,
      });
    }
    setLoading(false);
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;

    setSaving(true);
    const updatedSettings = { ...settings, ...newSettings };
    
    const { error } = await supabase
      .from('user_settings')
      .update(updatedSettings)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } else {
      setSettings(updatedSettings);
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    }
    setSaving(false);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    toast({
      title: "Theme Updated",
      description: `Switched to ${newDarkMode ? 'dark' : 'light'} mode`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lingo-50 via-white to-lingo-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-elegant-50 via-white to-elegant-100 dark:from-elegant-900 dark:via-elegant-800 dark:to-elegant-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">Settings</h1>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow messages from strangers</Label>
                  <p className="text-sm text-muted-foreground">
                    Let users who don't follow you send you private messages
                  </p>
                </div>
                <Switch
                  checked={settings.allow_messages_from_strangers}
                  onCheckedChange={(checked) => 
                    updateSettings({ allow_messages_from_strangers: checked })
                  }
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications about messages and activities
                  </p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => 
                    updateSettings({ email_notifications: checked })
                  }
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Copyright */}
          <div className="text-center text-sm text-muted-foreground">
            © 2024 LingoConnect. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
