const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const db = mysql.createConnection({
    host: 'localhost',
    port: 3307, // Agar aapka XAMPP 3306 par chal raha hai to 3306 karein
    user: 'root',
    password: '', 
    database: 'ocr_db'
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

app.listen(5000, () => console.log('🚀 Server started on http://localhost:5000'));p;
