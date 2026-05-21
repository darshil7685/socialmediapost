import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { env } from '../config/env.js';

const BCRYPT_ROUNDS = 12;
const USER_SELECT =
  'id, name, email, username, user_category, created_at, updated_at';

export function sanitizeUser(row) {
  if (!row) return null;
  const { password_hash, ...user } = row;
  return user;
}

export async function registerUser(payload) {
  const category =
    payload.user_category === 'admin' ? 'users' : payload.user_category;

  const passwordHash = await bcrypt.hash(payload.password, BCRYPT_ROUNDS);

  const { data, error } = await supabase
    .from('users')
    .insert({
      name: payload.name,
      email: payload.email.toLowerCase(),
      username: payload.username.toLowerCase(),
      password_hash: passwordHash,
      user_category: category,
    })
    .select(USER_SELECT)
    .single();

  if (error) {
    if (error.code === '23505') {
      const conflict = new Error('Email or username already exists');
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  }

  return data;
}

export async function loginUser(email, password) {
  const { data: user, error } = await supabase
    .from('users')
    .select(`${USER_SELECT}, password_hash`)
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!user) {
    const unauthorized = new Error('Invalid email or password');
    unauthorized.statusCode = 401;
    throw unauthorized;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const unauthorized = new Error('Invalid email or password');
    unauthorized.statusCode = 401;
    throw unauthorized;
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      username: user.username,
      user_category: user.user_category,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return { token, user: sanitizeUser(user) };
}
