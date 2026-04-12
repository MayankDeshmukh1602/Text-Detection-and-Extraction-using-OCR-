const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path'); // Path module add kiya frontend ke liye

const app = express();
app.use(cors());
app.use(express.json());

// --- FRONTEND SERVING ---
// Ye line Render ko batayegi ki sari HTML/CSS files current folder mein hain
app.use(express.static(path.join(__dirname, './')));

// --- DATABASE CONNECTION ---
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ocr_db',
    // SSL enable kiya cloud database (Aiven/Railway) ke liye
    ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false 
});

db.connect(err => {
    if (err) {
        console.error('❌ Database Connection Error: ' + err.message);
        return;
    }
    console.log('✅ MySQL Connected Successfully!');
});

// --- ROUTES ---

// Register Route
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(sql, [username, email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(400).json({ error: "Username already exists!" });
        }
        res.send({ message: "Registration Successful!" });
    });
});

// Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: "Server Error" });
        if (results.length > 0) {
            res.send({ message: "Login Success" });
        } else {
            res.status(401).json({ error: "Invalid Credentials!" });
        }
    });
});

// Admin Route: Get all users
app.get('/admin/users', (req, res) => {
    const sql = "SELECT id, username, email FROM users ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch users" });
        }
        res.send(results);
    });
});

// --- CATCH-ALL ROUTE ---
// Agar koi bhi URL hit ho, toh index.html hi dikhao (Frontend ke liye)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
