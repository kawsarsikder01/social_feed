import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { store as storeComment } from '@/actions/App/Http/Controllers/CommentController';
import type { User } from '@/types/auth';
import Avatar from './Avatar';
import type { Comment, ApiResponse } from './Post/types';
import { getJsonHeaders } from './Post/utils';

interface CommentFormProps {
    postPublicId: string;
    parentCommentId?: number;
    onCommentAdded?: (comment: Comment, postCommentCount: number, parentReplyCount: number | null) => void;
}

export default function CommentForm({ postPublicId, parentCommentId, onCommentAdded }: CommentFormProps) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmed = content.trim();

        if (!trimmed) {
return;
}

        setProcessing(true);
        setError(null);

        try {
            const response = await fetch(storeComment.url(postPublicId), {
                method: 'POST',
                headers: getJsonHeaders(),
                body: JSON.stringify({
                    content: trimmed,
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

            setContent('');

            if (onCommentAdded && data.comment && data.post_comment_count !== undefined) {
                onCommentAdded(data.comment, data.post_comment_count, data.parent_reply_count ?? null);
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
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
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
