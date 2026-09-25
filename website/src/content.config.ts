import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const stats = defineCollection({
  loader: file('src/content/stats.json'),
  schema: z.object({
    order: z.number(),
    number: z.string(),
    label: z.string(),
    context: z.string(),
  }),
});

const faq = defineCollection({
  loader: file('src/content/faq.json'),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
  }),
});

const phases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/phases' }),
  schema: z.object({
    title: z.string(),
    phase: z.string(),
    nodes: z.string(),
    cost: z.string(),
    order: z.number(),
  }),
});

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { stats, faq, phases, journal };
