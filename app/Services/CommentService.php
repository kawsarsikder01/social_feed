<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\CursorPaginator;

class CommentService
{
    private const PER_PAGE = 20;

    /**
     * @return CursorPaginator<int, Comment>
     */
    public function getTopLevelComments(Post $post, int $userId): CursorPaginator
    {
        return $this->baseQuery($userId)
            ->whereBelongsTo($post)
            ->whereNull('parent_comment_id')
            ->latest('created_at')
            ->latest('id')
            ->cursorPaginate(self::PER_PAGE);
    }

    /**
     * @return CursorPaginator<int, Comment>
     */
    public function getReplies(Comment $comment, int $userId): CursorPaginator
    {
        return $this->baseQuery($userId)
            ->where('parent_comment_id', $comment->id)
            ->oldest('created_at')
            ->oldest('id')
            ->cursorPaginate(self::PER_PAGE);
    }

    /**
     * @return Builder<Comment>
     */
    private function baseQuery(int $userId): Builder
    {
        return Comment::query()
            ->select([
                'id',
                'post_id',
                'user_id',
                'parent_comment_id',
                'reply_to_user_id',
                'content',
                'like_count',
                'reply_count',
                'created_at',
            ])
            ->withExists([
                'likes as liked_by_user' => fn (Builder $query) => $query->whereKey($userId),
            ])
            ->with([
                'user:id,public_id,first_name,last_name,avatar',
                'replyToUser:id,public_id,first_name,last_name,avatar',
            ]);
    }
}
