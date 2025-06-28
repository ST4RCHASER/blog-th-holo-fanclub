import type { APIRoute } from 'astro';

export async function getStaticPaths() {
    // Get all posts
    const allPosts = Object.values(await import.meta.glob('../../posts/*.md', { eager: true }));

    // Create paths for each post
    return allPosts.map((post: any) => {
        const id = post.url?.split('/').pop()?.replace('.html', '') || '';
        return {
            params: { id },
            props: { post }
        };
    });
}

export const GET: APIRoute = async ({ params, props }) => {
    try {
        const { id } = params;
        const { post } = props;

        if (!id || !post) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Post not found'
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Transform post to clean JSON format
        const postData = {
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
            author: post.frontmatter.author || 'Holo Fans TH',
            category: post.frontmatter.category || null,
            featured: post.frontmatter.featured || false,
            draft: post.frontmatter.draft || false,
            content: post.body || ''
        };

        const response = {
            success: true,
            data: postData
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
            message: 'Failed to fetch post'
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