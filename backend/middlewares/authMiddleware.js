import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const token = req.cookies.token || (req.headers.authorization?.split(' ')[1]);

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Unauthorized: Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ Invalid token:', err.message);
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
}
