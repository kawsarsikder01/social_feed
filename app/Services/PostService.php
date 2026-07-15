<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class PostService
{
    /**
     * @return LengthAwarePaginator<int, Post>
     */
    public function getFeed(int $userId, int $perPage = 10): LengthAwarePaginator
    {
        return Post::query()
            ->select([
                'id',
                'public_id',
                'user_id',
                'content',
                'visibility',
                'like_count',
                'comment_count',
                'created_at',
            ])
            ->where(function (Builder $query) use ($userId) {
                $query->where('visibility', 'public')
                    ->orWhere('user_id', $userId);
            })
            ->withExists([
                'likes as liked_by_user' => fn (Builder $query) => $query->whereKey($userId),
            ])
            ->with([
                'user:id,public_id,first_name,last_name,avatar',
                'media:id,post_id,file_path,media_type,width,height,position',
            ])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /**
     * @return array<int, mixed>
     */
    public function getRecentPostsForUser(int $userId, int $limit = 10): array
    {
        return Cache::remember("user_recent_posts_{$userId}", 60, function () use ($userId, $limit) {
            return Post::query()->where('user_id', $userId)
                ->with(['media:id,post_id,file_path,media_type,width,height,position'])
                ->orderByDesc('created_at')
                ->limit($limit)
                
                ->get()
                ->toArray();
        });
    }

    public function clearUserCache(int $userId): void
    {
        Cache::forget("user_recent_posts_{$userId}");
    }
}
