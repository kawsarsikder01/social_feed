export interface PostMediaItem {
    id: number;
    file_path: string;
    media_type: 'image' | 'video';
    width?: number;
    height?: number;
    position: number;
}

export interface CommentUser {
    id: number;
    public_id: string;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface Reply {
    id: number;
    content: string;
    user: CommentUser | null;
    reply_to_user: CommentUser | null;
    like_count: number;
    liked_by_user: boolean;
    created_at: string;
}

export interface Comment {
    id: number;
    content: string;
    user: CommentUser | null;
    reply_to_user: CommentUser | null;
    like_count: number;
    reply_count: number;
    liked_by_user: boolean;
    parent_comment_id: number | null;
    created_at: string;
}

export interface PostUser {
    id: number;
    public_id: string;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface PostData {
    id: number;
    public_id: string;
    user_id: number;
    user: PostUser | null;
    content: string | null;
    visibility: 'public' | 'private';
    like_count: number;
    comment_count: number;
    liked_by_user: boolean;
    media: PostMediaItem[];
    created_at: string;
}

export interface CursorPaginated<T> {
    data: T[];
    next_cursor: string | null;
    next_cursor_url: string | null;
}

export interface ApiResponse {
    message?: string;
    comment?: Comment;
    liked?: boolean;
    like_count?: number;
    post_comment_count?: number;
    parent_reply_count?: number | null;
    deleted_comment_ids?: number[];
    errors?: Record<string, string[]>;
}
