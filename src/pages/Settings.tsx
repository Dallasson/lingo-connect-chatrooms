
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import { Moon, Sun, Mail, Shield, Globe, Palette } from 'lucide-react';

interface UserSettings {
  allow_messages_from_strangers: boolean;
  email_notifications: boolean;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentLanguage, changeLanguage, t } = useLanguage();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-white">{t('settings')}</h1>

          {/* Language Settings */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Globe className="h-5 w-5" />
                <span>Language / Idioma / Langue</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Interface Language</Label>
                  <p className="text-sm text-slate-400">
                    Choose your preferred language for the interface
                  </p>
                </div>
                <Select value={currentLanguage} onValueChange={changeLanguage}>
                  <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="en" className="text-white hover:bg-slate-600">🇺🇸 English</SelectItem>
                    <SelectItem value="es" className="text-white hover:bg-slate-600">🇪🇸 Español</SelectItem>
                    <SelectItem value="fr" className="text-white hover:bg-slate-600">🇫🇷 Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Palette className="h-5 w-5" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white flex items-center space-x-2">
                    {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <span>{t('dark_mode')}</span>
                  </Label>
                  <p className="text-sm text-slate-400">
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

          {/* Privacy Settings */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Shield className="h-5 w-5" />
                <span>Privacy Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Allow messages from strangers</Label>
                  <p className="text-sm text-slate-400">
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
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Mail className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Email notifications</Label>
                  <p className="text-sm text-slate-400">
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

          {/* Copyright */}
          <div className="text-center text-sm text-slate-400">
            © 2024 LingoConnect. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
