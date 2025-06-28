import type { APIRoute } from 'astro';

export async function getStaticPaths() {
    // Get all posts
    const allPosts = Object.values(await import.meta.glob('../../posts/*.md', { eager: true }));

    // Get all unique tags
    const allTags = new Set<string>();
    allPosts.forEach((post: any) => {
        post.frontmatter.tags?.forEach((tag: string) => {
            allTags.add(tag);
        });
    });

    // Create paths for each tag
    return Array.from(allTags).map(tag => ({
        params: { tag },
        props: { tag, allPosts }
    }));
}

export const GET: APIRoute = async ({ params, url, props }) => {
    try {
        const { tag } = params;
        const { allPosts } = props;

        if (!tag) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Tag parameter is required'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Get query parameters
        const searchParams = url.searchParams;
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');
        const sort = searchParams.get('sort') || 'date'; // 'date' or 'title'

        // Filter posts by tag
        const filteredPosts = allPosts.filter((post: any) =>
            post.frontmatter.tags?.includes(tag)
        );

        if (filteredPosts.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No posts found for this tag'
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Sort posts
        let sortedPosts = filteredPosts;
        if (sort === 'date') {
            sortedPosts = filteredPosts.sort((a: any, b: any) =>
                new Date(b.frontmatter.pubDate).getTime() - new Date(a.frontmatter.pubDate).getTime()
            );
        } else if (sort === 'title') {
            sortedPosts = filteredPosts.sort((a: any, b: any) =>
                (a.frontmatter.title || '').localeCompare(b.frontmatter.title || '')
            );
        }

        // Apply pagination
        const paginatedPosts = sortedPosts.slice(offset, offset + limit);

        // Transform posts to clean JSON format
        const posts = paginatedPosts.map((post: any) => ({
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
            draft: post.frontmatter.draft || false
        }));

        const response = {
            success: true,
            data: {
                tag,
                posts,
                pagination: {
                    total: filteredPosts.length,
                    limit,
                    offset,
                    hasMore: offset + limit < filteredPosts.length,
                    totalPages: Math.ceil(filteredPosts.length / limit)
                },
                meta: {
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
            message: 'Failed to fetch posts by tag'
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