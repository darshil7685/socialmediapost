import { fail } from '../utils/response.js';

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return fail(res, 400, 'Validation failed', errors);
    }
    req.validated = result.data;
    next();
  };
}
