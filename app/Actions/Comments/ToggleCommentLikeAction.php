<?php

namespace App\Actions\Comments;

use App\Events\CommentLiked;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ToggleCommentLikeAction
{
    public function execute(Comment $comment, User $user): bool
    {
        $result = DB::transaction(function () use ($comment, $user) {
            $lockedComment = Comment::query()->lockForUpdate()->findOrFail($comment->id);
            $isLiked = $lockedComment->likes()->whereKey($user->id)->exists();

            if ($isLiked) {
                $lockedComment->likes()->detach($user->id);
                $lockedComment->decrement('like_count');

                return [$lockedComment, false];
            }

            $lockedComment->likes()->attach($user->id);
            $lockedComment->increment('like_count');

            return [$lockedComment, true];
        });

        event(new CommentLiked($result[0], $user, $result[1]));

        return $result[1];
    }
}
