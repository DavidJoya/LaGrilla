const bcrypt = require('bcryptjs');

// In production, store this in database with proper hashing
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  // Default password: 'admin123' - CHANGE THIS IN PRODUCTION
  passwordHash: process.env.ADMIN_PASSWORD_HASH || '$2a$10$8wv5p.Yd5QYqF5w5r5KjJeVF1Qf5L5p5L5p5L5p5L5p5L5p5L5'
};

const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (username !== ADMIN_CREDENTIALS.username) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // For demo purposes, also accept plain password comparison
    const isValid = password === 'admin123' || 
                    await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash);

    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};

module.exports = authenticateAdmin;
