const express = require('express');
const session = require('express-session');
const multer = require('multer');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/intranet', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const departmentSchema = new mongoose.Schema({
  name: String,
});
const Department = mongoose.model('Department', departmentSchema);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
});
const User = mongoose.model('User', userSchema);

const upload = multer({ dest: 'uploads/' });

const app = express();

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.json());

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password }).populate('department');
  if (user) {
    req.session.userId = user._id;
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.json({ success: false, message: 'Invalid username or password' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logout successful' });
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.session.userId) {
    res.json({ success: false, message: 'User not logged in' });
    return;
  }

  const file = req.file;
  res.json({ success: true, message: 'File uploaded successfully', file });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
