# Dummy Facebook - Full-Stack Social Media Application

A comprehensive full-stack social media platform built with modern web technologies, featuring real-time messaging, user authentication, and interactive content management.

## 📋 Project Overview

**Dummy Facebook** is a feature-rich social networking application that replicates core Facebook functionality. It provides a complete ecosystem for user interaction including feed management, messaging, video streaming, and social networking capabilities.

- **Status**: Active Development
- **Version**: 1.0.0
- **Tech Stack**: React 19 (Frontend), Express.js (Backend), WebSocket (Real-time Communication)
- **Language Composition**: JavaScript (90.7%), CSS (9%), HTML (0.3%)

---

## 🏗️ Project Architecture

### Directory Structure

```
CodeAlpha_Dummy-Facebook/
├── src/                          # Frontend React Application
│   ├── components/               # Reusable React Components
│   ├── context/                  # Context API for State Management
│   ├── assets/                   # Static Assets (Images, SVGs)
│   ├── App.jsx                   # Root Application Component
│   ├── App.css                   # Global Application Styles
│   ├── main.jsx                  # React DOM Entry Point
│   └── index.css                 # Global Styling
├── server/                       # Express.js Backend Server
│   ├── data/                     # Mock JSON Data Storage
│   ├── uploads/                  # User-uploaded Files
│   ├── server.js                 # Main Server Configuration
│   ├── database.js               # Database Operations
│   └── init_mock_data.js         # Mock Data Initialization
├── public/                       # Static Public Assets
├── index.html                    # HTML Entry Point
├── vite.config.js                # Vite Build Configuration
├── package.json                  # Frontend Dependencies
└── README.md                     # Project Documentation
```

---

## 📁 Detailed Folder Analysis

### 1. **Frontend Layer** (`src/`)

#### Overview
The frontend is a React-based single-page application (SPA) built with Vite for optimized development and production builds. It uses Context API for state management and implements modern UI/UX patterns.

#### **Components** (`src/components/`)

| Component | Purpose | Features |
|-----------|---------|----------|
| **Navbar.jsx** | Navigation bar | User menu, logo, search functionality, notifications |
| **Sidebar.jsx** | Navigation sidebar | Menu items, shortcuts, user quick links |
| **Feed.jsx** | Main content feed | Post display, feed filtering, real-time updates |
| **PostCard.jsx** | Individual post display | Post content, media, likes, comments, shares |
| **CommentSection.jsx** | Comment management | Comment display, input, nested replies |
| **ProfileView.jsx** | User profile page | User info, profile picture, bio, followers count |
| **MessagesView.jsx** | Direct messaging | Conversation list, chat interface, real-time messaging |
| **CallModal.jsx** | Video/audio calling | Call interface, media streams, call controls |
| **PagesView.jsx** | Facebook pages section | Page list, subscriptions, page content |
| **ReelsView.jsx** | Short video content | Video player, trending reels, recommendations |
| **WatchView.jsx** | Video watching | Watch list, video recommendations, playback |

**Key Features**:
- Modular component architecture
- Reusable UI patterns
- Real-time data synchronization
- Responsive design implementation

#### **Context API** (`src/context/`)

| Context | Responsibility | Data Managed |
|---------|-----------------|--------------|
| **AppContext.jsx** | Global application state | Posts, users, feeds, notifications |
| **AuthContext.jsx** | Authentication state | User login, token management, permissions |

**Functions**:
- Centralized state management
- User authentication flow
- Session persistence
- Token validation

#### **Assets** (`src/assets/`)

- `hero.png` - Hero/banner image
- `react.svg` - React logo
- `vite.svg` - Vite logo

#### **Styling Files**

- **App.css** (2.8 KB) - Application-level styles, component theming
- **index.css** (15.4 KB) - Global styles, typography, layout utilities

---

### 2. **Backend Layer** (`server/`)

#### Overview
Express.js server providing REST API and WebSocket support for real-time features. Uses in-memory JSON storage with mock data initialization.

#### **Core Server Files**

| File | Purpose | Key Responsibilities |
|------|---------|----------------------|
| **server.js** (20.7 KB) | Main server | Route handlers, API endpoints, WebSocket setup |
| **database.js** (3.0 KB) | Data operations | CRUD operations, data persistence, file I/O |
| **init_mock_data.js** (6.7 KB) | Data seeding | Mock data generation, initialization |

#### **Data Models** (`server/data/`)

| Data File | Contains | Purpose |
|-----------|----------|---------|
| **users.json** | User profiles | User accounts, credentials, profile info |
| **posts.json** | Feed posts | User-created content, timestamps, metadata |
| **comments.json** | Post comments | Comment data, threaded replies |
| **messages.json** | Direct messages | Chat conversations, message history |
| **followers.json** | Social connections | User relationships, follow data |
| **pages.json** | Facebook pages | Page profiles, subscriptions |
| **subscriptions.json** | Page subscriptions | User page subscriptions |

#### **Uploads Directory** (`server/uploads/`)
- Stores user-uploaded media files
- Profile pictures, post images, video thumbnails

---

### 3. **Configuration & Build** (Root Level)

#### **Build Configuration**

**vite.config.js** - Vite development and production settings:
```javascript
- React plugin integration
- API proxy configuration (/api → localhost:5000)
- Upload proxy configuration (/uploads → localhost:5000)
- WebSocket support
- Hot Module Replacement (HMR)
```

#### **Dependencies Management**

**package.json (Frontend)**:
- React 19.2.7 - UI library
- React DOM 19.2.7 - DOM rendering
- Lucide React 1.23.0 - Icon library
- Vite 8.1.1 - Build tool
- Oxlint 1.71.0 - Code linting

**server/package.json (Backend)**:
- Express 4.21.2 - Web framework
- JWT 9.0.2 - Authentication tokens
- bcryptjs 2.4.3 - Password hashing
- Multer 1.4.5 - File uploads
- CORS 2.8.5 - Cross-origin requests
- WebSocket 8.18.0 - Real-time communication

#### **Public Assets** (`public/`)

- `favicon.svg` - Browser tab icon
- `icons.svg` - Icon sprite sheet

---

## 🚀 Getting Started

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Development

```bash
# Start frontend development server (Terminal 1)
npm run dev
# Runs on http://localhost:5173 with HMR enabled

# Start backend server (Terminal 2)
cd server
npm run dev
# Runs on http://localhost:5000
```

### Production Build

```bash
# Build frontend
npm run build

# Production build output goes to dist/
```

---

## 🔧 Technology Stack

### Frontend
- **Framework**: React 19 with Hooks
- **Build Tool**: Vite
- **State Management**: Context API
- **Styling**: CSS
- **Icons**: Lucide React
- **Code Quality**: Oxlint

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs password hashing
- **File Upload**: Multer
- **Real-time**: WebSocket
- **CORS**: Enabled for cross-origin requests

### Data
- **Storage**: In-memory JSON (Mock)
- **Format**: JSON files
- **Persistence**: File-based system

---

## 📊 Key Features

### Core Functionality

#### 1. **User Management**
- User registration and login
- Profile management (avatar, bio, information)
- Authentication with JWT tokens
- Password hashing with bcryptjs

#### 2. **Social Feed**
- Create, edit, delete posts
- Real-time feed updates
- Like and reaction system
- Post sharing functionality

#### 3. **Comments & Engagement**
- Add comments to posts
- Threaded comment system
- Comment moderation
- Real-time comment updates

#### 4. **Direct Messaging**
- One-to-one messaging
- Conversation history
- Real-time message delivery via WebSocket
- Typing indicators

#### 5. **Video Content**
- Reels (short-form video)
- Watch videos (long-form content)
- Video recommendations
- Playback controls

#### 6. **Pages & Subscriptions**
- Browse Facebook pages
- Subscribe to pages
- Page management
- Page notifications

#### 7. **Audio/Video Calls**
- Real-time call modal
- WebSocket-based calling
- Media stream handling
- Call controls

---

## 🔌 API Endpoints Structure

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Posts
- `GET /api/posts` - Fetch feed posts
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post

### Comments
- `GET /api/posts/:id/comments` - Get post comments
- `POST /api/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### Messages
- `GET /api/messages/:userId` - Get conversation
- `POST /api/messages` - Send message
- `WS /api/messages` - WebSocket connection for real-time messaging

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile
- `GET /api/users/:id/followers` - Get followers
- `POST /api/users/:id/follow` - Follow/unfollow user

### Pages
- `GET /api/pages` - List pages
- `POST /api/users/:id/subscribe` - Subscribe to page
- `GET /api/pages/:id` - Get page details

---

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Configured for safe cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Multer with restricted file types

---

## 📈 Performance Considerations

- **Vite HMR**: Instant module replacement during development
- **Code Splitting**: Optimized bundle size
- **Lazy Loading**: Component-level code splitting
- **API Proxy**: Efficient API communication
- **WebSocket**: Low-latency real-time features

---

## 🐛 Error Handling

- Client-side error boundaries
- Server-side error middleware
- User-friendly error messages
- Console logging for debugging

---

## 📝 Development Scripts

### Frontend
```bash
npm run dev        # Start development server with HMR
npm run build      # Build for production
npm run lint       # Run oxlint
npm run preview    # Preview production build
```

### Backend
```bash
npm run start      # Start server
npm run dev        # Start in development mode
```

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

---

## 📄 License

This project is part of the CodeAlpha internship program.

---

## 🔮 Future Enhancements

- [ ] Database migration (MongoDB/PostgreSQL)
- [ ] User notifications system
- [ ] Advanced search functionality
- [ ] Trending topics/hashtags
- [ ] Image/video compression
- [ ] User blocking/reporting
- [ ] Stories feature
- [ ] Live streaming support
- [ ] Dark mode implementation
- [ ] Mobile responsiveness optimization
- [ ] Progressive Web App (PWA)
- [ ] End-to-end encryption for messages

---

## 📞 Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**Last Updated**: July 2026  
**Author**: naimulislamsaikat  
**Project**: CodeAlpha Dummy Facebook
