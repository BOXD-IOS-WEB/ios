import 'package:flutter/material.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:lucide_icons/lucide_icons.dart';

class TermsOfServiceScreen extends StatelessWidget {
  const TermsOfServiceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.black,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'TERMS OF SERVICE',
          style: TextStyle(
            fontWeight: FontWeight.w900,
            fontSize: 24,
            letterSpacing: 1,
            color: Colors.white,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildLastUpdated(),
            const SizedBox(height: 24),
            _buildIntroduction(),
            const SizedBox(height: 24),
            _buildSection(
              title: '1. ACCEPTANCE OF TERMS',
              content: [
                _buildParagraph(
                    'By accessing or using BoxBoxd, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this application.'),
                _buildParagraph(
                    'We reserve the right to modify these terms at any time. Your continued use of BoxBoxd after any changes indicates your acceptance of the new terms.'),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '2. DESCRIPTION OF SERVICE',
              content: [
                _buildParagraph(
                    'BoxBoxd is a social platform for Formula 1 fans to log, rate, and review F1 races they watch. The service allows users to create lists, follow other users, and engage with the F1 community.'),
                _buildParagraph(
                    'We provide race data through third-party APIs and services. While we strive for accuracy, we do not guarantee that all race information is complete, accurate, or up-to-date.'),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '3. USER ACCOUNTS',
              content: [
                _buildSubsection(
                  subtitle: '3.1 Account Creation',
                  text:
                      'To use BoxBoxd, you must create an account by providing a valid email address and password. You must be at least 13 years old to create an account.',
                ),
                _buildSubsection(
                  subtitle: '3.2 Account Security',
                  text:
                      'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.',
                ),
                _buildSubsection(
                  subtitle: '3.3 Account Termination',
                  text:
                      'We reserve the right to suspend or terminate your account at any time for any reason, including violation of these terms. You may delete your account at any time through the Settings screen.',
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '4. USER CONTENT',
              content: [
                _buildSubsection(
                  subtitle: '4.1 Your Content',
                  text:
                      'You retain ownership of all content you post on BoxBoxd, including race logs, reviews, comments, and lists. By posting content, you grant BoxBoxd a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content on the platform.',
                ),
                _buildSubsection(
                  subtitle: '4.2 Content Standards',
                  text:
                      'You agree not to post content that is illegal, offensive, defamatory, harassing, threatening, or violates the rights of others. You must not post spam, malware, or any content that interferes with the operation of BoxBoxd.',
                ),
                _buildSubsection(
                  subtitle: '4.3 Content Moderation',
                  text:
                      'We reserve the right to remove any content that violates these terms or that we deem inappropriate. We may, but are not obligated to, monitor user content.',
                ),
                _buildSubsection(
                  subtitle: '4.4 Copyright',
                  text:
                      'You must not post content that infringes on the intellectual property rights of others. If you believe your copyright has been infringed, please contact us with details of the alleged infringement.',
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '5. ACCEPTABLE USE',
              content: [
                _buildParagraph(
                    'You agree to use BoxBoxd only for lawful purposes and in accordance with these terms. You must not:'),
                _buildBulletPoint(
                    'Use BoxBoxd in any way that violates applicable laws or regulations'),
                _buildBulletPoint(
                    'Attempt to gain unauthorized access to any part of BoxBoxd or related systems'),
                _buildBulletPoint(
                    'Interfere with or disrupt the operation of BoxBoxd or servers'),
                _buildBulletPoint(
                    'Use automated systems (bots, scrapers) to access BoxBoxd without permission'),
                _buildBulletPoint(
                    'Impersonate any person or entity or misrepresent your affiliation'),
                _buildBulletPoint(
                    'Harass, abuse, or harm other users'),
                _buildBulletPoint(
                    'Collect or store personal data about other users without consent'),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '6. INTELLECTUAL PROPERTY',
              content: [
                _buildSubsection(
                  subtitle: '6.1 BoxBoxd Property',
                  text:
                      'BoxBoxd and its original content, features, and functionality are owned by BoxBoxd and are protected by international copyright, trademark, and other intellectual property laws.',
                ),
                _buildSubsection(
                  subtitle: '6.2 Trademarks',
                  text:
                      'The BoxBoxd name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of BoxBoxd. You must not use such marks without our prior written permission.',
                ),
                _buildSubsection(
                  subtitle: '6.3 Third-Party Content',
                  text:
                      'Formula 1, F1, and related marks are trademarks of Formula One Licensing BV. BoxBoxd is not affiliated with, endorsed by, or sponsored by Formula One Licensing BV or any F1 teams, drivers, or organizations.',
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '7. PRIVACY',
              content: [
                _buildParagraph(
                    'Your use of BoxBoxd is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use, and protect your information.'),
                _buildParagraph(
                    'By using BoxBoxd, you consent to the collection and use of your information as described in the Privacy Policy.'),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '8. DISCLAIMERS',
              content: [
                _buildSubsection(
                  subtitle: '8.1 Service Availability',
                  text:
                      'BoxBoxd is provided "as is" and "as available" without warranties of any kind. We do not guarantee that BoxBoxd will be uninterrupted, secure, or error-free.',
                ),
                _buildSubsection(
                  subtitle: '8.2 Content Accuracy',
                  text:
                      'We do not warrant the accuracy, completeness, or reliability of any content on BoxBoxd, including race data, user reviews, or statistics. You use BoxBoxd at your own risk.',
                ),
                _buildSubsection(
                  subtitle: '8.3 Third-Party Services',
                  text:
                      'BoxBoxd may contain links to third-party websites and services. We are not responsible for the content, accuracy, or practices of these third parties.',
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '9. LIMITATION OF LIABILITY',
              content: [
                _buildParagraph(
                    'To the maximum extent permitted by law, BoxBoxd and its affiliates, officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of BoxBoxd.'),
                _buildParagraph(
                    'In no event shall our total liability to you for all damages exceed the amount you paid to use BoxBoxd in the past twelve months, or \$100, whichever is greater.'),
                _buildParagraph(
                    'Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability for incidental or consequential damages. In such jurisdictions, our liability will be limited to the maximum extent permitted by law.'),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '10. INDEMNIFICATION',
              content: [
                _buildParagraph(
                    'You agree to indemnify, defend, and hold harmless BoxBoxd and its affiliates, officers, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorneys\' fees, arising out of or related to:'),
                _buildBulletPoint('Your use of BoxBoxd'),
                _buildBulletPoint('Your violation of these Terms of Service'),
                _buildBulletPoint('Your violation of any rights of another party'),
                _buildBulletPoint('Your content posted on BoxBoxd'),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '11. DISPUTE RESOLUTION',
              content: [
                _buildSubsection(
                  subtitle: '11.1 Governing Law',
                  text:
                      'These Terms of Service shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.',
                ),
                _buildSubsection(
                  subtitle: '11.2 Arbitration',
                  text:
                      'Any dispute arising out of or relating to these terms or BoxBoxd shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in the United States.',
                ),
                _buildSubsection(
                  subtitle: '11.3 Class Action Waiver',
                  text:
                      'You agree that any arbitration or proceeding shall be limited to the dispute between you and BoxBoxd individually. You waive any right to participate in a class action lawsuit or class-wide arbitration.',
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '12. CHANGES TO SERVICE',
              content: [
                _buildParagraph(
                    'We reserve the right to modify, suspend, or discontinue BoxBoxd or any part thereof at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the service.'),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '13. SEVERABILITY',
              content: [
                _buildParagraph(
                    'If any provision of these Terms of Service is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. The invalid or unenforceable provision shall be replaced with a valid provision that most closely matches the intent of the original provision.'),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '14. ENTIRE AGREEMENT',
              content: [
                _buildParagraph(
                    'These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and BoxBoxd regarding your use of the service and supersede all prior agreements and understandings.'),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '15. CONTACT INFORMATION',
              content: [
                _buildParagraph(
                    'If you have any questions about these Terms of Service, please contact us at:'),
                const SizedBox(height: 12),
                _buildContactInfo(),
              ],
            ),
            const SizedBox(height: 32),
            _buildFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildLastUpdated() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.muted),
      ),
      child: Row(
        children: [
          Icon(
            LucideIcons.calendar,
            color: AppTheme.racingRed,
            size: 20,
          ),
          const SizedBox(width: 12),
          const Text(
            'Last Updated: January 1, 2025',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIntroduction() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.muted),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'INTRODUCTION',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w900,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Welcome to BoxBoxd. These Terms of Service ("Terms") govern your access to and use of the BoxBoxd mobile application and services.',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Please read these Terms carefully before using BoxBoxd. By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the service.',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required List<Widget> content,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.muted),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w900,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 16),
          ...content,
        ],
      ),
    );
  }

  Widget _buildSubsection({
    required String subtitle,
    required String text,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            subtitle,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            text,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 14,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildParagraph(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white70,
          fontSize: 14,
          height: 1.6,
        ),
      ),
    );
  }

  Widget _buildBulletPoint(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '• ',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
              height: 1.6,
            ),
          ),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 14,
                height: 1.6,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactInfo() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black26,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                LucideIcons.mail,
                color: AppTheme.racingRed,
                size: 16,
              ),
              const SizedBox(width: 8),
              const Text(
                'Email:',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'legal@boxboxd.app',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(
                LucideIcons.globe,
                color: AppTheme.racingRed,
                size: 16,
              ),
              const SizedBox(width: 8),
              const Text(
                'Website:',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'www.boxboxd.app',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFooter() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.black26,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        children: [
          Icon(
            LucideIcons.fileText,
            color: AppTheme.racingRed,
            size: 32,
          ),
          const SizedBox(height: 12),
          const Text(
            'Thank you for using BoxBoxd',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'By using our service, you agree to these terms. We appreciate your trust and are committed to providing the best F1 community experience.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
