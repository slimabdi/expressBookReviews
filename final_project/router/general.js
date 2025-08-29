const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!isValid(username)) {
      // Add the new user to the users array
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  new Promise((resolve, reject) => {
    resolve(books);
  }).then((bookList) => {
        res.status(200).json(bookList);
  })
      .catch((error) => {
        res.status(401).json({ message: "Error retrieving book list." });
      });
});

public_users.get('/', async (req, res) => {
  try {
    // Simulate fetching book data asynchronously using a Promise (or Axios if from a remote server)
    const booksList = await new Promise((resolve, reject) => {
      resolve(books);  // Normally, you'd fetch this data from an API.
    });

    res.status(200).json(booksList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books list", error });
  }
});

//Search by ISBN – Using Promises
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

  try {
    // Simulate fetching book details asynchronously using a Promise (or Axios if from a remote server)
    const bookDetails = await new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject("Book not found");
      }
    });

    res.status(200).json(bookDetails);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found.");
    }
  })
      .then((book) => {
        res.status(200).json(book);
      })
      .catch((error) => {
        res.status(404).json({ message: error });
      });
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  const author = req.params.author;

  try {
    const booksByAuthor = await new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(book => book.author === author);
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject("No books found by this author");
      }
    });

    res.status(200).json(booksByAuthor);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title.toLowerCase();
  new Promise((resolve, reject) => {
    const bookKeys = Object.keys(books);
    const booksWithTitle = bookKeys
        .map(key => books[key])
        .filter(book => book.title.toLowerCase() === title);
    if (booksWithTitle.length > 0) {
      resolve(booksWithTitle);
    } else {
      reject("Books with this title not found.");
    }
  })
      .then((books) => {
        res.status(200).json(books);
      })
      .catch((error) => {
        res.status(404).json({ message: error });
      });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }
  if (!book.reviews) {
    return res.status(404).json({ message: "Reviews not found for this book." });
  }
  return res.status(200).json({ reviews: book.reviews });
});

module.exports.general = public_users;
