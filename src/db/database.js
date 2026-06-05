const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'club_management.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Veritabanı bağlantı hatası:', err.message);
    else console.log('SQLite veritabanına başarıyla bağlanıldı.');
});

db.serialize(() => {
    // Sütunlar için 'NOT EXISTS' alanları 'NOT NULL' olarak düzeltildi
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'student'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS clubs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        capacity INTEGER DEFAULT 50,
        current_members INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_by INTEGER,
        FOREIGN KEY(created_by) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS application_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        club_id INTEGER,
        status TEXT DEFAULT 'pending',
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(club_id) REFERENCES clubs(id)
    )`);
});

module.exports = db;