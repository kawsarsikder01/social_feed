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
            $path = str_replace('/storage/', '', $media->file_path);
            if ($disk->exists($path)) {
                $disk->delete($path);
            }
        }

        return $post->delete();
    }
}
