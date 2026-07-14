<?php

namespace App\Events;

use App\Models\Post;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PostCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Post $post,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('post.'.$this->post->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'PostCreated';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $this->post->loadMissing([
            'user:id,public_id,first_name,last_name,avatar',
            'media:id,post_id,file_path,media_type,width,height,position',
        ]);

        $media = $this->post->media->map(fn ($m) => [
            'id' => $m->id,
            'file_path' => $m->file_path,
            'media_type' => $m->media_type,
            'width' => $m->width,
            'height' => $m->height,
            'position' => $m->position,
        ])->toArray();

        return [
            'post' => [
                'id' => $this->post->id,
                'public_id' => $this->post->public_id,
                'content' => $this->post->content,
                'visibility' => $this->post->visibility->value,
                'user' => [
                    'id' => $this->post->user->id,
                    'public_id' => $this->post->user->public_id,
                    'first_name' => $this->post->user->first_name,
                    'last_name' => $this->post->user->last_name,
                    'name' => $this->post->user->name,
                    'avatar' => $this->post->user->avatar,
                ],
                'media' => $media,
                'like_count' => $this->post->like_count,
                'comment_count' => $this->post->comment_count,
                'created_at' => $this->post->created_at->toISOString(),
            ],
        ];
    }
}
