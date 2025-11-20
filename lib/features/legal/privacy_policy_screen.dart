import 'package:flutter/material.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:lucide_icons/lucide_icons.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

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
          'PRIVACY POLICY',
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
              title: '1. INFORMATION WE COLLECT',
              content: [
                _buildSubsection(
                  subtitle: '1.1 Account Information',
                  text:
                      'When you create a BoxBoxd account, we collect your email address, username, and password. You may optionally provide additional profile information such as a display name, bio, and profile picture.',
                ),
                _buildSubsection(
                  subtitle: '1.2 Race Logs and Activity',
                  text:
                      'We collect information about the races you log, including ratings, reviews, driver of the day selections, watch dates, session types, and other metadata you provide. We also collect information about your lists, comments, likes, and social interactions on the platform.',
                ),
                _buildSubsection(
                  subtitle: '1.3 Usage Information',
                  text:
                      'We automatically collect information about how you use BoxBoxd, including the features you access, the races you view, and your interaction patterns. This helps us improve the app and provide better recommendations.',
                ),
                _buildSubsection(
                  subtitle: '1.4 Device Information',
                  text:
                      'We collect information about the device you use to access BoxBoxd, including device type, operating system, unique device identifiers, and mobile network information.',
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '2. HOW WE USE YOUR INFORMATION',
              content: [
                _buildSubsection(
                  subtitle: '2.1 Provide and Improve Services',
                  text:
                      'We use your information to operate, maintain, and improve BoxBoxd. This includes personalizing your experience, providing race recommendations, and developing new features.',
                ),
                _buildSubsection(
                  subtitle: '2.2 Communication',
                  text:
                      'We may use your email address to send you important updates about your account, service changes, and security notifications. If you opt in, we may also send you promotional emails about new features and F1 content.',
                ),
                _buildSubsection(
                  subtitle: '2.3 Social Features',
                  text:
                      'We use your information to enable social features such as following other users, viewing activity feeds, and discovering content from the BoxBoxd community.',
                ),
                _buildSubsection(
                  subtitle: '2.4 Analytics and Research',
                  text:
                      'We analyze usage patterns and user behavior to understand how BoxBoxd is used, identify trends, and improve our services. This analysis is performed on aggregated, anonymized data whenever possible.',
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '3. INFORMATION SHARING AND DISCLOSURE',
              content: [
                _buildSubsection(
                  subtitle: '3.1 Public Information',
                  text:
                      'Your username, profile information, race logs, reviews, lists, and other content you share publicly are visible to all BoxBoxd users and may be indexed by search engines. You can control the visibility of your content through privacy settings.',
                ),
                _buildSubsection(
                  subtitle: '3.2 Private Account',
                  text:
                      'If you enable the private account setting, only approved followers can see your activity, race logs, and lists. Your profile information remains visible to all users.',
                ),
                _buildSubsection(
                  subtitle: '3.3 Service Providers',
                  text:
                      'We may share your information with third-party service providers who help us operate BoxBoxd, such as cloud hosting providers, analytics services, and email delivery services. These providers are contractually obligated to protect your information.',
                ),
                _buildSubsection(
                  subtitle: '3.4 Legal Requirements',
                  text:
                      'We may disclose your information if required by law, legal process, or government request, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.',
                ),
                _buildSubsection(
                  subtitle: '3.5 Business Transfers',
                  text:
                      'If BoxBoxd is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change in ownership or control of your personal information.',
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '4. DATA RETENTION',
              content: [
                _buildParagraph(
                    'We retain your information for as long as your account is active or as needed to provide you services. If you delete your account, we will delete your personal information within 30 days, except where we are required to retain it for legal or regulatory purposes.'),
                _buildParagraph(
                    'You can request deletion of your account and all associated data at any time through the Settings screen. Once deleted, your data cannot be recovered.'),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '5. DATA SECURITY',
              content: [
                _buildParagraph(
                    'We implement industry-standard security measures to protect your information from unauthorized access, disclosure, alteration, and destruction. This includes encryption of data in transit and at rest, secure authentication mechanisms, and regular security audits.'),
                _buildParagraph(
                    'However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.'),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '6. YOUR RIGHTS AND CHOICES',
              content: [
                _buildSubsection(
                  subtitle: '6.1 Access and Update',
                  text:
                      'You can access and update your account information at any time through the Settings screen. You can also edit or delete your race logs, reviews, and lists.',
                ),
                _buildSubsection(
                  subtitle: '6.2 Privacy Settings',
                  text:
                      'You can control who sees your activity by enabling the private account setting. You can also control notification preferences and activity status visibility.',
                ),
                _buildSubsection(
                  subtitle: '6.3 Data Export',
                  text:
                      'You can request a copy of your data at any time through the Settings screen. We will provide your data in a machine-readable JSON format.',
                ),
                _buildSubsection(
                  subtitle: '6.4 Account Deletion',
                  text:
                      'You can delete your account at any time through the Settings screen. This will permanently delete all your data, including race logs, reviews, lists, and social interactions.',
                ),
                _buildSubsection(
                  subtitle: '6.5 Marketing Communications',
                  text:
                      'You can opt out of promotional emails by adjusting your notification preferences in Settings or by clicking the unsubscribe link in any promotional email.',
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '7. CHILDREN\'S PRIVACY',
              content: [
                _buildParagraph(
                    'BoxBoxd is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us and we will delete such information.'),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '8. INTERNATIONAL DATA TRANSFERS',
              content: [
                _buildParagraph(
                    'BoxBoxd is operated from the United States. If you are accessing BoxBoxd from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States and other countries where our service providers operate.'),
                _buildParagraph(
                    'By using BoxBoxd, you consent to the transfer of your information to countries outside your country of residence, which may have different data protection laws.'),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '9. THIRD-PARTY SERVICES',
              content: [
                _buildParagraph(
                    'BoxBoxd may contain links to third-party websites and services, including the Ergast F1 API for race data and flagcdn.com for country flags. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.'),
                _buildParagraph(
                    'We use Firebase services (Authentication and Firestore) provided by Google. Your data is subject to Google\'s privacy policy in addition to this policy.'),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '10. COOKIES AND TRACKING',
              content: [
                _buildParagraph(
                    'BoxBoxd uses local storage and similar technologies to store your authentication token and app preferences on your device. This information is stored locally and is not transmitted to our servers except as necessary to authenticate your requests.'),
                _buildParagraph(
                    'We may use analytics services that use cookies and similar technologies to collect information about your use of BoxBoxd. You can control cookie preferences through your device settings.'),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '11. CHANGES TO THIS POLICY',
              content: [
                _buildParagraph(
                    'We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.'),
                _buildParagraph(
                    'We encourage you to review this Privacy Policy periodically. Your continued use of BoxBoxd after any changes indicates your acceptance of the updated policy.'),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              title: '12. CONTACT US',
              content: [
                _buildParagraph(
                    'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:'),
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
            'Welcome to BoxBoxd. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our mobile application and services.',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'By using BoxBoxd, you agree to the collection and use of information in accordance with this policy. If you do not agree with this policy, please do not use our services.',
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
                'privacy@boxboxd.app',
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
            LucideIcons.shield,
            color: AppTheme.racingRed,
            size: 32,
          ),
          const SizedBox(height: 12),
          const Text(
            'Your privacy is important to us',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'We are committed to protecting your personal information and being transparent about our data practices.',
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
