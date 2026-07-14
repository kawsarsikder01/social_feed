<?php

namespace App\Events;

use App\Models\Comment;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentDeleted implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Comment $comment,
        /** @var list<int> */
        public readonly array $deletedCommentIds,
        public readonly int $postCommentCount,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('post.'.$this->comment->post_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'CommentDeleted';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'comment_ids' => $this->deletedCommentIds,
            'parent_comment_id' => $this->comment->parent_comment_id,
            'post_comment_count' => $this->postCommentCount,
        ];
    }
}
