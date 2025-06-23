
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lingo-50 via-white to-lingo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center">Privacy Policy</CardTitle>
              <p className="text-center text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h2 className="text-2xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
              <p className="mb-4">
                We collect information you provide directly to us, such as when you create an account, 
                update your profile, or communicate with other users.
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">
                We use the information we collect to provide, maintain, and improve our services, 
                including facilitating language learning conversations and connecting users.
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-4">3. Information Sharing</h2>
              <p className="mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this policy.
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-4">4. Data Security</h2>
              <p className="mb-4">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-4">5. Your Rights</h2>
              <p className="mb-4">
                You have the right to access, update, or delete your personal information. 
                You can do this through your account settings or by contacting us.
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-4">6. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us at 
                privacy@lingoconnect.com
              </p>

              <div className="mt-8 p-4 bg-lingo-50 rounded-lg">
                <p className="text-sm text-center">
                  © 2024 LingoConnect. All rights reserved.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
