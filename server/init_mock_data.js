import bcrypt from 'bcryptjs';
import db from './database.js';

const passwordHash = bcrypt.hashSync('password123', 10);

console.log('Initializing mock database records...');

// Clear existing data so the seed stays consistent.
db.delete('users', () => true);
db.delete('posts', () => true);
db.delete('followers', () => true);
db.delete('pages', () => true);
db.delete('comments', () => true);
db.delete('messages', () => true);
db.delete('subscriptions', () => true);

// Insert the remaining seeded user.
db.insert('users', {
  id: 'nq91tcxc8',
  name: 'Naimul Islam',
  email: 'naimulislam.dev@gmail.com',
  password: passwordHash,
  isVerified: true,
  verificationCode: null,
  bio: 'Hey there! I am using this social app.',
  avatar: '/uploads/1783359186468-nwadqk6.jpeg',
  coverPhoto: ''
});

// Seed a small starter post for the remaining user.
db.insert('posts', {
  id: 'd0590qx5x',
  userId: 'nq91tcxc8',
  authorName: 'Naimul Islam',
  authorAvatar: '/uploads/1783359186468-nwadqk6.jpeg',
  content: 'Hello everyone! I am setting up my profile and sharing a first update.',
  mediaUrl: '',
  mediaType: '',
  type: 'post',
  isPagePost: false,
  pageId: null,
  likes: [],
  sharesCount: 0,
  originalPostId: null
});

console.log('Mock database records initialized successfully!');
process.exit(0);
