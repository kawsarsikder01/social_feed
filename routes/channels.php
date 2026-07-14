<?php

use App\Enums\PostVisibility;
use App\Models\Post;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('post.{postId}', function ($user, int $postId) {
    $post = Post::find($postId);

    if (! $post) {
        return false;
    }

    if ($post->visibility === PostVisibility::PUBLIC) {
        return true;
    }

    return $post->user_id === $user->id;
});
