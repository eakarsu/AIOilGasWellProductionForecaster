const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)return res.status(500).json({error:'Authentication is not configured'});
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
