import { z } from 'zod';

export const createArtworkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be a positive number'),
  imageUrl: z.string().url('Image URL must be a valid URL'),
  category: z.string().min(1, 'Category is required'),
  dimensions: z.string().optional(),
  medium: z.string().optional(),
  yearCreated: z.number().int().optional(),
});

export const updateArtworkSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  category: z.string().min(1).optional(),
  dimensions: z.string().optional(),
  medium: z.string().optional(),
  yearCreated: z.number().int().optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export type CreateArtworkInput = z.infer<typeof createArtworkSchema>;
export type UpdateArtworkInput = z.infer<typeof updateArtworkSchema>;
