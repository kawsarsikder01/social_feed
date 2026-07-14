<?php

namespace App\Events;

use App\Models\Comment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Comment $comment,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('post.'.$this->comment->post_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'CommentCreated';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $this->comment->loadMissing(['user', 'replyToUser']);

        $postCommentCount = $this->comment->post()->value('comment_count');
        $parentReplyCount = $this->comment->parent_comment_id === null
            ? null
            : $this->comment->parent()->value('reply_count');

        return [
            'comment' => [
                'id' => $this->comment->id,
                'content' => $this->comment->content,
                'user' => [
                    'id' => $this->comment->user->id,
                    'public_id' => $this->comment->user->public_id,
                    'first_name' => $this->comment->user->first_name,
                    'last_name' => $this->comment->user->last_name,
                    'name' => $this->comment->user->name,
                    'avatar' => $this->comment->user->avatar,
                ],
                'reply_to_user' => $this->comment->replyToUser ? [
                    'id' => $this->comment->replyToUser->id,
                    'public_id' => $this->comment->replyToUser->public_id,
                    'first_name' => $this->comment->replyToUser->first_name,
                    'last_name' => $this->comment->replyToUser->last_name,
                    'name' => $this->comment->replyToUser->name,
                    'avatar' => $this->comment->replyToUser->avatar,
                ] : null,
                'like_count' => $this->comment->like_count,
                'reply_count' => $this->comment->reply_count,
                'liked_by_user' => false,
                'parent_comment_id' => $this->comment->parent_comment_id,
                'created_at' => $this->comment->created_at->toISOString(),
            ],
            'post_comment_count' => $postCommentCount,
            'parent_reply_count' => $parentReplyCount,
        ];
    }
}
