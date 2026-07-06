import bcrypt from 'bcryptjs';
import db from './database.js';

// Hash passwords using bcryptjs (rounds=10)
const passwordHash = bcrypt.hashSync('password123', 10);

console.log('Initializing mock database records...');

// 1. Clear database cache/files to avoid duplicates
db.delete('users', () => true);
db.delete('posts', () => true);
db.delete('followers', () => true);
db.delete('pages', () => true);
db.delete('comments', () => true);
db.delete('messages', () => true);
db.delete('subscriptions', () => true);

// 2. Insert Users
const alice = db.insert('users', {
  id: 'u1',
  name: 'Alice Vance',
  email: 'alice@social.com',
  password: passwordHash,
  isVerified: true,
  verificationCode: null,
  bio: 'Visual designer, photographer, and open-source enthusiast. ✨',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  coverPhoto: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=300&fit=crop'
});

const bob = db.insert('users', {
  id: 'u2',
  name: 'Bob Miller',
  email: 'bob@social.com',
  password: passwordHash,
  isVerified: true,
  verificationCode: null,
  bio: 'Software engineer who loves building lightweight interactive web prototypes.',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  coverPhoto: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=300&fit=crop'
});

const sophia = db.insert('users', {
  id: 'u3',
  name: 'Sophia Green',
  email: 'sophia@social.com',
  password: passwordHash,
  isVerified: true,
  verificationCode: null,
  bio: 'Travel blogger & short-form video creator. Exploring the world one step at a time! 🗺️',
  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
  coverPhoto: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=300&fit=crop'
});

// 3. Insert Follows
db.insert('followers', { followerId: 'u1', followedId: 'u2' });
db.insert('followers', { followerId: 'u2', followedId: 'u1' });
db.insert('followers', { followerId: 'u3', followedId: 'u1' });

// 4. Insert Commercial Pages
const page1 = db.insert('pages', {
  id: 'p1',
  ownerId: 'u1',
  name: 'Vertex Design Agency',
  category: 'Creator/Blogger',
  description: 'Premium UI/UX layout inspirations, interactive wireframes, and design system templates.\nSubscribe for high-fidelity assets!',
  avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&h=150&fit=crop',
  coverPhoto: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?w=800&h=300&fit=crop'
});

const page2 = db.insert('pages', {
  id: 'p2',
  ownerId: 'u2',
  name: 'Alpha Sports Tech',
  category: 'Business/Company',
  description: 'Bringing you cutting-edge telemetry, stats tracking systems, and high performance wear reviews.',
  avatar: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=150&h=150&fit=crop',
  coverPhoto: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=300&fit=crop'
});

// 5. Insert Subscriptions
db.insert('subscriptions', { userId: 'u2', pageId: 'p1' });
db.insert('subscriptions', { userId: 'u3', pageId: 'p1' });

// 6. Insert Posts
const post1 = db.insert('posts', {
  id: 'post_1',
  userId: 'u1',
  authorName: 'Alice Vance',
  authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  content: 'Captured this beautiful scenic sunset from my balcony this evening! Nature never ceases to amaze me. 🌅✈️',
  mediaUrl: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&h=500&fit=crop',
  mediaType: 'image',
  type: 'post',
  isPagePost: false,
  pageId: null,
  likes: ['u2', 'u3'],
  sharesCount: 1
});

const post2 = db.insert('posts', {
  id: 'post_2',
  userId: 'u2',
  authorName: 'Bob Miller',
  authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  content: 'Just deployed the backend framework. Everything is operating on milliseconds speed. Let me know what you think!',
  mediaUrl: '',
  mediaType: '',
  type: 'post',
  isPagePost: false,
  pageId: null,
  likes: ['u1'],
  sharesCount: 0
});

// Reel Post
db.insert('posts', {
  id: 'reel_1',
  userId: 'u3',
  authorName: 'Sophia Green',
  authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
  content: 'Beautiful forest wildlife compilation! Check out this CGI animal loop! 🌲🦌',
  mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  mediaType: 'video',
  type: 'reel',
  isPagePost: false,
  pageId: null,
  likes: ['u1', 'u2'],
  sharesCount: 0
});

// Page Post
db.insert('posts', {
  id: 'post_3',
  userId: 'u1', // Alice is owner
  authorName: 'Vertex Design Agency',
  authorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&h=150&fit=crop',
  content: 'Check out our brand new gradient palette layout! Pure glassmorphism details. 🎨✨',
  mediaUrl: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?w=800&h=500&fit=crop',
  mediaType: 'image',
  type: 'post',
  isPagePost: true,
  pageId: 'p1',
  likes: ['u2', 'u3'],
  sharesCount: 0
});

// Share Post
db.insert('posts', {
  id: 'share_1',
  userId: 'u3',
  authorName: 'Sophia Green',
  authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
  content: 'shared a post',
  mediaUrl: '',
  mediaType: '',
  type: 'post',
  isPagePost: false,
  pageId: null,
  likes: [],
  sharesCount: 0,
  originalPostId: 'post_1'
});

// 7. Insert Comments
db.insert('comments', {
  postId: 'post_1',
  userId: 'u2',
  userName: 'Bob Miller',
  userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  content: 'This lighting is absolutely gorgeous, Alice!'
});

db.insert('comments', {
  postId: 'post_1',
  userId: 'u3',
  userName: 'Sophia Green',
  userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
  content: 'Stunning sunset shot. Which camera gear was this?'
});

// 8. Insert Messages
db.insert('messages', {
  senderId: 'u1',
  receiverId: 'u2',
  content: 'Hi Bob, did you look over the telemetry designs?',
  isRead: true,
  createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
});

db.insert('messages', {
  senderId: 'u2',
  receiverId: 'u1',
  content: 'Hey Alice, yes, I love the glass panels. I will spin up the server code right away.',
  isRead: true,
  createdAt: new Date(Date.now() - 3600000).toISOString()
});

console.log('Mock database records initialized successfully!');
process.exit(0);
