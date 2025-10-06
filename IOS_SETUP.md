# BoxBoxd iOS Setup

## ✅ Completed Steps

1. **Mobile Responsive Design**
   - Updated Header navigation for mobile breakpoints
   - Added mobile search icon button
   - Made homepage hero section responsive (text sizes, button layouts)
   - Optimized Profile page for mobile (avatar sizes, stats grid, text responsiveness)

2. **Capacitor Installation**
   - Installed `@capacitor/core`, `@capacitor/cli`, and `@capacitor/ios`
   - Initialized Capacitor with app ID: `com.boxboxd.app`
   - Built production app with Vite

3. **iOS Xcode Project**
   - Created iOS platform with `npx cap add ios`
   - Generated Xcode workspace at: `ios/App/App.xcworkspace`
   - Configured capacitor.config.ts with iOS settings

## 🚀 Next Steps to Run on iOS

### Option 1: Open in Xcode (Recommended)
```bash
# Open the Xcode workspace
open ios/App/App.xcworkspace
```

Then in Xcode:
1. Select your development team in Signing & Capabilities
2. Choose a simulator or connected device
3. Click Run (⌘R)

### Option 2: Run from Command Line
```bash
# Make sure Xcode command line tools point to Xcode (not just CLI tools)
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Install CocoaPods dependencies
cd ios/App && pod install

# Sync and run
npx cap run ios
```

## 📱 Building & Syncing

After making changes to your web app:
```bash
# 1. Build the web app
npm run build

# 2. Sync changes to iOS
npx cap sync ios
```

## 🎨 Customization

### App Icon
- Icon configuration: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Current icon: Default Capacitor icon (1024x1024 required)
- To customize: Replace `AppIcon-512@2x.png` with your 1024x1024 app icon

### App Display Name
- Already set to "BoxBoxd" in `Info.plist`

### Bundle Identifier
- Set to: `com.boxboxd.app`
- Can be changed in Xcode project settings or `capacitor.config.ts`

### Splash Screen
- Location: `ios/App/App/Assets.xcassets/Splash.imageset/`
- Configured in: `ios/App/App/Base.lproj/LaunchScreen.storyboard`

## 🔧 Configuration Files

- **Capacitor Config**: `capacitor.config.ts`
- **iOS Info.plist**: `ios/App/App/Info.plist`
- **Xcode Project**: `ios/App/App.xcodeproj`
- **Xcode Workspace**: `ios/App/App.xcworkspace` (use this to open in Xcode)

## ⚠️ Important Notes

1. **Xcode Required**: You need Xcode installed to run on iOS simulator or device
2. **Development Team**: You'll need to select a development team in Xcode for code signing
3. **First Run**: The first time you open in Xcode, you may need to wait for indexing
4. **Pod Install**: If you see CocoaPods errors, run `cd ios/App && pod install`

## 📦 App Structure

```
boxboxd-web/
├── capacitor.config.ts       # Capacitor configuration
├── dist/                      # Built web app (copied to iOS)
├── ios/
│   └── App/
│       ├── App.xcworkspace   # Open this in Xcode
│       ├── App.xcodeproj
│       ├── App/
│       │   ├── Info.plist
│       │   ├── Assets.xcassets/
│       │   └── public/        # Web assets
│       └── Pods/
```

## 🎯 Ready to Run!

Your iOS project is fully configured and ready to run in Xcode. Simply open:
```bash
open ios/App/App.xcworkspace
```
