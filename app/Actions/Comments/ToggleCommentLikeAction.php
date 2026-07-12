<?php

namespace App\Actions\Comments;

use App\Events\CommentLiked;
use App\Models\Comment;
use App\Models\User;

class ToggleCommentLikeAction
{
    public function execute(Comment $comment, User $user): bool
    {
        $isLiked = $comment->likes()->where('user_id', $user->id)->exists();

        if ($isLiked) {
            $comment->likes()->detach($user->id);
            $comment->decrement('like_count');

            return false;
        }

        $comment->likes()->attach($user->id);
        $comment->increment('like_count');

        event(new CommentLiked($comment, $user));

        return true;
    }
}
