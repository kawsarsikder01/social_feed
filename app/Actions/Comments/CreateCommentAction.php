<?php

namespace App\Actions\Comments;

use App\DTOs\CreateCommentData;
use App\Events\CommentCreated;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Support\Facades\DB;

class CreateCommentAction
{
    public function execute(CreateCommentData $data, Post $post): Comment
    {
        $comment = DB::transaction(function () use ($data, $post) {
            $replyToUserId = null;

            if ($data->isReply()) {
                $parent = Comment::query()
                    ->whereKey($data->parentCommentId)
                    ->whereBelongsTo($post)
                    ->whereNull('parent_comment_id')
                    ->lockForUpdate()
                    ->firstOrFail();

                $replyToUserId = $parent->user_id;
                $parent->increment('reply_count');
            }

            $comment = Comment::create([
                'post_id' => $post->id,
                'user_id' => $data->userId,
                'content' => $data->content,
                'parent_comment_id' => $data->parentCommentId,
                'reply_to_user_id' => $replyToUserId,
            ]);

            $post->increment('comment_count');

            return $comment;
        });

        $comment->load([
            'user:id,public_id,first_name,last_name,avatar',
            'replyToUser:id,public_id,first_name,last_name,avatar',
        ]);

        event(new CommentCreated($comment));

        return $comment;
    }
}
