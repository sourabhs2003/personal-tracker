# SSC CGL Study Tracker

A full-stack web application to track study sessions, mock test scores, and syllabus progress for SSC CGL preparation.

## Tech Stack
*   **Frontend**: React, Vite, TailwindCSS (via CSS variables), Chart.js
*   **Backend**: Node.js, Express, SQLite
*   **Database**: SQLite (`server/ssc_study.db`)

## Prerequisites
*   Node.js installed.

## Setup Instructions

1.  **Backend Setup**
    ```bash
    cd server
    npm install
    # Start the server (will automatically create database and seed data)
    npm start
    # Server runs on http://localhost:5000
    ```

2.  **Frontend Setup**
    Open a new terminal:
    ```bash
    cd client
    npm install
    # Start the development server
    npm run dev
    # Client runs on http://localhost:5173
    ```

## Features
*   **Dashboard**: View daily/weekly study stats and mock trends.
*   **Log Study**: Record study sessions with subject, chapter, and time.
*   **Log Mock**: Record mock test scores with detailed sectional analysis.
*   **Chapters**: Track syllabus completion status and history per chapter.
*   **Import**: Bulk upload data via CSV.

## CSV Import Format
*   **Study Sessions**: `date,start_time,end_time,subject,chapter,topic_type,source,questions_solved,notes`
*   **Mocks**: `date,mock_name,platform,tier,max_marks,score,time_taken_min,attempts_total,correct_total,wrong_total,qa_score,reasoning_score,english_score,gk_score,notes`
