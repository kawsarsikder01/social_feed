<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $post_id
 * @property int $user_id
 * @property int|null $parent_comment_id
 * @property int|null $reply_to_user_id
 * @property string $content
 * @property int $like_count
 * @property int $reply_count
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 */

#[Fillable(['post_id', 'user_id', 'parent_comment_id', 'reply_to_user_id', 'content', 'like_count', 'reply_count'])]
class Comment extends Model
{
    use SoftDeletes;

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(Comment::class,'parent_comment_id');
    }

    public function replies()
    {
        return $this->hasMany(Comment::class,'parent_comment_id')->orderBy('created_at');
    }

    public function replyToUser()
    {
        return $this->belongsTo(User::class,'reply_to_user_id');
    }

    public function likes()
    {
        return $this->belongsToMany(User::class,'comment_likes')->withTimestamps();
    }
}
