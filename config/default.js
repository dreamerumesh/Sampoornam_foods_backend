module.exports = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myDatabase",
    
    // JWT Config
    JWT_SECRET: process.env.JWT_SECRET || 'c1a4f8b6e7d9c3a2f4b5d6e1c9a8b7d2f3e4c5d6a7b8c9e1f2d3a4b5c6d7e8f9',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',

    // Email SMTP Config (for sending OTPs)
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail', // Change if using another provider
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: process.env.EMAIL_PORT || 587, // 465 for SSL, 587 for TLS
    EMAIL_USER: process.env.EMAIL_USER || 'user@gmail.com',
    EMAIL_PASS: process.env.EMAIL_PASS || 'userpassword',
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@sampoornamfoods.com',

    // Admin Email
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@sampoornamfoods.com',

    // OTP Expiry
    OTP_EXPIRE: process.env.OTP_EXPIRE || 10, // in minutes

    // Client URL for verification
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

    // Cloudinary Config
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
};
