import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
    try {
        // Get all posts
        const allPosts = Object.values(await import.meta.glob('../posts/*.md', { eager: true }));

        // Sort posts by date (newest first)
        const sortedPosts = allPosts.sort((a: any, b: any) =>
            new Date(b.frontmatter.pubDate).getTime() - new Date(a.frontmatter.pubDate).getTime()
        );

        // Transform posts to clean JSON format
        const posts = sortedPosts.map((post: any) => ({
            id: post.url?.split('/').pop()?.replace('.html', '') || '',
            title: post.frontmatter.title || '',
            description: post.frontmatter.description || '',
            pubDate: post.frontmatter.pubDate || '',
            updatedDate: post.frontmatter.updatedDate || post.frontmatter.pubDate || '',
            tags: post.frontmatter.tags || [],
            image: post.frontmatter.image ? {
                url: post.frontmatter.image.url || '',
                alt: post.frontmatter.image.alt || post.frontmatter.title || ''
            } : null,
            url: post.url || '',
            readingTime: post.frontmatter.readingTime || null,
            author: post.frontmatter.author || 'HoloFans TH',
            category: post.frontmatter.category || null,
            featured: post.frontmatter.featured || false,
            draft: post.frontmatter.draft || false
        }));

        // Get all unique tags with post counts
        const tagCounts: Record<string, number> = allPosts.reduce((acc: Record<string, number>, post: any) => {
            post.frontmatter.tags?.forEach((tag: string) => {
                acc[tag] = (acc[tag] || 0) + 1;
            });
            return acc;
        }, {});

        const allTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

        // Create response object
        const response = {
            success: true,
            data: {
                posts,
                meta: {
                    totalPosts: posts.length,
                    totalTags: allTags.length,
                    tags: allTags.map(tag => ({
                        name: tag,
                        count: tagCounts[tag]
                    })),
                    lastUpdated: new Date().toISOString(),
                    version: '1.0.0'
                }
            }
        };

        return new Response(JSON.stringify(response, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
            }
        });

    } catch (error) {
        console.error('API Error:', error);

        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch posts'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};

export const OPTIONS: APIRoute = () => {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}; 