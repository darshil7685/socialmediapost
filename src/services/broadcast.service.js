import * as channelService from './channel.service.js';
import * as broadcastDetailsService from './broadcast-details.service.js';
import * as facebookService from './facebook.service.js';
import { getMediaRelativePath } from '../middleware/upload.js';

const SUPPORTED_CHANNELS = new Set(['facebook']);

function parseChannelTypes(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export { parseChannelTypes };

export async function broadcast(userId, { channelTypes, message, file }) {
  const types = [...new Set(channelTypes)];
  const channels = await channelService.getChannelsByUserIdAndTypes(
    userId,
    types
  );

  const results = [];
  const errors = [];
  const storedPath = getMediaRelativePath(file.filename);

  for (const type of types) {
    const matching = channels.filter((c) => c.channel_type === type);

    if (matching.length === 0) {
      errors.push({
        channel_type: type,
        error: 'No channel configured for this user',
      });
      continue;
    }

    if (!SUPPORTED_CHANNELS.has(type)) {
      for (const channel of matching) {
        errors.push({
          channel_type: type,
          page_id: channel.page_id,
          error: `${type} broadcast is not implemented yet`,
        });
      }
      continue;
    }

    for (const channel of matching) {
      try {
        const postResult = await facebookService.postToFacebook({
          pageId: channel.page_id,
          accessToken: channel.token,
          message: message || undefined,
          filePath: file.path,
          mimeType: file.mimetype,
          originalName: file.originalname,
        });

        let broadcastDetailId = null;
        try {
          const broadcastDetail =
            await broadcastDetailsService.createBroadcastDetail({
              userId,
              channelType: type,
              message: message || null,
              filePath: storedPath,
            });
          broadcastDetailId = broadcastDetail.id;
        } catch (dbErr) {
          console.error('Failed to save broadcast_details:', dbErr.message);
        }

        results.push({
          channel_type: type,
          page_id: channel.page_id,
          channel_id: channel.id,
          broadcast_detail_id: broadcastDetailId,
          ...postResult,
        });
      } catch (err) {
        errors.push({
          channel_type: type,
          page_id: channel.page_id,
          channel_id: channel.id,
          error: err.message,
        });
      }
    }
  }

  return {
    results,
    errors,
    media: {
      filename: file.filename,
      originalName: file.originalname,
      storedPath,
      mimeType: file.mimetype,
      size: file.size,
    },
  };
}
