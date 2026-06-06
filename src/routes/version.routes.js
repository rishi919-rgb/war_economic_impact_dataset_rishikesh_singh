import express from 'express';
import { getVersion } from '../controllers/version.controller.js';

const router = express.Router();

// Maps GET /version to the version controller logic
router.get('/', getVersion);

export default router;
