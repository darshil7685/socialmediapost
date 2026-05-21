import { Router } from 'express';
import * as facebookController from '../controllers/facebook.controller.js';
import { mediaUpload } from '../middleware/upload.js';

const router = Router();

router.post('/post', (req, res, next) => {
  mediaUpload.single('media')(req, res, (err) => {
    if (err) return next(err);
    facebookController.post(req, res, next);
  });
});

export default router;
