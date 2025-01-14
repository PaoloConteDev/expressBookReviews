const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Authentication middleware for routes under /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if there is a session with the JWT token
    const token = req.session.token || req.headers['authorization']?.split(' ')[1]; // Token from session or Authorization header

    if (!token) {
        // No token found, return 401 Unauthorized
        return res.status(401).json({ message: 'Access Denied: No token provided' });
    }

    // Verify the JWT token
    jwt.verify(token, "your_secret_key", (err, decoded) => {
        if (err) {
            // Token is invalid, return 401 Unauthorized
            return res.status(401).json({ message: 'Access Denied: Invalid token' });
        }

        // Token is valid, store decoded info in request and proceed to the next middleware
        req.user = decoded;
        next();
    });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
