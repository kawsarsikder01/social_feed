<?php

namespace App\Actions\Comments;

use App\DTOs\CreateCommentData;
use App\Events\CommentCreated;
use App\Models\Comment;
use App\Models\Post;

class CreateCommentAction
{
    public function execute(CreateCommentData $data, Post $post): Comment
    {
        $replyToUserId = null;

        if ($data->isReply()) {
            $parent = Comment::findOrFail($data->parentCommentId);
            $replyToUserId = $parent->user_id;
        }

        $comment = Comment::create([
            'post_id' => $post->id,
            'user_id' => $data->userId,
            'content' => $data->content,
            'parent_comment_id' => $data->parentCommentId,
            'reply_to_user_id' => $replyToUserId,
        ]);

        $post->increment('comment_count');

        if ($comment->parent_comment_id) {
            $comment->parent()->increment('reply_count');
        }

        event(new CommentCreated($comment));

        return $comment->load(['user', 'replyToUser']);
    }
}
