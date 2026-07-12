<?php

namespace App\Repositories;

use App\Models\Post;
use App\Repositories\Contracts\PostRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class PostRepository implements PostRepositoryInterface
{
    public function __construct(
        protected Post $model,
    ) {}

    public function findById(int $id): ?Post
    {
        return $this->model->find($id);
    }

    public function findByPublicId(string $publicId): ?Post
    {
        return $this->model->where('public_id', $publicId)->first();
    }

    public function getUserPosts(int $userId): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->with(['media', 'user'])
            ->orderByDesc('created_at')
            ->get();
    }

    public function getPublicPosts(): Collection
    {
        return $this->model
            ->where('visibility', 'public')
            ->with(['media', 'user'])
            ->orderByDesc('created_at')
            ->get();
    }

    public function create(array $data): Post
    {
        return $this->model->create($data);
    }

    public function update(Post $post, array $data): bool
    {
        return $post->update($data);
    }

    public function delete(Post $post): bool
    {
        return $post->delete();
    }

    public function toggleLike(Post $post, int $userId): bool
    {
        $isLiked = $post->likes()->where('user_id', $userId)->exists();

        if ($isLiked) {
            $post->likes()->detach($userId);
            $post->decrement('like_count');

            return false;
        }

        $post->likes()->attach($userId);
        $post->increment('like_count');

        return true;
    }
}
