var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
const { Op } = require("sequelize");

function asyncHandler(cb){
  return async(req, res, next) => {
    try{
      await cb(req, res, next);
    }catch(error) {
      next(error);
    }
  }
}

/* GET home page. */
router.get('/', asyncHandler(async(req, res, next) => {
  /*const books = await Book.findAll();
  console.log(books);
  res.json(books);*/
  res.redirect('/books');
}));

// GET all books
router.get('/books', asyncHandler(async(req, res, next) => {
  const books = await Book.findAll();
  res.render('index', {books, title: "All books"});
}));

// GET new book page
router.get('/books/new', asyncHandler(async(req, res, next) => {
  res.render('new-book', {title: "New book"});
}));

// POST new book
router.post('/books/new', asyncHandler(async(req, res, next) => {
  try{
    await Book.create(req.body);
    res.redirect('/books');
  }catch(err){
    if(err.name === 'SequelizeValidationError'){
      const errors = err.errors.map(error => error.message);
      res.render('new-book', {title: "New book", errors});
    }else{
      throw err;
    }
  }
}));

// GET book search
router.get('/books/search/:search', asyncHandler(async(req, res, next) => {
  const books = await Book.findAll({
    where: {
      [Op.or]: [
        {title: {
          [Op.substring]: req.params.search
        }},
        {author: {
          [Op.substring]: req.params.search
        }},
        {genre: {
          [Op.substring]: req.params.search
        }},
        {year: {
          [Op.substring]: req.params.search
        }}
      ]
    }
  });
  res.render('index', {books, title: "Searching books"});
}));

// POST book search
router.post('/books/search', asyncHandler(async(req, res, next) => {
  res.redirect('/books/search/' + req.body.search);
}));

// GET book update page
router.get('/books/:id', asyncHandler(async(req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if(!book){
    next();
  }else{
    res.render('update-book', {book, title: book.title});
  }
}));

// POST book update
router.post('/books/:id', asyncHandler(async(req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if(!book){
    next();
  }else{
    try{
      await book.update(req.body);
      res.redirect('/books');
    }catch(err){
      if(err.name === 'SequelizeValidationError'){
        const errors = err.errors.map(error => error.message);
        res.render('update-book', {book, title: book.title, errors});
      }else{
        throw err;
      }
    }
  }
}));

// POST delete book
router.post('/books/:id/delete', asyncHandler(async(req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if(!book){
    next();
  }else{
    await book.destroy(req.body);
    res.redirect('/books');
  }
}));


module.exports = router;
