<?php

namespace App\Actions\Comments;

use App\Events\CommentDeleted;
use App\Models\Comment;
use Illuminate\Support\Facades\DB;

class DeleteCommentAction
{
    /**
     * @return array{deleted_comment_ids: list<int>, post_comment_count: int}
     */
    public function execute(Comment $comment): array
    {
        $result = DB::transaction(function () use ($comment) {
            $post = $comment->post()->lockForUpdate()->firstOrFail();

            $comments = Comment::query()
                ->whereKey($comment->id)
                ->orWhere('parent_comment_id', $comment->id)
                ->lockForUpdate()
                ->get(['id']);

            $deletedCommentIds = $comments->modelKeys();

            Comment::query()->whereKey($deletedCommentIds)->delete();

            $post->decrement('comment_count', count($deletedCommentIds));

            if ($comment->parent_comment_id !== null) {
                Comment::query()
                    ->whereKey($comment->parent_comment_id)
                    ->decrement('reply_count');
            }

            return [
                'deleted_comment_ids' => $deletedCommentIds,
                'post_comment_count' => $post->fresh()->comment_count,
            ];
        });

        event(new CommentDeleted($comment, $result['deleted_comment_ids'], $result['post_comment_count']));

        return $result;
    }
}
