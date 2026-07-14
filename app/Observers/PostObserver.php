<?php

namespace App\Observers;

use App\Models\Post;
use App\Services\PostService;

class PostObserver
{
    public function __construct(
        protected PostService $postService,
    ) {}

    public function created(Post $post): void
    {
        $this->postService->clearUserCache($post->user_id);
    }

    public function updated(Post $post): void
    {
        $this->postService->clearUserCache($post->user_id);
    }

    public function deleted(Post $post): void
    {
        $this->postService->clearUserCache($post->user_id);
    }
}
