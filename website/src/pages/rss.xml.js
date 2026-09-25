import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('journal')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: 'Uinta Watch — Lab Journal',
    description: 'Open field lab for low-cost wildfire sensing. Open source, open data. Built by Utahns, for Utah.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: `/journal/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}
