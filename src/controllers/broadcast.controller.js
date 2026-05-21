import {
  broadcast,
  parseChannelTypes,
} from '../services/broadcast.service.js';
import { success, fail } from '../utils/response.js';

const VALID_CHANNEL_TYPES = ['instagram', 'facebook', 'linkedin'];

export async function post(req, res, next) {
  const file = req.file;

  try {
    if (!file) {
      return fail(res, 400, 'Media file is required (field: media)');
    }

    const channelTypes = parseChannelTypes(req.body.channel_types);

    if (channelTypes.length === 0) {
      return fail(res, 400, 'channel_types is required (JSON array or comma-separated)');
    }

    const invalid = channelTypes.filter(
      (t) => !VALID_CHANNEL_TYPES.includes(t)
    );
    if (invalid.length > 0) {
      return fail(res, 400, `Invalid channel_types: ${invalid.join(', ')}`);
    }

    const data = await broadcast(req.user.id, {
      channelTypes,
      message: req.body.message || undefined,
      file,
    });

    const statusCode = data.results.length > 0 ? 201 : 400;
    return success(res, statusCode, data);
  } catch (err) {
    next(err);
  }
}
