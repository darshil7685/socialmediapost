import { Router } from 'express';
import * as broadcastController from '../controllers/broadcast.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { mediaUpload } from '../middleware/upload.js';

const router = Router();

router.post('/', authenticate, (req, res, next) => {
  mediaUpload.single('media')(req, res, (err) => {
    if (err) return next(err);
    broadcastController.post(req, res, next);
  });
});

export default router;
