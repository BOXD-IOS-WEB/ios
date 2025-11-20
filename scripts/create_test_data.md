# Creating Test Data for BoxBoxd

## Option 1: Using the App (Recommended)

The easiest way to create test data is to use the app itself:

1. **Sign up** with a test account
2. **Log some races**:
   - Go to Home
   - Click on any race
   - Click "LOG RACE"
   - Fill in the form and save
3. **Create lists**:
   - Go to Profile
   - Click "CREATE NEW LIST"
   - Add races and save
4. **Check Activity feed**:
   - Go to Activity tab
   - You should see your activities

## Option 2: Firebase Console (Manual)

You can manually add documents through Firebase Console:

### 1. Go to Firebase Console
- Open https://console.firebase.google.com
- Select your project
- Go to Firestore Database

### 2. Create a Race Log

Collection: `raceLogs`

Sample document:
```json
{
  "userId": "test-user-id",
  "username": "Test User",
  "userAvatar": "",
  "raceYear": 2024,
  "raceName": "Abu Dhabi Grand Prix",
  "raceLocation": "Yas Marina Circuit",
  "round": 24,
  "countryCode": "ARE",
  "dateWatched": "2024-12-08T00:00:00Z",
  "sessionType": "race",
  "watchMode": "live",
  "rating": 5,
  "review": "Amazing season finale! Great racing and drama.",
  "tags": ["season-finale", "championship"],
  "companions": [],
  "driverOfTheDay": "Max Verstappen",
  "raceWinner": "Max Verstappen",
  "mediaUrls": [],
  "spoilerWarning": false,
  "visibility": "public",
  "createdAt": "2024-12-08T20:00:00Z",
  "updatedAt": "2024-12-08T20:00:00Z",
  "likesCount": 0,
  "commentsCount": 0,
  "likedBy": []
}
```

### 3. Create an Activity

Collection: `activities`

Sample document:
```json
{
  "userId": "test-user-id",
  "username": "Test User",
  "userAvatar": "",
  "type": "log",
  "targetId": "race-log-id",
  "targetType": "raceLog",
  "content": "logged Abu Dhabi Grand Prix",
  "createdAt": "2024-12-08T20:00:00Z"
}
```

### 4. Create a List

Collection: `lists`

Sample document:
```json
{
  "userId": "test-user-id",
  "username": "Test User",
  "userProfileImageUrl": "",
  "title": "Best Races of 2024",
  "description": "My favorite races from the 2024 season",
  "races": [
    {
      "raceYear": 2024,
      "raceName": "Abu Dhabi Grand Prix",
      "raceLocation": "Yas Marina Circuit",
      "countryCode": "ARE",
      "order": 0,
      "note": "Epic season finale"
    },
    {
      "raceYear": 2024,
      "raceName": "Monaco Grand Prix",
      "raceLocation": "Circuit de Monaco",
      "countryCode": "MCO",
      "order": 1,
      "note": "Classic Monaco drama"
    }
  ],
  "isPublic": true,
  "tags": ["2024", "favorites"],
  "createdAt": "2024-12-08T20:00:00Z",
  "updatedAt": "2024-12-08T20:00:00Z",
  "likesCount": 0,
  "commentsCount": 0
}
```

### 5. Create User Profile

Collection: `users`
Document ID: `test-user-id`

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "photoURL": "",
  "description": "F1 enthusiast",
  "created_at": "2024-12-08T00:00:00Z",
  "updated_at": "2024-12-08T00:00:00Z"
}
```

### 6. Create User Stats

Collection: `userStats`
Document ID: `test-user-id`

```json
{
  "racesWatched": 1,
  "reviewsCount": 1,
  "listsCount": 1,
  "followersCount": 0,
  "followingCount": 0,
  "totalHoursWatched": 2,
  "favoriteDriver": "Max Verstappen",
  "favoriteCircuit": "Monaco",
  "favoriteTeam": "Red Bull Racing"
}
```

## Option 3: Firebase Admin SDK Script (Advanced)

If you want to create lots of test data programmatically, you can use a Node.js script with Firebase Admin SDK.

### Prerequisites:
- Node.js installed
- Firebase Admin SDK service account key

### Script (create_test_data.js):

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createTestData() {
  const userId = 'test-user-' + Date.now();
  
  // Create user
  await db.collection('users').doc(userId).set({
    name: 'Test User',
    email: 'test@example.com',
    photoURL: '',
    description: 'F1 enthusiast',
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  });

  // Create user stats
  await db.collection('userStats').doc(userId).set({
    racesWatched: 5,
    reviewsCount: 5,
    listsCount: 1,
    followersCount: 0,
    followingCount: 0,
    totalHoursWatched: 10
  });

  // Create race logs
  const races = [
    { name: 'Abu Dhabi Grand Prix', location: 'Yas Marina Circuit', country: 'ARE', round: 24 },
    { name: 'Monaco Grand Prix', location: 'Circuit de Monaco', country: 'MCO', round: 8 },
    { name: 'Silverstone Grand Prix', location: 'Silverstone Circuit', country: 'GBR', round: 10 },
    { name: 'Monza Grand Prix', location: 'Autodromo Nazionale di Monza', country: 'ITA', round: 16 },
    { name: 'Spa Grand Prix', location: 'Circuit de Spa-Francorchamps', country: 'BEL', round: 14 }
  ];

  for (const race of races) {
    const logRef = await db.collection('raceLogs').add({
      userId: userId,
      username: 'Test User',
      userAvatar: '',
      raceYear: 2024,
      raceName: race.name,
      raceLocation: race.location,
      round: race.round,
      countryCode: race.country,
      dateWatched: admin.firestore.Timestamp.now(),
      sessionType: 'race',
      watchMode: 'live',
      rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
      review: `Great race at ${race.name}! Really enjoyed the action.`,
      tags: ['2024'],
      companions: [],
      mediaUrls: [],
      spoilerWarning: false,
      visibility: 'public',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      likesCount: 0,
      commentsCount: 0,
      likedBy: []
    });

    // Create activity for each log
    await db.collection('activities').add({
      userId: userId,
      username: 'Test User',
      userAvatar: '',
      type: 'log',
      targetId: logRef.id,
      targetType: 'raceLog',
      content: `logged ${race.name}`,
      createdAt: admin.firestore.Timestamp.now()
    });
  }

  // Create a list
  await db.collection('lists').add({
    userId: userId,
    username: 'Test User',
    userProfileImageUrl: '',
    title: 'Best Races of 2024',
    description: 'My favorite races from the 2024 season',
    races: races.map((race, index) => ({
      raceYear: 2024,
      raceName: race.name,
      raceLocation: race.location,
      countryCode: race.country,
      order: index,
      note: 'Amazing race!'
    })),
    isPublic: true,
    tags: ['2024', 'favorites'],
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    likesCount: 0,
    commentsCount: 0
  });

  console.log('✅ Test data created successfully!');
  console.log('User ID:', userId);
}

createTestData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error creating test data:', error);
    process.exit(1);
  });
```

### To run:
```bash
npm install firebase-admin
node create_test_data.js
```

## Verification

After creating test data, verify in the app:

1. **Sign in** with any account
2. **Home screen**: Should show F1 races
3. **Explore → Trending**: Should show high-rated logs
4. **Explore → Reviews**: Should show all public logs
5. **Activity**: Should show recent activities

## Notes

- **Timestamps**: Use ISO 8601 format or Firestore Timestamp
- **User IDs**: Must match between collections
- **Visibility**: Set to "public" to show in feeds
- **Rating**: Number between 1-5
- **Session Type**: "race", "sprint", "qualifying", "highlights"
- **Watch Mode**: "live", "replay", "tvBroadcast", "highlights", "attendedInPerson"

## Quick Test

Minimum data to test the app:

1. One user profile
2. One user stats document
3. One race log (public visibility)
4. One activity

This will populate:
- ✅ Activity feed
- ✅ Explore → Reviews
- ✅ Explore → Trending (if rating >= 4)
- ✅ Profile stats
