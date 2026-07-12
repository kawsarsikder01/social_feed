<?php

namespace App\Models;

use App\Enums\PostVisibility;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $public_id
 * @property int $user_id
 * @property string $content
 * @property PostVisibility $visibility
 * @property int $like_count
 * @property int $comment_count
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property User $user
 * @property-read Collection<int, PostMedia> $media
 * @property-read Collection<int, Comment> $comments
 * @property-read Collection<int, User> $likes
 */
#[Fillable(['public_id', 'user_id', 'content', 'visibility', 'like_count', 'comment_count'])]
class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'visibility' => PostVisibility::class,
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'public_id';
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<PostMedia, $this>
     */
    public function media(): HasMany
    {
        return $this->hasMany(PostMedia::class)->orderBy('position');
    }

    /**
     * @return HasMany<Comment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function likes(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'post_likes');
    }
}
