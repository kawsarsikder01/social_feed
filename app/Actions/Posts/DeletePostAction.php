<?php

namespace App\Actions\Posts;

use App\Models\Post;
use Illuminate\Support\Facades\Storage;

class DeletePostAction
{
    public function execute(Post $post): bool
    {
        foreach ($post->media as $media) {
            $disk = Storage::disk('public');
            $path = ltrim($media->file_path, '/storage/');
            if ($disk->exists($path)) {
                $disk->delete($path);
            }
        }

        return $post->delete();
    }
}
