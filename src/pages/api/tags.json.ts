import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
    try {
        // Get all posts
        const allPosts = Object.values(await import.meta.glob('../posts/*.md', { eager: true }));

        // Get all unique tags with post counts
        const tagCounts: Record<string, number> = allPosts.reduce((acc: Record<string, number>, post: any) => {
            post.frontmatter.tags?.forEach((tag: string) => {
                acc[tag] = (acc[tag] || 0) + 1;
            });
            return acc;
        }, {});

        const allTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

        // Transform tags to clean JSON format
        const tags = allTags.map(tag => ({
            name: tag,
            count: tagCounts[tag],
            url: `/tags/${tag}`
        }));

        const response = {
            success: true,
            data: {
                tags,
                meta: {
                    totalTags: tags.length,
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
                'Cache-Control': 'public, max-age=300'
            }
        });

    } catch (error) {
        console.error('API Error:', error);

        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch tags'
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