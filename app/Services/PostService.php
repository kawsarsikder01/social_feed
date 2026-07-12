<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Support\Facades\Cache;

class PostService
{
    public function getFeed(int $userId, int $perPage = 20): CursorPaginator
    {
        return Post::query()
            ->where(function (Builder $query) use ($userId) {
                $query->where('visibility', 'public')
                    ->orWhere('user_id', $userId);
            })
            ->with([
                'user:id,public_id,first_name,last_name,avatar',
                'media:id,post_id,file_path,media_type,width,height,position',
                'likes:id',
                'comments' => function ($query) {
                    $query->whereNull('parent_comment_id')
                        ->orderBy('created_at', 'desc')
                        ->with([
                            'user:id,public_id,first_name,last_name,avatar',
                            'likes:id',
                            'replies' => function ($query) {
                                $query->with([
                                    'user:id,public_id,first_name,last_name,avatar',
                                    'likes:id',
                                    'replyToUser:id,first_name,last_name',
                                ]);
                            },
                        ]);
                },
            ])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->cursorPaginate($perPage);
    }

    public function getPostWithPublicId(string $publicId): ?Post
    {
        return Post::with([
            'user:id,public_id,first_name,last_name,avatar',
            'media:id,post_id,file_path,media_type,width,height,position',
            'likes:id',
            'comments' => function ($query) {
                $query->whereNull('parent_comment_id')
                    ->orderBy('created_at', 'desc')
                    ->with([
                        'user:id,public_id,first_name,last_name,avatar',
                        'likes:id',
                        'replies' => function ($query) {
                            $query->with([
                                'user:id,public_id,first_name,last_name,avatar',
                                'likes:id',
                                'replyToUser:id,first_name',
                            ]);
                        },
                    ]);
            },
        ])->where('public_id', $publicId)->first();
    }

    public function getRecentPostsForUser(int $userId, int $limit = 10): array
    {
        return Cache::remember("user_recent_posts_{$userId}", 60, function () use ($userId, $limit) {
            return Post::where('user_id', $userId)
                ->with(['media:id,post_id,file_path,media_type,position'])
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
