# BoxBoxd iOS App - App Store Submission Guide

## Current Status ✅

Your iOS app has been successfully built and configured! Here's what's ready:

### ✅ Completed Setup
- **iOS Project Created**: Fresh Capacitor iOS project at `/ios/App/`
- **Web Assets Built**: Production build copied to iOS app
- **CocoaPods Installed**: All native dependencies configured
- **Bundle ID**: `com.boxboxd.app`
- **App Name**: BoxBoxd
- **Base Configuration**: Info.plist configured with proper permissions

### 📁 Project Structure
```
ios/
├── App/
│   ├── App.xcodeproj         # Xcode project
│   ├── App.xcworkspace       # Main workspace (open this in Xcode)
│   ├── App/
│   │   ├── Info.plist        # App configuration
│   │   ├── Assets.xcassets/  # Icons and splash screens
│   │   └── public/           # Your web app files
│   ├── Podfile               # CocoaPods dependencies
│   └── Pods/                 # Native dependencies
```

---

## 🚀 Next Steps for App Store Submission

### 1. Install Xcode (Required)

Download and install Xcode from the Mac App Store:
- Open **Mac App Store**
- Search for "Xcode"
- Download and install (it's ~12GB)

After installation, set it as the active developer directory:
```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

### 2. Create App Icons

You need custom app icons for your F1 app. Required sizes:
- **1024x1024** - App Store icon
- Various smaller sizes (handled by Xcode)

**Where to add icons:**
1. Open `ios/App/App.xcworkspace` in Xcode (NOT .xcodeproj)
2. In the left sidebar, navigate to: **App → App → Assets.xcassets → AppIcon**
3. Drag and drop your icon images (1024x1024 PNG)

**Design Tips for BoxBoxd Icon:**
- Use F1 theme (racing red, checkered flag, etc.)
- Keep it simple and recognizable at small sizes
- Avoid text (it won't be readable)
- Consider: Stylized "B" logo, F1 car silhouette, or racing flag

### 3. Configure Splash Screen

The splash screen shows while your app loads.

**Location:** `ios/App/App/Assets.xcassets/Splash.imageset/`

Create a simple splash screen with:
- BoxBoxd logo/name
- F1-themed background
- Size: 2732x2732 (will be scaled automatically)

### 4. Configure App in Xcode

Open the workspace: `ios/App/App.xcworkspace`

**Required Settings:**
1. **General Tab**
   - Display Name: BoxBoxd
   - Bundle Identifier: com.boxboxd.app (or your own domain)
   - Version: 1.0.0
   - Build: 1

2. **Signing & Capabilities**
   - Add your Apple Developer account
   - Enable "Automatically manage signing"
   - Select your Team (requires Apple Developer Program membership)

3. **Deployment Info**
   - Minimum iOS version: 13.0 (already set)
   - Supported orientations:
     - Portrait ✅
     - Landscape Left ✅
     - Landscape Right ✅

### 5. Apple Developer Account

**Required:** $99/year Apple Developer Program membership

Sign up at: https://developer.apple.com/programs/

You need this to:
- Sign your app
- Submit to App Store
- Test on real devices

### 6. App Privacy Information

For App Store submission, you'll need to declare:

**Data Collection:**
- User authentication (Email, Name)
- User-generated content (Race logs, reviews, lists)
- Firebase Analytics (if enabled)

**Permissions Used:**
- None currently (app works without camera/location)

### 7. App Store Connect Setup

1. Go to https://appstoreconnect.apple.com
2. Click "+ New App"
3. Fill in:
   - **Platform**: iOS
   - **Name**: BoxBoxd
   - **Primary Language**: English (US)
   - **Bundle ID**: com.boxboxd.app
   - **SKU**: boxboxd-ios (or your choice)
   - **User Access**: Full Access

4. Fill out the app information:
   - **Category**: Sports
   - **Description**: Write about the F1 race tracking features
   - **Keywords**: F1, Formula 1, racing, race tracking, motorsport, diary
   - **Support URL**: Your website/support page
   - **Marketing URL**: Your website

5. Upload Screenshots:
   - Required sizes: 6.5" and 5.5" displays
   - Show key features: race browsing, logging, reviews, profile
   - Use iPhone 15 Pro Max simulator for 6.5"

---

## 🔧 Building for App Store

### Development Build (Testing on Device)

```bash
# 1. Build the web app
npm run build

# 2. Copy to iOS (if you make changes)
cp -R dist/* ios/App/App/public/

# 3. Open in Xcode
open ios/App/App.xcworkspace

# 4. In Xcode:
#    - Select your device
#    - Click Run (▶️)
```

### Production Build (App Store)

In Xcode:
1. Select **"Any iOS Device (arm64)"** as the destination
2. Go to: **Product → Archive**
3. Wait for archive to complete
4. Click **"Distribute App"**
5. Choose **"App Store Connect"**
6. Follow the wizard to upload

---

## 📋 Pre-Submission Checklist

Before submitting to App Store:

### Required:
- [ ] Custom app icon (1024x1024)
- [ ] Custom splash screen
- [ ] Apple Developer account ($99/year)
- [ ] Xcode installed and configured
- [ ] App built and tested on real device
- [ ] Screenshots for App Store (6.5" and 5.5")
- [ ] App Store Connect app created
- [ ] Privacy policy URL (if collecting data)
- [ ] Support URL/email

### Recommended:
- [ ] Test on multiple devices/iOS versions
- [ ] Check Firebase configuration (production vs dev)
- [ ] Set up App Store description
- [ ] Prepare promotional materials
- [ ] Set app pricing (free)
- [ ] Test in-app purchases if any

---

## 🔄 Updating Your App

When you make changes to your web app:

```bash
# 1. Build new version
npm run build

# 2. Copy to iOS
cp -R dist/* ios/App/App/public/

# 3. Increment version in Xcode
# General → Version: 1.0.1, Build: 2

# 4. Archive and submit
```

---

## 🐛 Common Issues

### "pod install failed"
- Make sure Xcode is installed
- Run: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
- Then: `cd ios/App && pod install`

### "No signing certificate"
- Add Apple Developer account in Xcode
- Enable "Automatically manage signing"
- Make sure you're enrolled in Apple Developer Program

### "Build failed"
- Clean build folder: **Product → Clean Build Folder**
- Delete derived data: **Window → Organizer → Projects → Delete**
- Try again

### "App crashes on launch"
- Check console logs in Xcode
- Verify Firebase config is correct
- Test in iOS Simulator first

---

## 📱 Testing

### iOS Simulator
```bash
# Open in Xcode
open ios/App/App.xcworkspace

# Select iPhone 15 Pro as destination
# Click Run (▶️)
```

### Real Device (requires Apple Developer account)
1. Connect iPhone via USB
2. Trust computer on iPhone
3. Select device in Xcode
4. Click Run

---

## 📚 Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)

---

## 🎉 You're Ready!

Your iOS app is **95% complete**! The main remaining tasks are:

1. **Install Xcode** (if not already)
2. **Create custom app icon** (use F1/racing theme)
3. **Set up Apple Developer account** ($99/year)
4. **Configure signing in Xcode**
5. **Archive and submit**

The technical setup is done - now it's about design and Apple Developer Program enrollment.

Good luck with your App Store launch! 🏎️🏁
