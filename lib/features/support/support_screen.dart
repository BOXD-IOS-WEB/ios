import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:boxboxd/core/theme.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:package_info_plus/package_info_plus.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  String _version = 'Loading...';
  String _buildNumber = '';

  @override
  void initState() {
    super.initState();
    _loadVersionInfo();
  }

  Future<void> _loadVersionInfo() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      setState(() {
        _version = packageInfo.version;
        _buildNumber = packageInfo.buildNumber;
      });
    } catch (e) {
      setState(() {
        _version = '1.0.0';
        _buildNumber = '1';
      });
    }
  }

  Future<void> _launchEmail() async {
    final Uri emailUri = Uri(
      scheme: 'mailto',
      path: 'support@boxboxd.app',
      query: 'subject=BoxBoxd Support Request',
    );

    try {
      if (await canLaunchUrl(emailUri)) {
        await launchUrl(emailUri);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Could not open email client'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _launchUrl(String url) async {
    final Uri uri = Uri.parse(url);

    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Could not open link'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

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
          'SUPPORT',
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
            // Contact Methods Section
            _buildSectionHeader('CONTACT US'),
            _buildCard(
              children: [
                _buildContactButton(
                  icon: LucideIcons.mail,
                  label: 'Email Support',
                  subtitle: 'support@boxboxd.app',
                  onTap: _launchEmail,
                ),
                const SizedBox(height: 12),
                _buildContactButton(
                  icon: LucideIcons.twitter,
                  label: 'Twitter',
                  subtitle: '@boxboxd',
                  onTap: () => _launchUrl('https://twitter.com/boxboxd'),
                ),
                const SizedBox(height: 12),
                _buildContactButton(
                  icon: LucideIcons.instagram,
                  label: 'Instagram',
                  subtitle: '@boxboxd',
                  onTap: () => _launchUrl('https://instagram.com/boxboxd'),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // FAQ Section
            _buildSectionHeader('FREQUENTLY ASKED QUESTIONS'),
            _buildCard(
              children: [
                _buildFAQItem(
                  question: 'How do I log a race?',
                  answer:
                      'Tap the "+" button on the home screen or navigate to a race detail page and tap "Log Race". Fill in the details including your rating, review, and other metadata.',
                ),
                const Divider(color: Colors.white24, height: 24),
                _buildFAQItem(
                  question: 'Can I edit or delete my race logs?',
                  answer:
                      'Yes! Go to your Diary, long-press on any race log card, and select "Edit" or "Delete" from the menu.',
                ),
                const Divider(color: Colors.white24, height: 24),
                _buildFAQItem(
                  question: 'How do I create a list?',
                  answer:
                      'Navigate to the Lists section and tap the "+" button. Give your list a name and description, then start adding races.',
                ),
                const Divider(color: Colors.white24, height: 24),
                _buildFAQItem(
                  question: 'How do I follow other users?',
                  answer:
                      'Visit any user\'s profile and tap the "Follow" button. You\'ll see their activity in your Activity feed.',
                ),
                const Divider(color: Colors.white24, height: 24),
                _buildFAQItem(
                  question: 'Can I make my account private?',
                  answer:
                      'Yes! Go to Settings > Privacy and toggle "Private Account". When enabled, only approved followers can see your activity.',
                ),
                const Divider(color: Colors.white24, height: 24),
                _buildFAQItem(
                  question: 'How do I export my data?',
                  answer:
                      'Go to Settings > Data Management and tap "Export My Data". You\'ll receive a JSON file with all your data.',
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Legal Links Section
            _buildSectionHeader('LEGAL'),
            _buildCard(
              children: [
                _buildLinkButton(
                  icon: LucideIcons.shield,
                  label: 'Privacy Policy',
                  onTap: () => context.push('/privacy-policy'),
                ),
                const SizedBox(height: 8),
                _buildLinkButton(
                  icon: LucideIcons.fileText,
                  label: 'Terms of Service',
                  onTap: () => context.push('/terms-of-service'),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Version Information
            _buildSectionHeader('APP INFORMATION'),
            _buildCard(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Version',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      '$_version ($_buildNumber)',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'BoxBoxd - Your F1 Viewing Diary',
                  style: TextStyle(
                    color: Colors.white54,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  '© 2025 BoxBoxd. All rights reserved.',
                  style: TextStyle(
                    color: Colors.white54,
                    fontSize: 12,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
      child: Text(
        title,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 14,
          fontWeight: FontWeight.w900,
          letterSpacing: 1,
        ),
      ),
    );
  }

  Widget _buildCard({required List<Widget> children}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.muted),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children,
      ),
    );
  }

  Widget _buildContactButton({
    required IconData icon,
    required String label,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.black26,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.white12),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppTheme.racingRed.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: AppTheme.racingRed, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              LucideIcons.externalLink,
              color: Colors.white54,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFAQItem({
    required String question,
    required String answer,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          question,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          answer,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 14,
            height: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildLinkButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        child: Row(
          children: [
            Icon(icon, color: Colors.white70, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                ),
              ),
            ),
            const Icon(
              LucideIcons.chevronRight,
              color: Colors.white54,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
