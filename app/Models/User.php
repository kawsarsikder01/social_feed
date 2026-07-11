<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $public_id
 * @property string $first_name
 * @property string $last_name
 * @property string $avatar
 * @property string $status
 * @property string $email
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Post> $posts
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Comment> $comments
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Post> $likedPosts
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Comment> $likedComments
 */

#[Appends(['name'])]
#[Fillable(['public_id', 'first_name', 'last_name', 'email', 'avatar', 'status', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function getNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getRouteKeyName(): string
    {
        return 'public_id';
    }

    /**
     * @return HasMany<Post, $this>
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /**
     * @return HasMany<Comment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * @return BelongsToMany<Post, $this>
     */
    public function likedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_likes')->withTimestamps();
    }

    /**
     * @return BelongsToMany<Comment, $this>
     */
    public function likedComments(): BelongsToMany
    {
        return $this->belongsToMany(Comment::class, 'comment_likes')->withTimestamps();
    }
}
