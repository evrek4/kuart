import { Router } from 'express';
import { sendWhatsAppTextMessage, sendWhatsAppTemplateMessage } from '../services/whatsapp';

const router = Router();

// Test endpoint to send a message manually
router.post('/send', async (req, res) => {
  const { to, text, templateName, components } = req.body;
  
  if (!to) {
    return res.status(400).json({ success: false, error: { message: 'Phone number (to) is required.' } });
  }

  try {
    let result = false;
    if (templateName) {
      result = await sendWhatsAppTemplateMessage(to, templateName, 'tr', components || []);
    } else if (text) {
      result = await sendWhatsAppTextMessage(to, text);
    } else {
      return res.status(400).json({ success: false, error: { message: 'Provide either text or templateName.' } });
    }

    if (result) {
      res.json({ success: true, message: 'Message sent successfully.' });
    } else {
      res.status(500).json({ success: false, error: { message: 'Failed to send message. Check server logs.' } });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Meta Webhook Verification
router.get('/webhook', (req, res) => {
  const verify_token = process.env.WHATSAPP_VERIFY_TOKEN || 'kuart_secret';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verify_token) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.status(400).send('Invalid webhook verification request');
  }
});

// Meta Webhook Messages (Incoming)
router.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0] &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
      const from = body.entry[0].changes[0].value.messages[0].from;
      const msgBody = body.entry[0].changes[0].value.messages[0].text?.body;

      console.log(`Incoming WhatsApp message from ${from}: ${msgBody}`);
      // Here we could handle incoming messages or update chat status in DB
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

export default router;
