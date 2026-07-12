<?php

namespace App\Actions\Comments;

use App\Events\CommentDeleted;
use App\Models\Comment;
use Illuminate\Support\Facades\DB;

class DeleteCommentAction
{
    public function execute(Comment $comment): bool
    {
        $post = $comment->post;
        $parentCommentId = $comment->parent_comment_id;

        $result = DB::transaction(function () use ($comment, $post, $parentCommentId) {
            $result = $comment->delete();

            $post->decrement('comment_count');

            if ($parentCommentId) {
                Comment::where('id', $parentCommentId)->decrement('reply_count');
            }

            return $result;
        });

        if ($result) {
            event(new CommentDeleted($comment));
        }

        return $result;
    }
}
