import * as facebookService from '../services/facebook.service.js';
import { getMediaRelativePath } from '../middleware/upload.js';
import { success, fail } from '../utils/response.js';

export async function post(req, res, next) {
  const file = req.file;

  try {
    if (!file) {
      return fail(res, 400, 'Media file is required (field: media)');
    }

    const accessToken = facebookService.normalizeAccessToken(
      req.body.accessToken ?? req.body.access_token
    );
    const pageId = facebookService.normalizePageId(
      req.body.pageId ?? req.body.page_id
    );
    const message = req.body.message?.trim() || undefined;

    if (!accessToken) {
      return fail(res, 400, 'accessToken is required');
    }
    if (!pageId) {
      return fail(res, 400, 'pageId is required');
    }

    const result = await facebookService.postToFacebook({
      pageId,
      accessToken,
      message,
      filePath: file.path,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });

    return success(res, 201, {
      ...result,
      media: {
        filename: file.filename,
        originalName: file.originalname,
        storedPath: getMediaRelativePath(file.filename),
        mimeType: file.mimetype,
        size: file.size,
      },
    });
  } catch (err) {
    next(err);
  }
}
