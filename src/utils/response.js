export function success(res, statusCode, data) {
  return res.status(statusCode).json({ success: true, data });
}

export function fail(res, statusCode, message, errors = undefined) {
  const body = { success: false, message };
  if (errors !== undefined) {
    body.errors = errors;
  }
  return res.status(statusCode).json(body);
}
