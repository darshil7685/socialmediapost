import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { fail } from '../utils/response.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return fail(res, 401, 'Authorization token required');
  }

  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret);
    req.user = {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      user_category: payload.user_category,
    };
    next();
  } catch {
    return fail(res, 401, 'Invalid or expired token');
  }
}
