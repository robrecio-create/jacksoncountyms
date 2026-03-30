import { defineCollection, z } from 'astro:content';

const guides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    town: z.string().optional(),
    category: z.string(),
    publishedDate: z.string(),
  }),
});

export const collections = { guides };
