import { readFile } from 'fs/promises';
import axios from 'axios';
import FormData from 'form-data';
import { env } from '../config/env.js';

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

function graphUrl(pathSegment) {
  const version = env.metaGraphVersion.replace(/\/$/, '');
  const path = pathSegment.startsWith('/') ? pathSegment : `/${pathSegment}`;
  return `https://graph.facebook.com/${version}${path}`;
}

export function normalizePageId(pageId) {
  return String(pageId ?? '').trim();
}

export function normalizeAccessToken(token) {
  return String(token ?? '').trim();
}

export async function postToFacebook({
  pageId,
  accessToken,
  message,
  filePath,
  mimeType,
  originalName,
}) {
  const normalizedPageId = normalizePageId(pageId);
  const normalizedToken = normalizeAccessToken(accessToken);

  if (!normalizedPageId || normalizedPageId === '0' || !/^\d+$/.test(normalizedPageId)) {
    const err = new Error('Invalid pageId');
    err.statusCode = 400;
    throw err;
  }

  if (!normalizedToken) {
    const err = new Error('Invalid accessToken');
    err.statusCode = 400;
    throw err;
  }

  const isVideo = mimeType.startsWith('video/');
  const endpoint = graphUrl(
    isVideo ? `/${normalizedPageId}/videos` : `/${normalizedPageId}/photos`
  );

  const form = new FormData();
  form.append('access_token', normalizedToken);
  if (message) {
    if (isVideo) {
      form.append('description', message);
    } else {
      form.append('message', message);
    }
  }

  const fileBuffer = await readFile(filePath);
  form.append('source', fileBuffer, {
    filename: originalName,
    contentType: mimeType,
  });

  try {
    const { data } = await axios.post(endpoint, form, {
      headers: form.getHeaders(),
      maxBodyLength: MAX_UPLOAD_BYTES,
      maxContentLength: MAX_UPLOAD_BYTES,
    });

    return {
      postId: data.id || data.post_id,
      type: isVideo ? 'video' : 'photo',
      raw: data,
    };
  } catch (error) {
    const fbError = error.response?.data?.error;
    const msg =
      fbError?.message ||
      fbError?.error_user_msg ||
      error.message ||
      'Facebook API request failed';
    const err = new Error(msg);
    const status = error.response?.status;
    err.statusCode = status >= 400 && status < 500 ? 400 : 502;
    err.facebookError = fbError;
    throw err;
  }
}
