import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 max-w-4xl">
        <Card className="p-8 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using BoxBoxd ("the Service"), you accept and agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">2. Description of Service</h2>
            <p className="text-muted-foreground">
              BoxBoxd is a social platform for Formula 1 fans to log, review, and discuss F1 races.
              The Service allows users to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Create an account and profile</li>
              <li>Log and rate F1 races</li>
              <li>Write reviews and comments</li>
              <li>Follow other users and interact with their content</li>
              <li>Create and share lists of races</li>
              <li>Access F1 race data and statistics</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">3. User Accounts</h2>
            <p className="text-muted-foreground">
              To use certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Provide accurate and complete information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be responsible for all activities under your account</li>
              <li>Not create multiple accounts to evade bans or restrictions</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">4. User Content and Conduct</h2>
            <p className="text-muted-foreground">
              You are responsible for the content you post. You agree NOT to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Post offensive, abusive, or discriminatory content</li>
              <li>Harass, bully, or threaten other users</li>
              <li>Post spam or promotional content</li>
              <li>Violate intellectual property rights</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Post false or misleading information</li>
              <li>Engage in any illegal activities</li>
              <li>Attempt to hack or disrupt the Service</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">5. Content Ownership and License</h2>
            <p className="text-muted-foreground">
              You retain ownership of content you post. By posting content, you grant BoxBoxd a
              non-exclusive, worldwide, royalty-free license to use, display, and distribute your
              content within the Service.
            </p>
            <p className="text-muted-foreground">
              We reserve the right to remove content that violates these terms or is otherwise objectionable.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              BoxBoxd and its original content, features, and functionality are owned by BoxBoxd and
              are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-muted-foreground">
              Formula 1, F1, and related marks are trademarks of Formula One Licensing BV. BoxBoxd
              is not affiliated with or endorsed by Formula One Licensing BV.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">7. Privacy</h2>
            <p className="text-muted-foreground">
              Your use of the Service is also governed by our{" "}
              <a href="/privacy-policy" className="text-racing-red hover:underline">Privacy Policy</a>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">8. Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account at any time for violations
              of these terms. You may delete your account at any time through the Settings page.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">9. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee
              that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">10. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              BoxBoxd shall not be liable for any indirect, incidental, special, or consequential
              damages arising out of your use of the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">11. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may modify these terms at any time. We will notify you of material changes.
              Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">12. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, contact us at:
            </p>
            <p className="text-muted-foreground">
              Email: <a href="mailto:legal@boxboxd.com" className="text-racing-red hover:underline">legal@boxboxd.com</a>
            </p>
          </section>
        </Card>
      </main>
    </div>
  );
};

export default TermsOfService;
