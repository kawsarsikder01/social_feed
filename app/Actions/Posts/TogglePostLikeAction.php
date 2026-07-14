<?php

namespace App\Actions\Posts;

use App\Events\PostLiked;
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TogglePostLikeAction
{
    public function execute(Post $post, User $user): bool
    {
        return DB::transaction(function () use ($post, $user) {
            $post = Post::query()
                ->lockForUpdate()
                ->findOrFail($post->id);

            $isLiked = $post->likes()
                ->where('user_id', $user->id)
                ->exists();

            if ($isLiked) {
                $post->likes()->detach($user->id);
                $post->decrement('like_count', 1);

                return false;
            }

            $post->likes()->attach($user->id);
            $post->increment('like_count', 1);

            event(new PostLiked($post, $user));

            return true;
        });
    }
}
