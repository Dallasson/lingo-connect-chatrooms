
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-elegant-50 via-white to-elegant-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center">Terms of Service</CardTitle>
              <p className="text-center text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h2 className="text-2xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using LingoConnect, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-4">2. Use License</h2>
              <p className="mb-4">
                Permission is granted to temporarily use LingoConnect for personal, 
                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-4">3. User Conduct</h2>
              <p className="mb-4">
                Users agree to use the platform respectfully and constructively. Any form of harassment, 
                discrimination, or inappropriate behavior is strictly prohibited.
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-4">4. Account Termination</h2>
              <p className="mb-4">
                We reserve the right to terminate or suspend accounts that violate these terms 
                or engage in harmful behavior towards other users.
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-4">5. Limitation of Liability</h2>
              <p className="mb-4">
                LingoConnect shall not be liable for any damages arising from the use or inability 
                to use the service.
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-4">6. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms of Service, please contact us at 
                legal@lingoconnect.com
              </p>

              <div className="mt-8 p-4 bg-elegant-50 rounded-lg">
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

export default Terms;
