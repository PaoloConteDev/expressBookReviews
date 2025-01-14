const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if the username is valid
const isValid = (username) => {
    // Example validation: username should be a non-empty string
    return username && username.length > 0;
};

// Function to check if the username and password match an existing user
const authenticatedUser = (username, password) => {
    return users.find(u => u.username === username && u.password === password);
};

// Register a new user
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please provide both username and password" });
    }

    // Check if username already exists
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    // Register new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});


// Only registered users can log in
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please provide both username and password" });
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Generate JWT token and save it in session
        const token = jwt.sign({ username }, "your_secret_key", { expiresIn: '1h' });
        req.session.token = token;  // Save token to session for later use

        return res.status(200).json({
            message: "Logged in successfully",
            token
        });
    } else {
        return res.status(401).json({ message: "Invalid credentials" });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { username } = req.session;  // Get username from session
    const { isbn } = req.params;
    const { review } = req.query; // Get review from query string

    if (!username) {
        return res.status(401).json({ message: "You must be logged in to add a review" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review cannot be empty" });
    }

    const book = books[isbn];
    if (book) {
        // Add or update review based on the username
        book.reviews[username] = review;
        return res.status(200).json({ message: "Review added/updated successfully" });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { username } = req.session;  // Get username from session
    const { isbn } = req.params;

    if (!username) {
        return res.status(401).json({ message: "You must be logged in to delete a review" });
    }

    const book = books[isbn];
    if (book && book.reviews[username]) {
        // Delete the review if the user is the one who posted it
        delete book.reviews[username];
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "Review not found or you are not the author of this review" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
