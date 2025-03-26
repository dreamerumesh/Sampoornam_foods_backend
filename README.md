# Sampoornam_foods_backend
E-commerce website


📦 Sampoornam Foods Backend
A small e-commerce backend with authentication, OTP-based password reset, and role-based access control for Admin and Users.



🚀 Features
🛒 User Features
✅ Sign up, log in, and log out
✅ Forgot password (OTP-based reset via email)
✅ Add products to cart & update quantity
✅ Select address & place an order
✅ View order history
✅ Cancel order (within a specific time)

👑 Admin Features
✅ Add new products
✅ Edit product details
✅ Toggle product availability (Active/Inactive)

🛠️ Tech Stack
Backend: Node.js, Express.js
Database: MongoDB (Mongoose)
Authentication: JWT, bcrypt
Email Service: Nodemailer for OTP verification
Validation: Express Validator


🔐 Authentication
POST /api/auth/register → Register a new user
POST /api/auth/login → User/Admin login
POST /api/auth/forgot-password → Send OTP to email for password reset
POST /api/auth/reset-password → Reset password using OTP

🛍️ Products (Admin Only)
POST /api/products → Add a new product
PUT /api/products/:id → Edit product details
PATCH /api/products/:id/toggle → Toggle product availability

🛒 Cart & Orders (User)
POST /api/cart → Add to cart & update quantity
GET /api/cart → View cart items
POST /api/orders → Place an order
GET /api/orders → View order history
DELETE /api/orders/:id → Cancel order (if within allowed time)


still there are many Endpoints



📌 Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/dreamerumesh/Sampoornam_foods_backend.git
cd Sampoornam_foods_backend

2️⃣ Install Dependencies
npm install

3️⃣ Setup Environment Variables
Create a .env file and add:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password

4️⃣ Run the Server
npm start


📜 License
This project is open-source. Feel free to use and improve it!







