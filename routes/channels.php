<?php

use App\Models\Post;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('post.{postId}', function ($user, int $postId) {
    $post = Post::with('user')->find($postId);

    if (! $post) {
        return false;
    }

    if ($post->visibility === 'public') {
        return true;
    }

    return $post->user_id === $user->id;
});
