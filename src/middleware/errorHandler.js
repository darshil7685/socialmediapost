import { fail } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.statusCode) {
    return fail(res, err.statusCode, err.message);
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return fail(res, 400, 'File too large (max 100MB)');
  }

  if (err instanceof Error && err.message?.includes('Only image and video')) {
    return fail(res, 400, err.message);
  }

  if (err.code === '23505') {
    return fail(res, 409, 'Email or username already exists');
  }

  console.error(err);
  return fail(res, 500, 'Internal server error');
}
