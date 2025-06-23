
import { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Mail, MessageSquare, Bug } from 'lucide-react';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate sending the form
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "Thank you for your feedback! We'll get back to you soon.",
      });
      setFormData({ name: '', email: '', type: '', message: '' });
      setSending(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-elegant-50 via-white to-elegant-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center">Contact Us</CardTitle>
              <p className="text-center text-muted-foreground">
                We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Type of Inquiry</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select inquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">
                        <div className="flex items-center space-x-2">
                          <Bug className="h-4 w-4" />
                          <span>Bug Report</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="suggestion">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>Suggestion</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="general">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>General Inquiry</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your inquiry..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={sending} className="w-full">
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  You can also reach us directly at:
                </p>
                <p className="font-medium">contact@lingoconnect.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
