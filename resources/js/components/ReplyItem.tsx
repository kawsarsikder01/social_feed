import { useState, useEffect } from 'react';
import Avatar from './Avatar';
import { getJsonHeaders } from './Post/utils';
import type { Reply, ApiResponse } from './Post/types';
import { timeAgo } from '@/types';
import { toggleLike } from '@/actions/App/Http/Controllers/CommentController';

interface ReplyItemProps {
    reply: Reply;
    currentUserId: number;
    onLikeChanged?: (replyId: number, liked: boolean, likeCount: number) => void;
}

export default function ReplyItem({ reply, currentUserId, onLikeChanged }: ReplyItemProps) {
    const [liked, setLiked] = useState(reply.liked_by_user);
    const [likeCount, setLikeCount] = useState(reply.like_count);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setLikeCount(reply.like_count);
    }, [reply.like_count]);

    useEffect(() => {
        setLiked(reply.liked_by_user);
    }, [reply.liked_by_user]);

    const handleLike = async () => {
        if (processing) return;

        const prevLiked = liked;
        const prevLikeCount = likeCount;
        const nextLiked = !prevLiked;
        const nextLikeCount = prevLiked ? prevLikeCount - 1 : prevLikeCount + 1;

        setLiked(nextLiked);
        setLikeCount(nextLikeCount);
        onLikeChanged?.(reply.id, nextLiked, nextLikeCount);
        setProcessing(true);

        try {
            const response = await fetch(toggleLike.url(reply.id), {
                method: 'POST',
                headers: getJsonHeaders(),
            });

            const data: ApiResponse = await response.json();

            if (response.ok && data.liked !== undefined && data.like_count !== undefined) {
                setLiked(data.liked);
                setLikeCount(data.like_count);
                onLikeChanged?.(reply.id, data.liked, data.like_count);
            } else {
                setLiked(prevLiked);
                setLikeCount(prevLikeCount);
                onLikeChanged?.(reply.id, prevLiked, prevLikeCount);
            }
        } catch {
            setLiked(prevLiked);
            setLikeCount(prevLikeCount);
            onLikeChanged?.(reply.id, prevLiked, prevLikeCount);
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
