import { usePage, router } from '@inertiajs/react';
import Avatar from './Avatar';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { timeAgo } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types/auth';
import type { PostData, Comment, ApiResponse, CursorPaginated } from './Post/types';
import { getJsonHeaders } from './Post/utils';
import { destroy as destroyPost, toggleLike as togglePostLike } from '@/actions/App/Http/Controllers/PostController';
import { index as commentIndex } from '@/actions/App/Http/Controllers/CommentController';

interface PostProps {
    post: PostData;
}

export default function Post({ post }: PostProps) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [showComments, setShowComments] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [liked, setLiked] = useState(post.liked_by_user);
    const [likeCount, setLikeCount] = useState(post.like_count);
    const [commentCount, setCommentCount] = useState(post.comment_count);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoaded, setCommentsLoaded] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [nextCommentCursor, setNextCommentCursor] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const currentUserId = auth.user.id as number;
    const isOwner = post.user_id === currentUserId;

    const addComment = useCallback((comment: Comment, postCommentCount: number, parentReplyCount: number | null) => {
        setCommentCount(postCommentCount);

        if (!commentsLoaded && !showComments) return;

        setComments(prev => {
            if (comment.parent_comment_id) {
                return prev.map(c =>
                    c.id === comment.parent_comment_id
                        ? { ...c, reply_count: parentReplyCount ?? c.reply_count }
                        : c
                );
            }

            return prev.some(c => c.id === comment.id) ? prev : [comment, ...prev];
        });
    }, [commentsLoaded, showComments]);

    const removeComment = useCallback((commentIds: number[], postCommentCount: number) => {
        setCommentCount(postCommentCount);
        setComments(prev => {
            return prev.filter(comment => !commentIds.includes(comment.id));
        });
    }, []);

    const updateCommentLikeState = useCallback((commentId: number, liked: boolean, likeCount: number) => {
        setComments(prev => prev.map(comment => (
            comment.id === commentId
                ? { ...comment, liked_by_user: liked, like_count: likeCount }
                : comment
        )));
    }, []);

    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.private(`post.${post.id}`);

        channel.listen('.CommentCreated', (e: { comment: Comment; post_comment_count: number; parent_reply_count: number | null }) => {
            addComment(e.comment, e.post_comment_count, e.parent_reply_count);
        });

        channel.listen('.CommentDeleted', (e: { comment_ids: number[]; post_comment_count: number }) => {
            removeComment(e.comment_ids, e.post_comment_count);
        });

        channel.listen('.PostLiked', (e: { like_count: number; liked_by_user_id: number }) => {
            setLikeCount(e.like_count);
            if (e.liked_by_user_id === currentUserId) {
                setLiked(true);
            }
        });

        channel.listen('.CommentLiked', (e: { comment_id: number; like_count: number; liked_by_user_id: number; liked: boolean }) => {
            setComments(prev =>
                prev.map(c => {
                    if (c.id === e.comment_id) {
                        return {
                            ...c,
                            like_count: e.like_count,
                            liked_by_user: e.liked_by_user_id === currentUserId ? e.liked : c.liked_by_user,
                        };
                    }
                    return c;
                })
            );
        });

        return () => {
            window.Echo.leave(`post.${post.id}`);
        };
    }, [post.id, currentUserId, addComment, removeComment]);

    const handleLike = async () => {
        if (processing) return;

        const prevLiked = liked;
        const prevLikeCount = likeCount;

        setLiked(!prevLiked);
        setLikeCount(prevLiked ? prevLikeCount - 1 : prevLikeCount + 1);
        setProcessing(true);

        try {
            const response = await fetch(togglePostLike.url(post.public_id), {
                method: 'POST',
                headers: getJsonHeaders(),
            });

            const data: ApiResponse = await response.json();

            if (!response.ok || data.liked === undefined) {
                setLiked(prevLiked);
                setLikeCount(prevLikeCount);
            }
        } catch {
            setLiked(prevLiked);
            setLikeCount(prevLikeCount);
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        setDropdownOpen(false);
        if (!confirm('Delete this post?')) return;

        try {
            const response = await fetch(destroyPost.url(post.public_id), {
                method: 'DELETE',
                headers: getJsonHeaders(),
            });

            if (response.ok) {
                router.reload({ only: ['posts'] });
            } else {
                alert('Failed to delete post. Please try again.');
            }
        } catch {
            alert('Network error. Please check your connection and try again.');
        }
    };

    const loadComments = async (cursor: string | null = null) => {
        if (commentsLoading) return;

        setCommentsLoading(true);

        try {
            const response = await fetch(commentIndex.url(post.public_id, {
                query: cursor ? { cursor } : {},
            }));

            if (!response.ok) return;

            const page: CursorPaginated<Comment> = await response.json();
            setComments(previous => {
                const fetchedCommentIds = new Set(page.data.map(comment => comment.id));
                const localComments = previous.filter(comment => !fetchedCommentIds.has(comment.id));

                return cursor ? [...previous, ...page.data.filter(comment => !previous.some(item => item.id === comment.id))] : [...localComments, ...page.data];
            });
            setNextCommentCursor(page.next_cursor);
            setCommentsLoaded(true);
        } finally {
            setCommentsLoading(false);
        }
    };

    const toggleComments = () => {
        if (!showComments && !commentsLoaded) {
            void loadComments();
        }

        setShowComments(value => !value);
    };

    return (
        <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
            <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
                <div className="_feed_inner_timeline_post_top">
                    <div className="_feed_inner_timeline_post_box">
                        <div className="_feed_inner_timeline_post_box_image">
                            <Avatar author={post.user} size="md" />
                        </div>
                        <div className="_feed_inner_timeline_post_box_txt">
                            <h4 className="_feed_inner_timeline_post_box_title">
                                {post.user ? post.user.name : 'Unknown User'}
                            </h4>
                            <p className="_feed_inner_timeline_post_box_para">
                                {timeAgo(post.created_at)} .{' '}
                                <span style={{ textTransform: 'capitalize' }}>
                                    {post.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                                </span>
                            </p>
                        </div>
                    </div>
                    {isOwner && (
                        <div className="_feed_inner_timeline_post_box_dropdown" style={{ position: 'relative' }}>
                            <div className="_feed_timeline_post_dropdown">
                                <button
                                    type="button"
                                    id="_timeline_show_drop_btn"
                                    className="_feed_timeline_post_dropdown_link"
                                    onClick={() => setDropdownOpen(v => !v)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                                        <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                                        <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                                        <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                                    </svg>
                                </button>
                            </div>
                            {dropdownOpen && (
                                <div className="_feed_timeline_dropdown _timeline_dropdown" style={{ display: 'block', position: 'absolute', right: 0, zIndex: 100 }}>
                                    <ul className="_feed_timeline_dropdown_list">
                                        <li className="_feed_timeline_dropdown_item">
                                            <button
                                                type="button"
                                                className="_feed_timeline_dropdown_link"
                                                onClick={handleDelete}
                                                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#F5222D' }}
                                            >
                                                <span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                                                        <path stroke="#F5222D" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M2.25 4.5h13.5M6 4.5V3a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0112 3v1.5m2.25 0V15a1.5 1.5 0 01-1.5 1.5h-7.5a1.5 1.5 0 01-1.5-1.5V4.5h10.5zM7.5 8.25v4.5M10.5 8.25v4.5" />
                                                    </svg>
                                                </span>
                                                Delete Post
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {post.content && (
                    <p className="_feed_inner_timeline_post_title" style={{ fontWeight: 400, fontSize: 15, marginTop: 12 }}>
                        {post.content}
                    </p>
                )}

                {post.media && post.media.length > 0 && (
                    <div className="_feed_inner_timeline_image" style={{ marginTop: 12 }}>
                        {post.media.length === 1 ? (
                            post.media[0].media_type === 'video' ? (
                                <video src={post.media[0].file_path} className="_time_img" controls style={{ maxWidth: '100%', borderRadius: 8 }} />
                            ) : (
                                <img src={post.media[0].file_path} alt="Post media" className="_time_img" style={{ maxWidth: '100%', borderRadius: 8 }} />
                            )
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: post.media.length === 2 ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 4 }}>
                                {post.media.map(m => (
                                    m.media_type === 'video' ? (
                                        <video key={m.id} src={m.file_path} controls style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 6 }} />
                                    ) : (
                                        <img key={m.id} src={m.file_path} alt="Post media" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 6 }} />
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="_feed_inner_timeline_reaction">
                <button
                    type="button"
                    className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${liked ? '_feed_reaction_active' : ''}`}
                    onClick={handleLike}
                    disabled={processing}
                >
                    <span className="_feed_inner_timeline_reaction_link">
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 24 24" stroke={liked ? '#1890FF' : 'currentColor'} strokeWidth="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            <span style={{ marginLeft: 4, color: liked ? '#1890FF' : undefined }}>
                                {liked ? 'Liked' : 'Like'}{likeCount > 0 && ` ${likeCount}`}
                            </span>
                        </span>
                    </span>
                </button>
                <button
                    type="button"
                    className="_feed_inner_timeline_reaction_comment _feed_reaction"
                    onClick={toggleComments}
                >
                    <span className="_feed_inner_timeline_reaction_link">
                        <span>
                            <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
                                <path stroke="#000" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z" />
                                <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
                            </svg>
                            Comment{commentCount > 0 && ` ${commentCount}`}
                        </span>
                    </span>
                </button>
            </div>

            {showComments && (
                <div className="_feed_inner_timeline_cooment_area _padd_r24 _padd_l24">
                    <div className="_feed_inner_comment_box">
                        <CommentForm postPublicId={post.public_id} onCommentAdded={addComment} />
                    </div>

                    <div className="_timline_comment_main">
                        {commentsLoading && !commentsLoaded ? (
                            <p style={{ color: '#999', fontSize: 13, padding: '8px 0' }}>Loading comments...</p>
                        ) : comments.length > 0 ? (
                            comments.map(comment => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    postPublicId={post.public_id}
                                    currentUserId={currentUserId}
                                    onCommentDeleted={removeComment}
                                    onReplyAdded={addComment}
                                    onLikeChanged={updateCommentLikeState}
                                />
                            ))
                        ) : (
                            <p style={{ color: '#999', fontSize: 13, padding: '8px 0' }}>No comments yet. Be the first!</p>
                        )}
                        {nextCommentCursor && (
                            <button
                                type="button"
                                className="_previous_comment_txt"
                                disabled={commentsLoading}
                                onClick={() => void loadComments(nextCommentCursor)}
                            >
                                {commentsLoading ? 'Loading comments...' : 'View more comments'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
