const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const jwtSecret = '244d0b97c61cb978567e348a15fc8cd5c3c5791af982ccae88db48383bc3c273';

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  let usersWithSameName = users.filter((user) => {
    return user.username === username;
  });
  return usersWithSameName.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.

  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
      data: password
    }, jwtSecret, { expiresIn: 60 * 60 });
    // Store access token and username in session
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(300).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const { review } = req.body;
  let filtered_books = books[isbn];

  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, jwtSecret);
  const username = decoded.username;

  if (filtered_books) {
    if (!filtered_books.reviews) {
      filtered_books.reviews = {};
    }
    filtered_books.reviews[username] = review;
    res.status(200).json({ message: "Review added/updated successfully" });
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let username = req.session.authorization.username;
  let filtered_books = books[isbn];
  if (!filtered_books) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (filtered_books.reviews && books[isbn].reviews[username]) {
    delete filtered_books.reviews[username];
    return res.status(200).json({
      message: "Review deleted successfully",
      reviews: filtered_books.reviews,
    });
  } else {
    return res.status(404).json({ message: "No review found for this user" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
