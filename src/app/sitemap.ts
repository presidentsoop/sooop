import { MetadataRoute } from 'next';

const baseUrl = 'https://sooop.org.pk';

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes = [
        {
            url: '',
            priority: 1,
            images: ['/logo.jpg']
        },
        {
            url: '/about',
            priority: 0.8,
            images: ['/logo.jpg']
        },
        { url: '/contact', priority: 0.8 },
        { url: '/events', priority: 0.9, changeFrequency: 'daily' as const },
        { url: '/membership', priority: 0.9 },
        { url: '/wings', priority: 0.8 },
        { url: '/login', priority: 0.6 },
        { url: '/signup', priority: 0.7 },
        { url: '/privacy-policy', priority: 0.5 },
        { url: '/terms-of-service', priority: 0.5 },
        { url: '/founder-members', priority: 0.7 },
    ];

    const routes = staticRoutes.map((route) => ({
        url: `${baseUrl}${route.url}`,
        lastModified: new Date(),
        changeFrequency: (route.changeFrequency || 'monthly') as 'daily' | 'monthly' | 'always' | 'hourly' | 'weekly' | 'yearly' | 'never',
        priority: route.priority,
        images: route.images ? route.images.map(img => `${baseUrl}${img}`) : undefined,
    }));

    return routes;
}
