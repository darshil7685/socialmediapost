import * as authService from '../services/auth.service.js';
import { success } from '../utils/response.js';

export async function register(req, res, next) {
  try {
    const user = await authService.registerUser(req.validated);
    return success(res, 201, { user });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.validated;
    const result = await authService.loginUser(email, password);
    return success(res, 200, result);
  } catch (err) {
    next(err);
  }
}
