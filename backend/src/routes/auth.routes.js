import express from 'express';
import { register, login, logout, getMe, updateProfile } from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { validateRegister, validateLogin } from '../validators/auth.validator.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

// Public Authentication Routes (Payload validated and rate-limited)
router.post('/register', authLimiter, validateBody(validateRegister), register);
router.post('/login', authLimiter, validateBody(validateLogin), login);

// Protected Authentication Routes (Require Bearer JWT token verification)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/update', protect, updateProfile);

export default router;
