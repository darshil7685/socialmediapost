import { Router } from 'express';
import { z } from 'zod';
import * as authController from '../controllers/auth.controller.js';
import * as channelController from '../controllers/channel.controller.js';
import * as customerQueryController from '../controllers/customer-query.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(4),
  user_category: z
    .enum(['admin', 'users', 'employee'])
    .default('users'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const channelUpsertSchema = z.object({
  token: z.string().min(1),
  page_id: z.string().min(1),
  channel_type: z.enum(['instagram', 'facebook', 'linkedin']),
});

const customerQueryInsertSchema = z.object({
  name: z.string().max(200).optional(),
  company_name: z.string().max(200).optional(),
  phone_number: z.string().max(30).optional(),
  email_id: z.string().email().max(200).optional(),
  message: z.string().max(5000).optional(),
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

router.get('/channels', authenticate, channelController.getChannels);
router.put(
  '/channels',
  authenticate,
  validate(channelUpsertSchema),
  channelController.upsertChannel
);

router.post(
  '/customer-queries',
  validate(customerQueryInsertSchema),
  customerQueryController.create
);
router.get(
  '/customer-queries',
  customerQueryController.list
);

export default router;
