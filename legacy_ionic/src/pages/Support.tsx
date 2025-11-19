import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, HelpCircle, FileText, Shield } from "lucide-react";

const Support = () => {
  return (
    <div className="min-h-[100vh] min-h-[100dvh] bg-[#0a0a0a] racing-grid pb-[env(safe-area-inset-bottom,4rem)] lg:pb-0">
      <Header />

      <main className="container px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Support</h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            We're here to help! Get support for BoxBoxd
          </p>
        </div>

        <div className="space-y-6">
          {/* Contact Methods */}
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Contact Us</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Choose the best way to reach our support team
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <a
                href="mailto:support@boxboxd.app"
                className="flex items-start gap-4 p-4 rounded-lg border hover:border-racing-red transition-colors"
              >
                <div className="p-2 rounded-full bg-racing-red/10">
                  <Mail className="w-5 h-5 text-racing-red" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email Support</h3>
                  <p className="text-sm text-muted-foreground">support@boxboxd.app</p>
                  <p className="text-xs text-muted-foreground mt-1">Response within 24-48 hours</p>
                </div>
              </a>

              <a
                href="https://twitter.com/boxboxdapp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 rounded-lg border hover:border-racing-red transition-colors"
              >
                <div className="p-2 rounded-full bg-racing-red/10">
                  <MessageCircle className="w-5 h-5 text-racing-red" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Social Media</h3>
                  <p className="text-sm text-muted-foreground">@boxboxdapp</p>
                  <p className="text-xs text-muted-foreground mt-1">Follow us for updates</p>
                </div>
              </a>
            </div>
          </Card>

          {/* FAQ */}
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
                <HelpCircle className="w-6 h-6" />
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">How do I log a race?</h3>
                <p className="text-sm text-muted-foreground">
                  Click the "Log" button in the header, search for the race you watched, add your rating and review, then save.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">How do I change my profile picture?</h3>
                <p className="text-sm text-muted-foreground">
                  Go to your Profile, click "Edit Profile", then click "Upload Photo" to select or take a photo.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Can I export my data?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! Go to Settings → Data & Privacy → Export My Data to download all your race logs, reviews, and lists.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">How do I delete my account?</h3>
                <p className="text-sm text-muted-foreground">
                  Go to Settings → Danger Zone → Delete Account. This action is permanent and cannot be undone.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Is my data secure?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, we use industry-standard security measures to protect your data. Read our Privacy Policy for more details.
                </p>
              </div>
            </div>
          </Card>

          {/* Resources */}
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Resources</h2>
            </div>

            <div className="space-y-3">
              <a
                href="/privacy-policy"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Shield className="w-5 h-5 text-racing-red" />
                <span className="font-medium">Privacy Policy</span>
              </a>

              <a
                href="/terms-of-service"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <FileText className="w-5 h-5 text-racing-red" />
                <span className="font-medium">Terms of Service</span>
              </a>
            </div>
          </Card>

          {/* Version Info */}
          <div className="text-center text-sm text-muted-foreground py-4">
            <p>BoxBoxd v1.0.0</p>
            <p className="mt-1">© 2025 BoxBoxd. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Support;
