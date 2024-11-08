const path = require('path');
const express = require('express');
const app = express();

// Đăng ký route cho firebase-messaging-sw.js
app.get('/firebase-messaging-sw.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'firebase-messaging-sw.js')); // Đảm bảo đường dẫn đúng đến tệp
});

// Các route khác và cấu hình server của bạn...
