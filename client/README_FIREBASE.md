
# Security Rules

This application uses Firebase Firestore. For development and personal use, you must configure your Firestore Security Rules to allow read/write access.

Go to your Firebase Console -> Firestore Database -> Rules, and paste the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> **Warning**: These rules allow anyone with your project config to read and write your database. For a production app, you should restrict these rules based on authentication.

# Environment Variables

Ensure you have a `.env` file in `client/` with the following keys:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=sourabhzssc
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```
