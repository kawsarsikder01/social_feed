<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $post_id
 * @property string $file_path
 * @property string $media_type
 * @property string $mime_type
 * @property int $file_size
 * @property int|null $duration
 * @property int|null $width
 * @property int|null $height
 * @property int $position
 * @property Carbon|null $created_at
 * @property Post $post
 */
#[Fillable(['post_id', 'file_path', 'media_type', 'width', 'height', 'position', 'mime_type', 'file_size', 'duration'])]
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
