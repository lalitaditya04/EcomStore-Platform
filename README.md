# 🛍️ EcomStore - E-commerce Platform

A modern, full-stack e-commerce platform built with React.js and Node.js, featuring seller profiles, product management, and a beautiful user interface.

## ✨ Features

- **User Authentication** - JWT-based login/register system
- **Seller Profiles** - Multi-step seller onboarding with document upload
- **Product Management** - Full CRUD operations for products
- **Modern UI/UX** - Responsive design with glassmorphism effects
- **Dashboard** - Seller analytics and product management
- **File Uploads** - Image handling for products

## 🚀 Tech Stack

**Frontend:** React.js, React Router, Axios, CSS3  
**Backend:** Node.js, Express.js, MongoDB, Mongoose  
**Authentication:** JWT, bcryptjs  
**File Handling:** Multer  

## 📁 Project Structure

```
ecomm-web/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   └── context/     # React context
├── server/          # Node.js backend
│   ├── models/      # Database models
│   ├── routes/      # API routes
│   └── middleware/  # Custom middleware
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB
- Git

### Quick Start
```bash
# Clone repository
git clone https://github.com/yourusername/ecomm-web.git
cd ecomm-web

# Install dependencies
npm install
npm run install-all

# Setup environment
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development servers
npm run dev
```

### Environment Variables
Create `.env` file in server directory:
```env
MONGODB_URI=mongodb://localhost:27017/ecomstore
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
```

## 🚀 Running the Application

**Development:**
```bash
npm run dev          # Starts both client and server
```

**Individual services:**
```bash
npm run client       # Frontend only (port 3000)
npm run server       # Backend only (port 5000)
```

## 📱 Usage

### For Buyers
1. Browse products on the Products page
2. View detailed product information
3. Contact sellers for purchases

### For Sellers
1. Register and complete seller profile
2. Access dashboard to manage products
3. Add products with images and details
4. Track sales and analytics

## 🎯 API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - User login

**Products:**
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (seller only)
- `GET /api/products/:id` - Get single product

**Seller Profile:**
- `GET /api/users/seller-profile` - Get seller profile
- `POST /api/users/seller-profile` - Create/Update profile

## 🔧 Development Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Glassmorphism effects and smooth animations
- **File Upload** - Image upload for products
- **Protected Routes** - Authentication required pages
- **Error Handling** - Comprehensive error management

## 📞 Contact

**Developer:** Your Name  
**Email:** your.email@example.com  
**GitHub:** [@yourusername](https://github.com/yourusername)

---

⭐ If you found this project helpful, please give it a star!