<?php

namespace App\Repositories\Contracts;

use App\Models\Post;
use Illuminate\Database\Eloquent\Collection;

interface PostRepositoryInterface
{
    public function findById(int $id): ?Post;

    public function findByPublicId(string $publicId): ?Post;

    public function getUserPosts(int $userId): Collection;

    public function getPublicPosts(): Collection;

    public function create(array $data): Post;

    public function update(Post $post, array $data): bool;

    public function delete(Post $post): bool;

    public function toggleLike(Post $post, int $userId): bool;
}
