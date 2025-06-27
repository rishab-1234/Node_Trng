const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  try {
      const token = req.headers.authorization?.split(' ')[1]; 
  if (!token) {return res.status(401).json({ message: 'Token is required.'});}
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id:decoded.userId }; //---->>  this make the (req.user) available.
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

