<?php

namespace App\Events;

use App\Models\Post;
use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PostLiked implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Post $post,
        public readonly User $user,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('post.'.$this->post->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'PostLiked';
    }

    public function broadcastWith(): array
    {
        return [
            'post_id' => $this->post->id,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'like_count' => $this->post->fresh()->like_count,
            'liked_by_user_id' => $this->user->id,
        ];
    }
}
