const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host:     'localhost',
  user:     'root',
  password: 'Prabhat123', // ← add your MySQL password here
  database: 'chatapp',
  port:     3306,        // ← add this line
  waitForConnections: true,
  connectionLimit: 10,
});


// Make it use async/await
const db = pool.promise();

// Test connection
db.query('SELECT 1')
  .then(() => console.log('✅ MySQL connected successfully!'))
  .catch(err => console.error('❌ MySQL connection failed:', err.message));

module.exports = db;