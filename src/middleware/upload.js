import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function isServerless() {
  return Boolean(
    process.env.VERCEL ||
      process.env.VERCEL_ENV ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.AWS_EXECUTION_ENV
  );
}

export const UPLOAD_DIR = isServerless()
  ? path.join(os.tmpdir(), 'stackpost-uploads')
  : path.join(__dirname, '../../uploads/media');

export function getMediaRelativePath(filename) {
  return path.join('uploads', 'media', filename).replace(/\\/g, '/');
}

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

const ALLOWED_MIME_PREFIXES = ['image/', 'video/'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      ensureUploadDir();
      cb(null, UPLOAD_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const allowed = ALLOWED_MIME_PREFIXES.some((p) =>
    file.mimetype.startsWith(p)
  );
  if (!allowed) {
    return cb(
      new Error('Only image and video files are allowed'),
      false
    );
  }
  cb(null, true);
}

export const mediaUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
