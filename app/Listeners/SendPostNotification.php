<?php

namespace App\Listeners;

use App\Enums\PostVisibility;
use App\Events\PostCreated;
use App\Models\User;
use App\Notifications\NewPostNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;

class SendPostNotification implements ShouldQueue
{
    public function handle(PostCreated $event): void
    {
        $post = $event->post;

        if ($post->visibility !== PostVisibility::PUBLIC) {
            return;
        }

        $author = User::query()->find($post->user_id);

        if ($author === null) {
            return;
        }

        Notification::send($author, new NewPostNotification($post));
    }
}
