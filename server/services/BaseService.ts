import mongoose, { Model, Document } from 'mongoose';

// Base class for our database services
// Handles standard DB operations so we don't have to repeat them everywhere
export abstract class BaseService<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findAll(filter: Record<string, any> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async create(data: any): Promise<T> {
    return this.model.create(data) as unknown as Promise<T>;
  }

  async update(id: string, updateData: Record<string, any>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
