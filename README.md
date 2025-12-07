# SSC CGL Study Tracker

A modern, serverless web application to track study sessions, mock test scores, and syllabus progress for SSC CGL preparation.
Powered by **React** and **Firebase**.

## Tech Stack
*   **Frontend**: React, Vite, TailwindCSS, Recharts
*   **Database**: Firebase Firestore (Cloud Database)
*   **Hosting**: Static Hosting (Netlify/Vercel)

## Prerequisites
*   Node.js installed.
*   A Firebase Project (for Firestore keys).

## Setup Instructions

1.  **Frontend Setup**
    ```bash
    cd client
    npm install
    ```

2.  **Configuration**
    *   Create a `.env` file in the `client` folder.
    *   Add your Firebase configuration keys:
    ```
    REACT_APP_FIREBASE_API_KEY=...
    REACT_APP_FIREBASE_AUTH_DOMAIN=...
    REACT_APP_FIREBASE_PROJECT_ID=...
    REACT_APP_FIREBASE_STORAGE_BUCKET=...
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
    REACT_APP_FIREBASE_APP_ID=...
    ```

3.  **Run Application**
    ```bash
    # Only the client is needed now!
    cd client
    npm run dev
    # App runs on http://localhost:5173
    ```

## Features
*   **Dashboard**: View daily/weekly study stats and mock trends (Live Firestore Data).
*   **Log Study**: Record study sessions directly to the cloud.
*   **Log Mock**: Record mock test scores with detailed analysis.
*   **Chapters**: Track syllabus completion status.
*   **Import**: Bulk upload data via CSV directly in the browser.

## CSV Import Format
*   **Study Sessions**: `date,start_time,end_time,subject,chapter`
*   **Mocks**: `date,mock_name,score,attempts_total,max_marks`
