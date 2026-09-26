import jwt from 'jsonwebtoken';
import { User } from '../models/userModels.js';

export const isAuthenticated = async (req, res, next) => {
  try {
    // Accept token from `Authorization` header (Bearer ...) or from `token` cookie.
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;

    // Debugging info (avoid logging full tokens in production)
    console.log('isAuthenticated: authHeader=', authHeader ? authHeader.slice(0, 30) : null, ' cookieToken=', cookieToken ? 'present' : 'none');

    let token = null;
    if (typeof authHeader === 'string' && authHeader.trim() !== '') {
      const parts = authHeader.split(' ');
      // support 'Bearer <token>' or just '<token>'
      token = parts.length > 1 ? parts[1] : parts[0];
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, login required',
      });
    }

    // Trim quotes/spaces that may be accidentally copied into the header value
    token = String(token).trim().replace(/^"|"$/g, '');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    console.log(`isAdmin check for user: ${req.user.email}, role: ${req.user.role}`);

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Admin access required. Current role: ${req.user.role}`,
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization error',
      error: error.message,
    });
  }
};
