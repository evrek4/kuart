import { Router } from 'express';
const router = Router();
router.all('*', (req, res) => res.json({ success: true, message: 'Mock Gallery Router' }));
export default router;
