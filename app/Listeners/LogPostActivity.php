<?php

namespace App\Listeners;

use App\Events\PostCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class LogPostActivity implements ShouldQueue
{
    public function handle(PostCreated $event): void
    {
        Log::info('Post created', [
            'post_id' => $event->post->id,
            'user_id' => $event->post->user_id,
        ]);
    }
}
