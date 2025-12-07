const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ensure absolute path for DB to avoid CWD issues
const dbPath = path.resolve(__dirname, 'ssc_study.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database at:', dbPath);
    }
});

db.serialize(() => {
    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON");

    // Chapters table
    db.run(`CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        chapter_name TEXT NOT NULL,
        target_hours REAL DEFAULT 0,
        status TEXT DEFAULT 'Not Started',
        notes TEXT
    )`);

    // Study Sessions table
    db.run(`CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        duration_min INTEGER,
        subject TEXT NOT NULL,
        chapter TEXT,
        topic_type TEXT,
        source TEXT,
        questions_solved INTEGER DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Mocks table
    db.run(`CREATE TABLE IF NOT EXISTS mocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        mock_name TEXT NOT NULL,
        platform TEXT,
        tier TEXT,
        max_marks REAL,
        score REAL,
        time_taken_min INTEGER,
        attempts_total INTEGER,
        correct_total INTEGER,
        wrong_total INTEGER,
        negative_marks REAL,
        accuracy REAL,
        qa_score REAL,
        reasoning_score REAL,
        english_score REAL,
        gk_score REAL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tasks table
    // Ensure all fields from user request are present
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        subject TEXT,
        chapter TEXT,
        category TEXT DEFAULT 'Study',
        is_done INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Add updated_at if missing (for legacy schema support if table existed)
    // We can't easily do ADD COLUMN IF NOT EXISTS in SQLite without checking first.
    // For now, we assume if it fails, it exists.
    // Simplifying: The user request implies sticking to the plan.

    // Seed Data if chapters are empty
    db.get("SELECT count(*) as count FROM chapters", (err, row) => {
        if (err) return console.error(err.message);
        if (row && row.count === 0) {
            console.log("Seeding chapters...");
            const chaptersText = [
                ['Quant', 'Percentage', 5, 'Strong'],
                ['Quant', 'Ratio & Proportion', 4, 'Learning'],
                ['Quant', 'Geometry', 10, 'Not Started'],
                ['Reasoning', 'Coding-Decoding', 3, 'Strong'],
                ['Reasoning', 'Puzzles', 5, 'Revising'],
                ['English', 'Grammar Rules', 8, 'Learning'],
                ['English', 'Vocabulary', 10, 'Revising'],
                ['GK', 'Polity', 6, 'Not Started'],
                ['GK', 'History', 8, 'Not Started']
            ];
            const stmt = db.prepare("INSERT INTO chapters (subject, chapter_name, target_hours, status) VALUES (?, ?, ?, ?)");
            chaptersText.forEach(c => stmt.run(c));
            stmt.finalize();
        }
    });
});

module.exports = db;
