import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: 'src/content/cases' }),
  schema: z.object({
    title: z.string(),
    industry: z.enum(['QSR', 'Salon', 'CPA-Payroll']),
    problem: z.string(),
    result: z.string(),
    skills: z.array(z.string()),
    metric: z.string().optional()
  })
});

export const collections = { caseStudies };
