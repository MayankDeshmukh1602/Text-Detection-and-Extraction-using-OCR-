const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ocr_db',
    ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
    )
`;
pool.query(createTableQuery, (err, result) => {
    if (err) console.error("Error creating users table:", err);
    else console.log("Users table checked/created.");
});

// Register API
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    pool.query(sql, [username, email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(400).json({ error: "User already exists or DB error!" });
        }
        res.send({ message: "User Registered Successfully!" });
    });
});

// Login API
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    pool.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: "Server Error" });
        
        if (results.length > 0) {
            res.send({ message: "Login Success" });
        } else {
            res.status(401).json({ error: "Invalid Username or Password!" });
        }
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(5000, () => console.log('Backend Server started on port 5000 🚀'));
}

module.exports = app;