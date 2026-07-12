import { usePage, router } from '@inertiajs/react';
import Stories from '@/components/Stories';
import PostForm from '@/components/PostForm';
import Post from '@/components/Post';
import PostSkeleton from '@/components/PostSkeleton';
import { useState, useCallback, useEffect, useRef } from 'react';

interface PostData {
    id: number;
    public_id: string;
    user_id: number;
    user: {
        id: number;
        public_id: string;
        first_name: string;
        last_name: string;
        name: string;
        email: string;
        avatar?: string;
    } | null;
    content: string | null;
    visibility: 'public' | 'private';
    like_count: number;
    comment_count: number;
    likes: { id: number }[];
    media: {
        id: number;
        file_path: string;
        media_type: 'image' | 'video';
        width?: number;
        height?: number;
        position: number;
    }[];
    comments: {
        id: number;
        content: string;
        user: {
            id: number;
            public_id: string;
            first_name: string;
            last_name: string;
            name: string;
            email: string;
            avatar?: string;
        } | null;
        like_count: number;
        reply_count: number;
        likes: { id: number }[];
        replies: {
            id: number;
            content: string;
            user: {
                id: number;
                public_id: string;
                first_name: string;
                last_name: string;
                name: string;
                email: string;
                avatar?: string;
            } | null;
            reply_to_user: {
                id: number;
                public_id: string;
                first_name: string;
                last_name: string;
                name: string;
                email: string;
                avatar?: string;
            } | null;
            like_count: number;
            likes: { id: number }[];
            created_at: string;
        }[];
        created_at: string;
    }[];
    created_at: string;
}

interface PaginatedPosts {
    data: PostData[];
    path: string;
    per_page: number;
    next_cursor: string | null;
    next_cursor_url: string | null;
    prev_cursor: string | null;
    prev_cursor_url: string | null;
}

const SKELETON_COUNT = 3;

export default function Feed() {
    const { posts: initialPosts } = usePage<{ posts: PaginatedPosts }>().props;
    const [posts, setPosts] = useState<PostData[]>(initialPosts?.data || []);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!initialPosts?.data);
    const [hasMore, setHasMore] = useState(initialPosts?.next_cursor !== null);
    const [nextCursor, setNextCursor] = useState<string | null>(initialPosts?.next_cursor ?? null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialPosts?.data) {
            setPosts(initialPosts.data);
            setHasMore(initialPosts.next_cursor !== null);
            setNextCursor(initialPosts.next_cursor);
            setInitialLoading(false);
        }
    }, [initialPosts]);

    const loadMore = useCallback(() => {
        if (loading || !hasMore || !nextCursor) return;

        setLoading(true);

        router.get(
            '/',
            { cursor: nextCursor },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['posts'],
                onSuccess: (page) => {
                    const paginatedPosts = page.props.posts as PaginatedPosts;
                    setPosts((prev) => [...prev, ...paginatedPosts.data]);
                    setHasMore(paginatedPosts.next_cursor !== null);
                    setNextCursor(paginatedPosts.next_cursor);
                    setLoading(false);
                },
                onError: () => {
                    setLoading(false);
                },
            }
        );
    }, [loading, hasMore, nextCursor]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            {
                rootMargin: '200px',
            }
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [loadMore, hasMore, loading]);

    // Show skeleton on initial load (no server data yet)
    if (initialLoading) {
        return (
            <div className="_layout_middle_wrap">
                <div className="_layout_middle_inner">
                    <Stories />
                    <PostForm />
                    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                        <PostSkeleton key={`skeleton-${i}`} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="_layout_middle_wrap">
            <div className="_layout_middle_inner">
                <Stories />
                <PostForm />
                {posts.length > 0 ? (
                    <>
                        {posts.map((post) => (
                            <Post key={post.id} post={post} />
                        ))}

                        {/* Loading more skeletons */}
                        {loading && (
                            <>
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <PostSkeleton key={`loading-skeleton-${i}`} />
                                ))}
                            </>
                        )}

                        {/* Sentinel element for Intersection Observer */}
                        {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
                    </>
                ) : (
                    <div
                        className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16"
                        style={{ textAlign: 'center', color: '#999' }}
                    >
                        <p style={{ fontSize: 15, margin: '16px 0' }}>
                            No posts yet. Be the first to share something!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
