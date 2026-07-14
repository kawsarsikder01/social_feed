import { usePage, router } from '@inertiajs/react';
import Avatar from './Avatar';
import { timeAgo } from '@/types';
import type { User } from '@/types/auth';
import { useState, useEffect, useCallback } from 'react';

interface PostMediaItem {
    id: number;
    file_path: string;
    media_type: 'image' | 'video';
    width?: number;
    height?: number;
    position: number;
}

interface CommentUser {
    id: number;
    public_id: string;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    avatar?: string;
}

interface Reply {
    id: number;
    content: string;
    user: CommentUser | null;
    reply_to_user: CommentUser | null;
    like_count: number;
    likes: { id: number }[];
    created_at: string;
}

interface Comment {
    id: number;
    content: string;
    user: CommentUser | null;
    like_count: number;
    reply_count: number;
    likes: { id: number }[];
    replies: Reply[];
    parent_comment_id: number | null;
    created_at: string;
}

interface PostUser {
    id: number;
    public_id: string;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    avatar?: string;
}

interface PostData {
    id: number;
    public_id: string;
    user_id: number;
    user: PostUser | null;
    content: string | null;
    visibility: 'public' | 'private';
    like_count: number;
    comment_count: number;
    likes: { id: number }[];
    media: PostMediaItem[];
    comments: Comment[];
    created_at: string;
}

interface PostProps {
    post: PostData;
}

interface ApiResponse {
    message?: string;
    comment?: Comment;
    liked?: boolean;
    like_count?: number;
    errors?: Record<string, string[]>;
}

function CommentForm({ postPublicId, parentCommentId, onCommentAdded }: { postPublicId: string; parentCommentId?: number; onCommentAdded?: (comment: Comment) => void }) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const textarea = form.querySelector('textarea') as HTMLTextAreaElement;
        const content = textarea.value.trim();

        if (!content) return;

        setProcessing(true);
        setError(null);

        try {
            const response = await fetch(`/posts/${postPublicId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''
                    ),
                },
                body: JSON.stringify({
                    content,
                    parent_comment_id: parentCommentId ?? null,
                }),
            });

            const data: ApiResponse = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0];
                    setError(firstError?.[0] || 'Failed to add comment.');
                } else {
                    setError(data.message || 'Failed to add comment. Please try again.');
                }
                return;
            }

            textarea.value = '';
            if (onCommentAdded && data.comment) {
                onCommentAdded(data.comment);
            }
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="_feed_inner_comment_box_form">
            <div className="_feed_inner_comment_box_content">
                <div className="_feed_inner_comment_box_content_image">
                    <Avatar author={auth.user} size="sm" />
                </div>
                <div className="_feed_inner_comment_box_content_txt" style={{ flex: 1 }}>
                    <div style={{ position: 'relative' }}>
                        <textarea
                            className="form-control _comment_textarea"
                            placeholder={parentCommentId ? 'Write a reply...' : 'Write a comment...'}
                            name="content"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const form = (e.target as HTMLTextAreaElement).closest('form');
                                    form?.requestSubmit();
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={processing}
                            style={{
                                position: 'absolute',
                                right: 10,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                opacity: processing ? 0.5 : 1,
                                padding: 0,
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 14 13">
                                <path fill="#1890FF" fillRule="evenodd"
                                    d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88z"
                                    clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    {error && <div className="text-danger small mt-1">{error}</div>}
                </div>
            </div>
        </form>
    );
}

function CommentItem({ comment, postPublicId, currentUserId, onCommentDeleted, onReplyAdded }: { comment: Comment; postPublicId: string; currentUserId: number; onCommentDeleted: (commentId: number) => void; onReplyAdded: (comment: Comment) => void }) {
    const [showReplies, setShowReplies] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [liked, setLiked] = useState(comment.likes?.some(l => l.id === currentUserId));
    const [likeCount, setLikeCount] = useState(comment.like_count);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setLikeCount(comment.like_count);
    }, [comment.like_count]);

    const isOwner = comment.user?.id === currentUserId;

    const handleLike = async () => {
        if (processing) return;

        const prevLiked = liked;
        const prevLikeCount = likeCount;

        setLiked(!prevLiked);
        setLikeCount(prevLiked ? prevLikeCount - 1 : prevLikeCount + 1);
        setProcessing(true);

        try {
            const response = await fetch(`/comments/${comment.id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''
                    ),
                },
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
        if (!confirm('Delete this comment?')) return;

        onCommentDeleted(comment.id);

        try {
            await fetch(`/comments/${comment.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''
                    ),
                },
            });
        } catch {
            router.reload({ only: ['posts'] });
        }
    };

    return (
        <div className="_comment_main">
            <div className="_comment_image">
                <Avatar author={comment.user} size="sm" />
            </div>
            <div className="_comment_area">
                <div className="_comment_details">
                    <div className="_comment_details_top">
                        <div className="_comment_name">
                            <h4 className="_comment_name_title">
                                {comment.user ? comment.user.name : 'Unknown User'}
                            </h4>
                        </div>
                    </div>
                    <div className="_comment_status">
                        <p className="_comment_status_text">
                            <span>{comment.content}</span>
                        </p>
                    </div>
                    <div className="_total_reactions">
                        {likeCount > 0 && (
                            <div className="_total_react">
                                <span className="_reaction_like">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={liked ? '#1890FF' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                    </svg>
                                </span>
                            </div>
                        )}
                        {likeCount > 0 && <span className="_total">{likeCount}</span>}
                    </div>
                    <div className="_comment_reply">
                        <div className="_comment_reply_num">
                            <ul className="_comment_reply_list">
                                <li>
                                    <button
                                        type="button"
                                        onClick={handleLike}
                                        disabled={processing}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    >
                                        <span style={{ color: liked ? '#1890FF' : undefined }}>Like.</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => setShowReplyForm(v => !v)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    >
                                        <span>Reply.</span>
                                    </button>
                                </li>
                                {isOwner && (
                                    <li>
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                        >
                                            <span style={{ color: '#F5222D' }}>Delete.</span>
                                        </button>
                                    </li>
                                )}
                                <li><span className="_time_link">{timeAgo(comment.created_at)}</span></li>
                            </ul>
                        </div>
                    </div>

                    {showReplyForm && (
                        <div className="_feed_inner_comment_box" style={{ marginTop: 8 }}>
                            <CommentForm postPublicId={postPublicId} parentCommentId={comment.id} onCommentAdded={onReplyAdded} />
                        </div>
                    )}

                    {comment.reply_count > 0 && !showReplies && (
                        <button
                            type="button"
                            onClick={() => setShowReplies(true)}
                            className="_previous_comment_txt"
                            style={{ marginTop: 6, marginBottom: 4 }}
                        >
                            View {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
                        </button>
                    )}

                    {showReplies && comment.replies?.map(reply => (
                        <ReplyItem key={reply.id} reply={reply} currentUserId={currentUserId} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function ReplyItem({ reply, currentUserId }: { reply: Reply; currentUserId: number }) {
    const [liked, setLiked] = useState(reply.likes?.some(l => l.id === currentUserId));
    const [likeCount, setLikeCount] = useState(reply.like_count);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setLikeCount(reply.like_count);
    }, [reply.like_count]);

    const handleLike = async () => {
        if (processing) return;

        const prevLiked = liked;
        const prevLikeCount = likeCount;

        setLiked(!prevLiked);
        setLikeCount(prevLiked ? prevLikeCount - 1 : prevLikeCount + 1);
        setProcessing(true);

        try {
            const response = await fetch(`/comments/${reply.id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''
                    ),
                },
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

    return (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingLeft: 12 }}>
            <Avatar author={reply.user} size="sm" />
            <div style={{ flex: 1 }}>
                <div style={{ background: '#f5f5f5', borderRadius: 12, padding: '8px 12px' }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>
                        {reply.user ? reply.user.name : 'Unknown'}
                    </span>
                    {reply.reply_to_user && (
                        <span style={{ color: '#1890FF', fontSize: 13, marginLeft: 4 }}>
                            @{reply.reply_to_user.first_name}
                        </span>
                    )}
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: '#333' }}>{reply.content}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, paddingLeft: 4 }}>
                    <button
                        type="button"
                        onClick={handleLike}
                        disabled={processing}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12, fontWeight: 600 }}
                    >
                        <span style={{ color: liked ? '#1890FF' : '#666' }}>
                            Like{likeCount > 0 && ` ${likeCount}`}
                        </span>
                    </button>
                    <span style={{ color: '#999', fontSize: 12 }}>{timeAgo(reply.created_at)}</span>
                </div>
            </div>
        </div>
    );
}

export default function Post({ post }: PostProps) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [showComments, setShowComments] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [liked, setLiked] = useState(post.likes?.some(l => l.id === auth.user.id));
    const [likeCount, setLikeCount] = useState(post.like_count);
    const [commentCount, setCommentCount] = useState(post.comment_count);
    const [comments, setComments] = useState<Comment[]>(post.comments || []);
    const [processing, setProcessing] = useState(false);

    const currentUserId = auth.user.id as number;
    const isOwner = post.user_id === currentUserId;

    const addComment = useCallback((comment: Comment) => {
        setComments(prev => {
            if (prev.some(c => c.id === comment.id)) return prev;

            if (comment.parent_comment_id) {
                return prev.map(c =>
                    c.id === comment.parent_comment_id
                        ? { ...c, replies: [...(c.replies || []), comment as unknown as Reply], reply_count: c.reply_count + 1 }
                        : c
                );
            }

            return [...prev, comment];
        });
        setCommentCount(prev => prev + 1);
    }, []);

    const removeComment = useCallback((commentId: number) => {
        setComments(prev => {
            const found = prev.find(c => c.id === commentId);
            if (found) {
                return prev.filter(c => c.id !== commentId);
            }

            return prev.map(c => ({
                ...c,
                replies: c.replies.filter(r => r.id !== commentId),
            }));
        });
        setCommentCount(prev => Math.max(0, prev - 1));
    }, []);

    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.private(`post.${post.id}`);

        channel.listen('.CommentCreated', (e: { comment: Comment }) => {
            addComment(e.comment);
        });

        channel.listen('.CommentDeleted', (e: { comment_id: number }) => {
            removeComment(e.comment_id);
        });

        channel.listen('.PostLiked', (e: { like_count: number; liked_by_user_id: number }) => {
            setLikeCount(e.like_count);
            if (e.liked_by_user_id === currentUserId) {
                setLiked(true);
            }
        });

        channel.listen('.CommentLiked', (e: { comment_id: number; like_count: number }) => {
            setComments(prev =>
                prev.map(c => {
                    if (c.id === e.comment_id) {
                        return { ...c, like_count: e.like_count };
                    }
                    return {
                        ...c,
                        replies: c.replies.map(r =>
                            r.id === e.comment_id ? { ...r, like_count: e.like_count } : r
                        ),
                    };
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
            const response = await fetch(`/posts/${post.public_id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''
                    ),
                },
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
            const response = await fetch(`/posts/${post.public_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''
                    ),
                },
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

                {/* Media */}
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

            {/* Reaction buttons */}
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
                    onClick={() => setShowComments(v => !v)}
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

            {/* Comments section */}
            {showComments && (
                <div className="_feed_inner_timeline_cooment_area _padd_r24 _padd_l24">
                    <div className="_feed_inner_comment_box">
                        <CommentForm postPublicId={post.public_id} onCommentAdded={addComment} />
                    </div>

                    <div className="_timline_comment_main">
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    postPublicId={post.public_id}
                                    currentUserId={currentUserId}
                                    onCommentDeleted={removeComment}
                                    onReplyAdded={addComment}
                                />
                            ))
                        ) : (
                            <p style={{ color: '#999', fontSize: 13, padding: '8px 0' }}>No comments yet. Be the first!</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
