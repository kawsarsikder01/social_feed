<?php

namespace App\Actions\Posts;

use App\Events\PostLiked;
use App\Models\Post;
use App\Models\User;

class TogglePostLikeAction
{
    public function execute(Post $post, User $user): bool
    {
        $isLiked = $post->likes()->where('user_id', $user->id)->exists();

        if ($isLiked) {
            $post->likes()->detach($user->id);
            $post->decrement('like_count');

            return false;
        }

        $post->likes()->attach($user->id);
        $post->increment('like_count');

        event(new PostLiked($post, $user));

        return true;
    }
}
