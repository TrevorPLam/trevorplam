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
    metric: z.string().optional(),
    lastUpdated: z.coerce.date(),
    relatedCases: z.array(z.string()).default([]),
    pdfUrl: z.string().optional(),
    metrics: z.array(z.object({
      id: z.string(),
      title: z.string(),
      type: z.enum(['percentage', 'currency', 'number', 'ratio', 'time', 'count']),
      value: z.string(),
      previousValue: z.string().optional(),
      context: z.string(),
      category: z.string(),
      trend: z.enum(['up', 'down', 'neutral', 'positive', 'negative']).optional(),
      targetValue: z.string().optional()
    })).optional()
  })
});

const capabilities = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: 'src/content/capabilities' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    philosophy: z.string(),
    kpis: z.array(z.object({
      name: z.string(),
      value: z.string(),
      context: z.string()
    })),
    industries: z.array(z.string()),
    relatedCases: z.array(z.string()),
    lastUpdated: z.coerce.date(),
    metrics: z.array(z.object({
      id: z.string(),
      title: z.string(),
      type: z.enum(['percentage', 'currency', 'number', 'ratio', 'time', 'count']),
      value: z.string(),
      previousValue: z.string().optional(),
      context: z.string(),
      category: z.string(),
      trend: z.enum(['up', 'down', 'neutral', 'positive', 'negative']).optional(),
      targetValue: z.string().optional()
    })).optional()
  })
});

const learningLogs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: 'src/content/learning-logs' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    lastUpdated: z.date(),
    tags: z.array(z.enum(['AI', 'Leadership', 'QSR', 'Dev-Log', 'Ops-Systems'])),
    excerpt: z.string()
  })
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: 'src/content/projects' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    status: z.enum(['active', 'completed', 'paused']),
    startDate: z.date(),
    endDate: z.date().optional(),
    technologies: z.array(z.string()),
    tags: z.array(z.string()),
    lastUpdated: z.coerce.date()
  })
});

const resources = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: 'src/content/resources' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    type: z.enum(['playbook', 'template', 'guide', 'tool']),
    description: z.string(),
    audience: z.string(),
    downloadUrl: z.string().optional(),
    gated: z.boolean().default(false),
    lastUpdated: z.date()
  })
});

const skills = defineCollection({
  loader: glob({ pattern: '**/*.json', base: 'src/content/skills' }),
  schema: z.object({
    category: z.string(),
    skills: z.array(z.object({
      name: z.string(),
      level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
      yearsExperience: z.number(),
      certifications: z.array(z.string()).optional()
    }))
  })
});

export const collections = { 
  caseStudies, 
  capabilities, 
  learningLogs, 
  projects, 
  resources, 
  skills 
};
