import * as customerQueryService from '../services/customer-query.service.js';
import { success } from '../utils/response.js';

export async function create(req, res, next) {
  try {
    const query = await customerQueryService.createQuery(req.validated);
    return success(res, 201, { query });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const queries = await customerQueryService.listQueries();
    return success(res, 200, { queries });
  } catch (err) {
    next(err);
  }
}
