import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { consultationService, ConsultationFilters } from '../services/consultationService';
import { sendConsultationConfirmation, sendConsultationAdminNotification } from '../services/emailService';

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export const consultationController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: ConsultationFilters = {
        status: req.query.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
        email: req.query.email as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      };

      const result = await consultationService.getAll(filters);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid consultation ID format' });
        return;
      }

      const consultation = await consultationService.getById(id);

      if (!consultation) {
        res.status(404).json({ success: false, message: 'Consultation not found' });
        return;
      }

      res.json({ success: true, data: consultation });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, phone, service, preferredDate, preferredTime, message } = req.body;

      if (!name || !email || !phone || !service || !preferredDate || !preferredTime) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: name, email, phone, service, preferredDate, preferredTime',
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
        return;
      }

      const bookingDate = new Date(preferredDate);
      const consultation = await consultationService.create({
        name,
        email,
        phone,
        service,
        preferredDate: bookingDate,
        preferredTime,
        message: message || '',
      });

      // Send emails asynchronously — don't block the response
      Promise.all([
        sendConsultationConfirmation(email, name, service, bookingDate, preferredTime).catch((err) => {
          console.error('[email] Failed to send consultation confirmation:', err);
        }),
        sendConsultationAdminNotification(name, email, phone, service, bookingDate, preferredTime, message).catch((err) => {
          console.error('[email] Failed to send admin notification:', err);
        }),
      ]);

      res.status(201).json({ success: true, data: consultation });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid consultation ID format' });
        return;
      }

      const { status, notes } = req.body;

      if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be: pending, confirmed, completed, or cancelled',
        });
        return;
      }

      const consultation = await consultationService.updateStatus(id, status, notes);

      if (!consultation) {
        res.status(404).json({ success: false, message: 'Consultation not found' });
        return;
      }

      res.json({ success: true, data: consultation });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid consultation ID format' });
        return;
      }

      const deleted = await consultationService.delete(id);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Consultation not found' });
        return;
      }

      res.json({ success: true, message: 'Consultation deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
};
