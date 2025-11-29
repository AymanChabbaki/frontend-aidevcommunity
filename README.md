# AI Dev Community Platform

A comprehensive community management platform for AI developers, featuring event management, dynamic forms, polls, and user engagement tools.

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**: Secure JWT-based auth with role-based access control (User, Staff, Admin)
- **Event Management**: Create, manage, and attend events with QR code-based check-in system
- **Dynamic Forms**: Build custom forms for surveys, applications, and feedback collection
- **Polling System**: Create and vote on community polls
- **User Profiles**: Customizable profiles with skills, social links, and bio
- **Notifications**: Real-time in-app notifications for important updates
- **Multilingual Support**: English, French, and Arabic language support
- **Admin Dashboard**: Comprehensive admin panel for user and content management

### Technical Features
- Responsive design with Tailwind CSS
- Dark mode support
- Real-time data with React Query
- File upload support
- CSV export functionality
- QR code generation and scanning
- PDF badge generation
- Audit logging

## 📋 Prerequisites

- **Node.js** 18+ 
- **MySQL** 8.0+
- **npm** or **yarn**

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd aidevcommunity
```

### 2. Set Up Backend

```bash
cd backend
npm install
```

Create `.env` file in the backend directory:
```env
DATABASE_URL="mysql://root:password@localhost:3306/aidevclub"
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
PORT=5000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Initialize the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
```

Start the backend:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### 3. Set Up Frontend

Open a new terminal:
```bash
cd .. # Back to root directory
npm install
```

Create `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Frontend will run on http://localhost:5173

## 👥 Default User Accounts

After seeding the database, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aidevclub.com | admin123 |
| Staff | staff@aidevclub.com | staff123 |
| User | john@example.com | user123 |

## 📁 Project Structure

```
aidevcommunity/
├── backend/                 # Node.js backend
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/        # API routes
│   │   └── server.ts      # Express app
│   └── uploads/           # Uploaded files
│
├── src/                    # React frontend
│   ├── components/        # React components
│   ├── context/          # React context providers
│   ├── pages/            # Page components
│   ├── services/         # API service layer
│   └── lib/              # Utilities
│
└── public/               # Static assets
```

## 🎨 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **React Router** - Routing
- **React Query** - Data fetching
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Framer Motion** - Animations
- **Axios** - HTTP client

### Backend
- **Node.js** with TypeScript
- **Express** - Web framework
- **Prisma** - ORM
- **MySQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **QRCode** - QR generation

## 🚀 Deployment

### Backend
Recommended platforms: Railway, Render, DigitalOcean

### Frontend  
Recommended platforms: Vercel, Netlify, Cloudflare Pages

## 📄 License

MIT License

---

Built with ❤️ by AI Dev Community
