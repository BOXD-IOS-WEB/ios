import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-[100vh] min-h-[100dvh] bg-[#0a0a0a] racing-grid">
      <Header />

      <main className="container py-8 max-w-4xl">
        <Card className="p-8 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              When you use BoxBoxd, we collect the following information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Account Information:</strong> Email address, username, and password (encrypted)</li>
              <li><strong>Profile Information:</strong> Display name, bio, profile picture, favorite drivers and teams</li>
              <li><strong>Content:</strong> Race logs, reviews, ratings, comments, lists, and tags you create</li>
              <li><strong>Social Interactions:</strong> Follows, likes, and comments on other users' content</li>
              <li><strong>Usage Data:</strong> How you interact with the app, including pages visited and features used</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Provide and maintain the BoxBoxd service</li>
              <li>Create and manage your account</li>
              <li>Enable social features like following users and sharing content</li>
              <li>Personalize your experience with recommendations</li>
              <li>Send you updates and notifications (with your consent)</li>
              <li>Improve our services and develop new features</li>
              <li>Protect against fraud and abuse</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">3. Data Storage and Security</h2>
            <p className="text-muted-foreground">
              Your data is stored securely using Firebase/Google Cloud infrastructure. We implement appropriate
              technical and organizational measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction.
            </p>
            <p className="text-muted-foreground">
              Passwords are encrypted using industry-standard methods. We never store your password in plain text.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">4. Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information to third parties. We may share data in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Public Content:</strong> Content you mark as "public" is visible to all BoxBoxd users</li>
              <li><strong>Service Providers:</strong> We use Firebase/Google Cloud for hosting and data storage</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">5. Your Rights</h2>
            <p className="text-muted-foreground">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Delete your account at any time</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">6. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to maintain your session and improve your experience.
              You can control cookie settings through your browser.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">7. Children's Privacy</h2>
            <p className="text-muted-foreground">
              BoxBoxd is not intended for users under 13 years of age. We do not knowingly collect
              personal information from children under 13.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">8. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">9. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-muted-foreground">
              Email: <a href="mailto:privacy@boxboxd.com" className="text-racing-red hover:underline">privacy@boxboxd.com</a>
            </p>
          </section>
        </Card>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
