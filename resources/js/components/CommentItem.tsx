import { useState } from 'react';
import { destroy, replies, toggleLike } from '@/actions/App/Http/Controllers/CommentController';
import { timeAgo } from '@/types';
import Avatar from './Avatar';
import CommentForm from './CommentForm';
import type { Comment, Reply, ApiResponse, CursorPaginated } from './Post/types';
import { getJsonHeaders } from './Post/utils';
import ReplyItem from './ReplyItem';

interface CommentItemProps {
    comment: Comment;
    postPublicId: string;
    currentUserId: number;
    onCommentDeleted: (commentIds: number[], postCommentCount: number) => void;
    onReplyAdded: (comment: Comment, postCommentCount: number, parentReplyCount: number | null) => void;
    onLikeChanged?: (commentId: number, liked: boolean, likeCount: number) => void;
}

export default function CommentItem({ comment, postPublicId, currentUserId, onCommentDeleted, onReplyAdded, onLikeChanged }: CommentItemProps) {
    const [showReplies, setShowReplies] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [liked, setLiked] = useState(comment.liked_by_user);
    const [likeCount, setLikeCount] = useState(comment.like_count);
    const [processing, setProcessing] = useState(false);
    const [repliesList, setRepliesList] = useState<Reply[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loadingReplies, setLoadingReplies] = useState(false);

    const isOwner = comment.user?.id === currentUserId;

    const handleLike = async () => {
        if (processing) {
return;
}

        const prevLiked = liked;
        const prevLikeCount = likeCount;
        const nextLiked = !prevLiked;
        const nextLikeCount = prevLiked ? prevLikeCount - 1 : prevLikeCount + 1;

        setLiked(nextLiked);
        setLikeCount(nextLikeCount);
        onLikeChanged?.(comment.id, nextLiked, nextLikeCount);
        setProcessing(true);

        try {
            const response = await fetch(toggleLike.url(comment.id), {
                method: 'POST',
                headers: getJsonHeaders(),
            });

            const data: ApiResponse = await response.json();

            if (response.ok && data.liked !== undefined && data.like_count !== undefined) {
                setLiked(data.liked);
                setLikeCount(data.like_count);
                onLikeChanged?.(comment.id, data.liked, data.like_count);
            } else {
                setLiked(prevLiked);
                setLikeCount(prevLikeCount);
                onLikeChanged?.(comment.id, prevLiked, prevLikeCount);
            }
        } catch {
            setLiked(prevLiked);
            setLikeCount(prevLikeCount);
            onLikeChanged?.(comment.id, prevLiked, prevLikeCount);
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this comment?')) {
return;
}

        try {
            const response = await fetch(destroy.url(comment.id), {
                method: 'DELETE',
                headers: getJsonHeaders(),
            });

            const data: ApiResponse = await response.json();

            if (response.ok && data.deleted_comment_ids && data.post_comment_count !== undefined) {
                onCommentDeleted(data.deleted_comment_ids, data.post_comment_count);
            }
        } catch {
            alert('Network error. Please check your connection and try again.');
        }
    };

    const loadReplies = async (cursor: string | null = null) => {
        if (loadingReplies) {
return;
}

        setLoadingReplies(true);

        try {
            const response = await fetch(replies.url(comment.id, {
                query: cursor ? { cursor } : {},
            }));

            if (!response.ok) {
return;
}

            const page: CursorPaginated<Reply> = await response.json();
            setRepliesList(previous => {
                const fetchedReplyIds = new Set(page.data.map(reply => reply.id));
                const localReplies = previous.filter(reply => !fetchedReplyIds.has(reply.id));

                return cursor ? [...previous, ...page.data.filter(reply => !previous.some(item => item.id === reply.id))] : [...localReplies, ...page.data];
            });
            setNextCursor(page.next_cursor);
            setShowReplies(true);
        } finally {
            setLoadingReplies(false);
        }
    };

    const handleReplyAdded = (reply: Comment, postCommentCount: number, parentReplyCount: number | null) => {
        setRepliesList(previous => previous.some(item => item.id === reply.id) ? previous : [...previous, reply]);
        setShowReplies(true);
        onReplyAdded(reply, postCommentCount, parentReplyCount);
    };

    const handleReplyLikeChanged = (replyId: number, liked: boolean, likeCount: number) => {
        setRepliesList(previous => previous.map(reply => (
            reply.id === replyId
                ? { ...reply, liked_by_user: liked, like_count: likeCount }
                : reply
        )));
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
                            <CommentForm postPublicId={postPublicId} parentCommentId={comment.id} onCommentAdded={handleReplyAdded} />
                        </div>
                    )}

                    {comment.reply_count > 0 && !showReplies && (
                        <button
                            type="button"
                            onClick={() => void loadReplies()}
                            className="_previous_comment_txt"
                            style={{ marginTop: 6, marginBottom: 4 }}
                        >
                            View {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
                        </button>
                    )}

                    {showReplies && repliesList.map((reply) => (
                        <ReplyItem key={reply.id} reply={reply} onLikeChanged={handleReplyLikeChanged} />
                    ))}
                    {showReplies && nextCursor && (
                        <button
                            type="button"
                            className="_previous_comment_txt"
                            disabled={loadingReplies}
                            onClick={() => void loadReplies(nextCursor)}
                        >
                            {loadingReplies ? 'Loading replies...' : 'View more replies'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
