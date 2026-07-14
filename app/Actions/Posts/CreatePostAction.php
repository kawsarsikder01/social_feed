<?php

namespace App\Actions\Posts;

use App\DTOs\CreatePostData;
use App\Events\PostCreated;
use App\Models\Post;
use App\Models\PostMedia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CreatePostAction
{
    public function execute(CreatePostData $data): Post
    {
        return DB::transaction(function () use ($data) {
            $post = Post::create([
                'public_id' => (string) Str::uuid(),
                'user_id' => $data->userId,
                'content' => $data->content,
                'visibility' => $data->visibility,
                'like_count' => 0,
                'comment_count' => 0,
            ]);

            $position = 0;

            if (! empty($data->images)) {
                foreach ($data->images as $file) {
                    $path = $file->store('posts', 'public');

                    if (is_string($path)) {
                        PostMedia::create([
                            'post_id' => $post->id,
                            'file_path' => Storage::url($path),
                            'media_type' => 'image',
                            'mime_type' => $file->getMimeType(),
                            'file_size' => $file->getSize(),
                            'position' => $position++,
                        ]);
                    }
                }
            }

            if (! empty($data->videos)) {
                foreach ($data->videos as $file) {
                    $path = $file->store('posts', 'public');

                    if (is_string($path)) {
                        PostMedia::create([
                            'post_id' => $post->id,
                            'file_path' => Storage::url($path),
                            'media_type' => 'video',
                            'mime_type' => $file->getMimeType(),
                            'file_size' => $file->getSize(),
                            'position' => $position++,
                        ]);
                    }
                }
            }

            $post->load(['user', 'media']);

            DB::afterCommit(fn () => PostCreated::dispatch($post));

            return $post;
        });
    }
}
