const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
});

// Get the list of books available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).json({ books: books });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const { isbn } = req.params;
    const book = books[isbn];
    if (book) {
        return res.status(200).json({ book });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const { author } = req.params;
    const filteredBooks = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
    if (filteredBooks.length > 0) {
        return res.status(200).json({ books: filteredBooks });
    } else {
        return res.status(404).json({ message: "No books found for this author" });
    }
});

// Get book details based on title
public_users.get('/title/:title', function (req, res) {
    const { title } = req.params;
    const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
    if (filteredBooks.length > 0) {
        return res.status(200).json({ books: filteredBooks });
    } else {
        return res.status(404).json({ message: "No books found for this title" });
    }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const { isbn } = req.params;
    const book = books[isbn];
    if (book) {
        return res.status(200).json({ reviews: book.reviews });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
