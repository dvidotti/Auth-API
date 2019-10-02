const express = require('express');
const authRoutes = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');


authRoutes.post('/logout', (req, res, next) => {
  req.logout();
  res.status(200).json({ message: 'Log out success!' });
});


authRoutes.get('/loggedin', (req, res, next) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
    return;
  }
  res.status(403).json({ message: 'Unauthorized' });
});


authRoutes.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, failureDetails) => {
    if (err) {
      res.status(500).json({ message: 'Something went wrong authenticating MyVoice' });
      return;
    }
       
    if (!user) {
      res.status(401).json({message: 'Wrong username or password'});
      return;
    }      

    req.login(user, (err) => {  
      if (err) {
          res.status(500).json({ message: 'Session save went bad.' });
          return;
      }
        res.status(200).json(user);
    }); 
  })
  (req, res, next);
});



authRoutes.post('/signup', (req, res, next) => {
  const { username, password } = req.body;
  

  if (!username || !password) {
    res.status(400).json({ message: 'Username or password empty'});
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ message: 'Password must be at least 8 characters.' });
    return;
  }

  User.findOne({ username }, (err, foundUser) => {
    if (err) {
      res.status(500).json({ message: 'Username check went bad.' });
      return;
    }

    if (foundUser) {
      res.status(400).json({ message: 'User already choosen, try another one.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass,
    });

    newUser.save((err) => {
      if (err) {
        res.status(400).json({ message: 'Sorry signup went wrong. Plese try again.' });
        return;
      }
      
      req.login(newUser, (err) => {
        if (err) {
          res.status(500).json({ message: 'Login after signup went bad.' });
          return;
        }
      })
      res.status(200).json(newUser);
    });
  });
});

module.exports = authRoutes;
