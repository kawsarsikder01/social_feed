import { router, usePage } from '@inertiajs/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import Post from '@/components/Post';
import PostForm from '@/components/PostForm';
import PostSkeleton from '@/components/PostSkeleton';
import Stories from '@/components/Stories';

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
    liked_by_user: boolean;
    media: {
        id: number;
        file_path: string;
        media_type: 'image' | 'video';
        width?: number;
        height?: number;
        position: number;
    }[];
    created_at: string;
}

interface PaginatedPosts {
    data: PostData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

const SKELETON_COUNT = 3;

export default function Feed() {
    const { posts: initialPosts } = usePage<{ posts: PaginatedPosts }>().props;
    const [posts, setPosts] = useState<PostData[]>(initialPosts?.data || []);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(
        initialPosts ? initialPosts.current_page < initialPosts.last_page : false
    );
    const [nextPage, setNextPage] = useState<number | null>(
        initialPosts && initialPosts.current_page < initialPosts.last_page
            ? initialPosts.current_page + 1
            : null
    );
    const sentinelRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);
    const lastInitialPostsRef = useRef(initialPosts?.data);

    useEffect(() => {
        if (initialPosts?.data && initialPosts.data !== lastInitialPostsRef.current) {
            lastInitialPostsRef.current = initialPosts.data;
            setPosts(initialPosts.data);
            setHasMore(initialPosts.current_page < initialPosts.last_page);
            setNextPage(
                initialPosts.current_page < initialPosts.last_page
                    ? initialPosts.current_page + 1
                    : null
            );
        }
    }, [initialPosts]);

    const loadMore = useCallback(() => {
        if (loadingRef.current || !hasMore || !nextPage) {
            return;
        }

        loadingRef.current = true;
        setLoading(true);

        router.get(
            '/',
            { page: nextPage },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['posts'],
                onSuccess: (page) => {
                    const paginatedPosts = page.props.posts as PaginatedPosts;
                    setPosts((prev) => [...prev, ...paginatedPosts.data]);
                    const newNextPage = paginatedPosts.current_page < paginatedPosts.last_page
                        ? paginatedPosts.current_page + 1
                        : null;
                    setHasMore(newNextPage !== null);
                    setNextPage(newNextPage);
                    setLoading(false);
                    loadingRef.current = false;
                },
                onError: () => {
                    setLoading(false);
                    loadingRef.current = false;
                },
            }
        );
    }, [hasMore, nextPage]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        const container = scrollContainerRef.current;

        if (!sentinel || !container) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    loadMore();
                }
            },
            { root: container, rootMargin: '200px' }
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [loadMore]);

    if (!initialPosts?.data) {
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
        <div className="_layout_middle_wrap" ref={scrollContainerRef}>
            <div className="_layout_middle_inner">
                <Stories />
                <PostForm />
                {posts.length > 0 ? (
                    <>
                        {posts.map((post) => (
                            <Post key={post.id} post={post} />
                        ))}

                        {loading && (
                            <>
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <PostSkeleton key={`loading-skeleton-${i}`} />
                                ))}
                            </>
                        )}

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
