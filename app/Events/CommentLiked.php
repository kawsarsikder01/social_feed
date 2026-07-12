<?php

namespace App\Events;

use App\Models\Comment;
use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentLiked implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Comment $comment,
        public readonly User $user,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('post.'.$this->comment->post_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'CommentLiked';
    }

    public function broadcastWith(): array
    {
        return [
            'comment_id' => $this->comment->id,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'like_count' => $this->comment->fresh()->like_count,
            'liked_by_user_id' => $this->user->id,
        ];
    }
}
