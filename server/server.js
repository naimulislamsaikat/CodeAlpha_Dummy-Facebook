import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = 'facebook-secret-key-12345';
const PORT = process.env.PORT || 5000;

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`);
  }
});
const upload = multer({ storage });

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const activeSockets = new Map();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token invalid or expired' });
    req.user = decoded;
    next();
  });
};

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existingUser = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const user = db.insert('users', {
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    isVerified: false,
    verificationCode,
    bio: 'Hey there! I am using this social app.',
    avatar: '',
    coverPhoto: '',
    followersCount: 0,
    followingCount: 0
  });

  console.log(`\n==============================================\n[VERIFICATION CODE] Email: ${email} -> CODE: ${verificationCode}\n==============================================\n`);

  res.status(201).json({
    message: 'Registration successful! Verification code sent.',
    email: user.email
  });
});

app.post('/api/auth/verify', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required' });
  }

  const user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.verificationCode !== code) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  db.update('users', u => u.id === user.id, { isVerified: true, verificationCode: null });
  res.json({ message: 'Email verified successfully!' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  if (!user.isVerified) {
    return res.status(401).json({ error: 'Account not verified yet', isNotVerified: true, email: user.email });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      coverPhoto: user.coverPhoto,
      bio: user.bio
    }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.findOne('users', u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    coverPhoto: user.coverPhoto,
    bio: user.bio
  });
});

app.get('/api/users/profile/:userId', authenticateToken, (req, res) => {
  const targetId = req.params.userId;
  const user = db.findOne('users', u => u.id === targetId);
  if (!user) return res.status(404).json({ error: 'Profile not found' });

  const isFollowing = db.findOne('followers', f => f.followerId === req.user.id && f.followedId === targetId) !== null;

  const followersCount = db.find('followers', f => f.followedId === targetId).length;
  const followingCount = db.find('followers', f => f.followerId === targetId).length;
  const postsCount = db.find('posts', p => p.userId === targetId && !p.isPagePost).length;

  res.json({
    id: user.id,
    name: user.name,
    bio: user.bio,
    avatar: user.avatar,
    coverPhoto: user.coverPhoto,
    joinedDate: user.createdAt,
    followersCount,
    followingCount,
    postsCount,
    isFollowing
  });
});

app.put('/api/users/profile', authenticateToken, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 }
]), (req, res) => {
  const { name, bio } = req.body;
  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (bio !== undefined) updateData.bio = bio;

  if (req.files) {
    if (req.files.avatar) {
      updateData.avatar = `/uploads/${req.files.avatar[0].filename}`;
    }
    if (req.files.coverPhoto) {
      updateData.coverPhoto = `/uploads/${req.files.coverPhoto[0].filename}`;
    }
  }

  db.update('users', u => u.id === req.user.id, updateData);
  const updatedUser = db.findOne('users', u => u.id === req.user.id);

  res.json({
    message: 'Profile updated successfully',
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      coverPhoto: updatedUser.coverPhoto,
      bio: updatedUser.bio
    }
  });
});

app.post('/api/users/follow/:userId', authenticateToken, (req, res) => {
  const targetId = req.params.userId;
  if (targetId === req.user.id) {
    return res.status(400).json({ error: 'You cannot follow yourself' });
  }

  const existingFollow = db.findOne('followers', f => f.followerId === req.user.id && f.followedId === targetId);

  if (existingFollow) {
    db.delete('followers', f => f.id === existingFollow.id);
    return res.json({ following: false, message: 'Unfollowed user' });
  } else {
    db.insert('followers', {
      followerId: req.user.id,
      followedId: targetId
    });
    return res.json({ following: true, message: 'Followed user' });
  }
});

app.post('/api/posts', authenticateToken, upload.single('media'), (req, res) => {
  const { content, type, isPagePost, pageId } = req.body;
  
  let mediaUrl = '';
  let mediaType = '';

  if (req.file) {
    mediaUrl = `/uploads/${req.file.filename}`;
    mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
  }

  let authorName = req.user.name;
  let authorAvatar = '';
  const currentUser = db.findOne('users', u => u.id === req.user.id);
  if (currentUser) {
    authorAvatar = currentUser.avatar;
  }

  if (isPagePost === 'true' && pageId) {
    const page = db.findOne('pages', p => p.id === pageId);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    if (page.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to post on this page' });
    }
    authorName = page.name;
    authorAvatar = page.avatar;
  }

  const post = db.insert('posts', {
    userId: req.user.id,
    authorName,
    authorAvatar,
    content: content || '',
    mediaUrl,
    mediaType,
    type: type || 'post',
    isPagePost: isPagePost === 'true',
    pageId: isPagePost === 'true' ? pageId : null,
    likes: [],
    sharesCount: 0,
    originalPostId: null
  });

  res.status(201).json(post);
});

app.get('/api/posts/feed', authenticateToken, (req, res) => {
  const posts = db.find('posts', p => p.type !== 'reel');
  const enrichedPosts = posts.map(post => {
    let originalPost = null;
    if (post.originalPostId) {
      originalPost = db.findOne('posts', p => p.id === post.originalPostId);
    }
    const commentsCount = db.find('comments', c => c.postId === post.id).length;
    return {
      ...post,
      commentsCount,
      liked: post.likes ? post.likes.includes(req.user.id) : false,
      likesCount: post.likes ? post.likes.length : 0,
      originalPost
    };
  });
  enrichedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(enrichedPosts);
});

app.get('/api/reels', authenticateToken, (req, res) => {
  const reels = db.find('posts', p => p.type === 'reel');
  const enrichedReels = reels.map(reel => {
    const commentsCount = db.find('comments', c => c.postId === reel.id).length;
    return {
      ...reel,
      commentsCount,
      liked: reel.likes ? reel.likes.includes(req.user.id) : false,
      likesCount: reel.likes ? reel.likes.length : 0
    };
  });
  enrichedReels.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(enrichedReels);
});

app.post('/api/posts/like/:postId', authenticateToken, (req, res) => {
  const postId = req.params.postId;
  const post = db.findOne('posts', p => p.id === postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const likes = post.likes || [];
  const index = likes.indexOf(req.user.id);
  let liked = false;

  if (index > -1) {
    likes.splice(index, 1);
  } else {
    likes.push(req.user.id);
    liked = true;
  }

  db.update('posts', p => p.id === postId, { likes });
  res.json({ liked, likesCount: likes.length });
});

app.delete('/api/posts/:postId', authenticateToken, (req, res) => {
  const postId = req.params.postId;
  const post = db.findOne('posts', p => p.id === postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized to delete this post' });

  // Also delete comments on this post
  db.delete('comments', c => c.postId === postId);
  db.delete('posts', p => p.id === postId);

  res.json({ message: 'Post deleted successfully' });
});

app.post('/api/posts/share/:postId', authenticateToken, (req, res) => {
  const postId = req.params.postId;
  const originalPost = db.findOne('posts', p => p.id === postId);
  if (!originalPost) return res.status(404).json({ error: 'Post not found' });

  const newSharesCount = (originalPost.sharesCount || 0) + 1;
  db.update('posts', p => p.id === postId, { sharesCount: newSharesCount });

  const currentUser = db.findOne('users', u => u.id === req.user.id);

  const sharedPost = db.insert('posts', {
    userId: req.user.id,
    authorName: currentUser.name,
    authorAvatar: currentUser.avatar,
    content: `shared a post`,
    mediaUrl: '',
    mediaType: '',
    type: 'post',
    isPagePost: false,
    pageId: null,
    likes: [],
    sharesCount: 0,
    originalPostId: originalPost.id
  });

  res.status(201).json({ message: 'Post shared successfully', sharedPost });
});

app.get('/api/posts/comments/:postId', authenticateToken, (req, res) => {
  const postId = req.params.postId;
  const comments = db.find('comments', c => c.postId === postId);
  comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  res.json(comments);
});

app.post('/api/posts/comment/:postId', authenticateToken, (req, res) => {
  const postId = req.params.postId;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Comment content is required' });

  const currentUser = db.findOne('users', u => u.id === req.user.id);

  const comment = db.insert('comments', {
    postId,
    userId: req.user.id,
    userName: currentUser.name,
    userAvatar: currentUser.avatar,
    content
  });

  res.status(201).json(comment);
});

app.post('/api/pages', authenticateToken, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 }
]), (req, res) => {
  const { name, category, description } = req.body;
  if (!name || !category) {
    return res.status(400).json({ error: 'Page name and category are required' });
  }

  let avatar = '';
  let coverPhoto = '';

  if (req.files) {
    if (req.files.avatar) {
      avatar = `/uploads/${req.files.avatar[0].filename}`;
    }
    if (req.files.coverPhoto) {
      coverPhoto = `/uploads/${req.files.coverPhoto[0].filename}`;
    }
  }

  const page = db.insert('pages', {
    ownerId: req.user.id,
    name,
    category,
    description: description || '',
    avatar,
    coverPhoto,
    subscribersCount: 0
  });

  res.status(201).json(page);
});

app.get('/api/pages', authenticateToken, (req, res) => {
  const pages = db.find('pages');
  const enrichedPages = pages.map(page => {
    const isSubscribed = db.findOne('subscriptions', s => s.userId === req.user.id && s.pageId === page.id) !== null;
    const subscribersCount = db.find('subscriptions', s => s.pageId === page.id).length;
    return {
      ...page,
      isSubscribed,
      subscribersCount
    };
  });
  res.json(enrichedPages);
});

app.get('/api/pages/:pageId', authenticateToken, (req, res) => {
  const pageId = req.params.pageId;
  const page = db.findOne('pages', p => p.id === pageId);
  if (!page) return res.status(404).json({ error: 'Commercial Page not found' });

  const isSubscribed = db.findOne('subscriptions', s => s.userId === req.user.id && s.pageId === pageId) !== null;
  const subscribersCount = db.find('subscriptions', s => s.pageId === pageId).length;

  const posts = db.find('posts', p => p.pageId === pageId && p.isPagePost);
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    ...page,
    isSubscribed,
    subscribersCount,
    posts
  });
});

app.post('/api/pages/subscribe/:pageId', authenticateToken, (req, res) => {
  const pageId = req.params.pageId;
  const page = db.findOne('pages', p => p.id === pageId);
  if (!page) return res.status(404).json({ error: 'Page not found' });

  const existingSub = db.findOne('subscriptions', s => s.userId === req.user.id && s.pageId === pageId);

  if (existingSub) {
    db.delete('subscriptions', s => s.id === existingSub.id);
    return res.json({ subscribed: false, message: 'Unsubscribed from page' });
  } else {
    db.insert('subscriptions', {
      userId: req.user.id,
      pageId
    });
    return res.json({ subscribed: true, message: 'Subscribed to page' });
  }
});

app.get('/api/messages/conversations', authenticateToken, (req, res) => {
  const currentUserId = req.user.id;
  const messages = db.find('messages', m => m.senderId === currentUserId || m.receiverId === currentUserId);
  
  const contactIds = new Set();
  messages.forEach(m => {
    if (m.senderId !== currentUserId) contactIds.add(m.senderId);
    if (m.receiverId !== currentUserId) contactIds.add(m.receiverId);
  });

  const allUsers = db.find('users', u => u.id !== currentUserId && u.isVerified);
  
  const conversations = [];

  contactIds.forEach(contactId => {
    const contact = db.findOne('users', u => u.id === contactId);
    if (contact) {
      const chatHistory = messages.filter(m => 
        (m.senderId === currentUserId && m.receiverId === contactId) ||
        (m.senderId === contactId && m.receiverId === currentUserId)
      );
      chatHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const lastMessage = chatHistory[0];

      conversations.push({
        contact: {
          id: contact.id,
          name: contact.name,
          avatar: contact.avatar,
          bio: contact.bio
        },
        lastMessage: lastMessage ? lastMessage.content : '',
        lastMessageTime: lastMessage ? lastMessage.createdAt : contact.createdAt,
        unreadCount: chatHistory.filter(m => m.receiverId === currentUserId && !m.isRead).length
      });
    }
  });

  allUsers.forEach(user => {
    if (!contactIds.has(user.id)) {
      conversations.push({
        contact: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          bio: user.bio
        },
        lastMessage: 'Start a conversation',
        lastMessageTime: user.createdAt,
        unreadCount: 0
      });
    }
  });

  conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
  res.json(conversations);
});

app.get('/api/messages/history/:userId', authenticateToken, (req, res) => {
  const currentUserId = req.user.id;
  const targetUserId = req.params.userId;

  const messages = db.find('messages', m => 
    (m.senderId === currentUserId && m.receiverId === targetUserId) ||
    (m.senderId === targetUserId && m.receiverId === currentUserId)
  );

  db.update('messages', m => m.receiverId === currentUserId && m.senderId === targetUserId && !m.isRead, { isRead: true });

  messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  res.json(messages);
});

wss.on('connection', (ws, req) => {
  let authenticatedUserId = null;

  ws.on('message', (messageStr) => {
    try {
      const data = JSON.parse(messageStr);
      
      if (data.type === 'auth') {
        const token = data.token;
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
          if (err) {
            ws.send(JSON.stringify({ type: 'error', message: 'Auth failed' }));
            ws.close();
            return;
          }
          authenticatedUserId = decoded.id;
          activeSockets.set(authenticatedUserId, ws);
          console.log(`User ${decoded.name} (${authenticatedUserId}) connected to WebSockets.`);
          
          broadcastPresence(authenticatedUserId, true);
        });
      }

      if (data.type === 'chat-message') {
        if (!authenticatedUserId) return;
        const { receiverId, content } = data;

        const chatMsg = db.insert('messages', {
          senderId: authenticatedUserId,
          receiverId,
          content,
          isRead: false
        });

        const receiverSocket = activeSockets.get(receiverId);
        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          receiverSocket.send(JSON.stringify({
            type: 'chat-message',
            message: chatMsg
          }));
        }

        ws.send(JSON.stringify({
          type: 'chat-message-sent',
          message: chatMsg
        }));
      }

      if (['call-user', 'call-accepted', 'call-rejected', 'call-hungup', 'ice-candidate'].includes(data.type)) {
        if (!authenticatedUserId) return;
        const { targetId } = data;
        const targetSocket = activeSockets.get(targetId);

        if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
          targetSocket.send(JSON.stringify({
            ...data,
            fromId: authenticatedUserId
          }));
        } else if (data.type === 'call-user') {
          ws.send(JSON.stringify({
            type: 'call-failed',
            targetId,
            reason: 'User is offline'
          }));
        }
      }

    } catch (e) {
      console.error('Error handling WebSocket message:', e);
    }
  });

  ws.on('close', () => {
    if (authenticatedUserId) {
      activeSockets.delete(authenticatedUserId);
      console.log(`User ${authenticatedUserId} disconnected from WebSockets.`);
      broadcastPresence(authenticatedUserId, false);
    }
  });
});

function broadcastPresence(userId, isOnline) {
  const payload = JSON.stringify({ type: 'presence', userId, isOnline });
  activeSockets.forEach((clientSocket) => {
    if (clientSocket.readyState === WebSocket.OPEN) {
      clientSocket.send(payload);
    }
  });
}

server.listen(PORT, () => {
  console.log(`\n==============================================`);
  console.log(`Dummy Facebook Backend running on http://localhost:${PORT}`);
  console.log(`WebSocket Server listening on port ${PORT}`);
  console.log(`==============================================\n`);
});

// Global error handler - ensures the server always responds with valid JSON
// even when an unexpected error occurs in route handlers.
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    next(err);
  }
});
