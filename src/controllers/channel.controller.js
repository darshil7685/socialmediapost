import * as channelService from '../services/channel.service.js';
import { success } from '../utils/response.js';

export async function getChannels(req, res, next) {
  try {
    const channelType = req.query.channel_type;
    const channels = await channelService.getChannelsByUserId(
      req.user.id,
      channelType
    );
    return success(res, 200, { channels });
  } catch (err) {
    next(err);
  }
}

export async function upsertChannel(req, res, next) {
  try {
    const channel = await channelService.upsertChannel(
      req.user.id,
      req.validated
    );
    return success(res, 200, { channel });
  } catch (err) {
    next(err);
  }
}
