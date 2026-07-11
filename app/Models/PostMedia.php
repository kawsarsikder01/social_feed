<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $post_id
 * @property string $file_path
 * @property string $media_type
 * @property int|null $width
 * @property int|null $height
 * @property int $position
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property Post $post
 */

#[Fillable(['post_id', 'file_path', 'media_type', 'width', 'height', 'position'])]
class PostMedia extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Post, $this>
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
