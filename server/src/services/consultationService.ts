import Consultation, { IConsultation } from '../models/Consultation';

export interface ConsultationFilters {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  email?: string;
  page?: number;
  limit?: number;
}

export interface ConsultationResult {
  consultations: IConsultation[];
  total: number;
  page: number;
  totalPages: number;
}

export const consultationService = {
  async getAll(filters: ConsultationFilters): Promise<ConsultationResult> {
    const { status, email, page = 1, limit = 20 } = filters;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (email) query.email = email;

    const skip = (page - 1) * limit;

    const [consultations, total] = await Promise.all([
      Consultation.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Consultation.countDocuments(query),
    ]);

    return {
      consultations: consultations as unknown as IConsultation[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getById(id: string): Promise<IConsultation | null> {
    return Consultation.findById(id).lean() as unknown as IConsultation | null;
  },

  async create(data: Partial<IConsultation>): Promise<IConsultation> {
    const consultation = new Consultation(data);
    await consultation.save();
    return consultation.toObject() as IConsultation;
  },

  async updateStatus(
    id: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
    notes?: string
  ): Promise<IConsultation | null> {
    const updateData: Partial<IConsultation> = { status };
    if (notes) updateData.notes = notes;

    const consultation = await Consultation.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    return consultation ? (consultation.toObject() as IConsultation) : null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await Consultation.findByIdAndDelete(id);
    return !!result;
  },
};
