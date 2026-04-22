import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const learningLogs = await getCollection('learningLogs');
  
  // Sort by date (newest first)
  const sortedLogs = learningLogs.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Trevor Lam - Learning Log',
    description: 'Operations, Chief of Staff, and HR/Payroll insights from Trevor Lam',
    site: context.site,
    items: sortedLogs.map((log) => ({
      title: log.data.title,
      pubDate: log.data.date,
      description: log.data.description,
      link: `/lab/learning-log/${log.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
