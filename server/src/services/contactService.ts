import ContactMessage, { IContactMessage } from '../models/ContactMessage';

export const contactService = {
  async getAll(): Promise<IContactMessage[]> {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    return messages as unknown as IContactMessage[];
  },

  async getById(id: string): Promise<IContactMessage | null> {
    return ContactMessage.findById(id).lean() as unknown as IContactMessage | null;
  },

  async create(data: Partial<IContactMessage>): Promise<IContactMessage> {
    const message = new ContactMessage(data);
    await message.save();
    return message.toObject() as IContactMessage;
  },

  async delete(id: string): Promise<boolean> {
    const result = await ContactMessage.findByIdAndDelete(id);
    return !!result;
  },
};
