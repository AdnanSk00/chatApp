import express from 'express';
import { archiveUser, unarchiveUser, getMyArchived } from '../controllers/archive.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.post('/:id/archive', archiveUser);
router.post('/:id/unarchive', unarchiveUser);
router.get('/archived/me', getMyArchived);

export default router;