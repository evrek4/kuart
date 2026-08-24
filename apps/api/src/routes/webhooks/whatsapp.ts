import { Router } from 'express';
const router = Router();
router.all('*', (req, res) => res.json({ success: true, message: 'Mock WhatsApp Webhook Router' }));
export default router;
