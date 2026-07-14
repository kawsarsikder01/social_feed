<?php

namespace App\Listeners;

use App\Events\PostCreated;
use App\Models\User;
use App\Notifications\NewPostNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendPostNotification implements ShouldQueue
{
    public function handle(PostCreated $event): void
    {
        $post = $event->post;

        if ($post->visibility !== 'public') {
            return;
        }

        $followers = User::where('id', '!=', $post->user_id)
            ->where('status', 'active')
            ->limit(100)
            ->get();

        foreach ($followers as $follower) {
            $follower->notify(new NewPostNotification($post));
        }
    }
}
