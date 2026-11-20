import Service, { IService } from '../models/Service';

export const serviceService = {
  async getAll(): Promise<IService[]> {
    const services = await Service.find().sort({ order: 1 }).lean();
    return services as unknown as IService[];
  },

  async getBySlug(slug: string): Promise<IService | null> {
    return Service.findOne({ slug }).lean() as unknown as IService | null;
  },

  async getById(id: string): Promise<IService | null> {
    return Service.findById(id).lean() as unknown as IService | null;
  },

  async create(data: Partial<IService>): Promise<IService> {
    const service = new Service(data);
    await service.save();
    return service.toObject() as IService;
  },

  async update(id: string, data: Partial<IService>): Promise<IService | null> {
    const service = await Service.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return service ? (service.toObject() as IService) : null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await Service.findByIdAndDelete(id);
    return !!result;
  },
};
