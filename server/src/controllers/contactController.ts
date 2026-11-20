import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { contactService } from '../services/contactService';
import { sendContactConfirmation, sendContactAdminNotification } from '../services/emailService';

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export const contactController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const messages = await contactService.getAll();
      res.json({ success: true, data: messages });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid contact message ID format' });
        return;
      }

      const message = await contactService.getById(id);

      if (!message) {
        res.status(404).json({ success: false, message: 'Contact message not found' });
        return;
      }

      res.json({ success: true, data: message });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, email, subject, message',
          statusCode: 400,
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          error: 'Invalid email format',
          statusCode: 400,
        });
        return;
      }

      // Send emails FIRST — only save to DB after confirmed delivery.
      // This ensures the success response means the email was actually sent.
      try {
        await Promise.all([
          sendContactConfirmation(email, name, subject),
          sendContactAdminNotification(name, email, subject, message),
        ]);
      } catch (emailErr) {
        console.error('[contact] Email sending failed:', emailErr);
        res.status(500).json({
          success: false,
          error: 'Sorry, your message could not be sent. Please try again or WhatsApp us directly.',
          statusCode: 500,
        });
        return;
      }

      // Email sent successfully — now persist to database with status 'sent'
      const contactMessage = await contactService.create({
        name,
        email,
        subject,
        message,
        status: 'sent',
      });

      res.status(201).json({ success: true, data: contactMessage });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid contact message ID format' });
        return;
      }

      const deleted = await contactService.delete(id);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Contact message not found' });
        return;
      }

      res.json({ success: true, message: 'Contact message deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
};
