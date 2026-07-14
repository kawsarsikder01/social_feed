<?php

namespace App\DTOs;

use App\Enums\PostVisibility;
use Illuminate\Http\UploadedFile;

final class CreatePostData
{
    /**
     * @param  array<int, UploadedFile>  $images
     * @param  array<int, UploadedFile>  $videos
     */
    public function __construct(
        public readonly int $userId,
        public readonly ?string $content,
        public readonly PostVisibility $visibility,
        public readonly array $images = [],
        public readonly array $videos = [],
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromRequest(array $data, int $userId): self
    {
        return new self(
            userId: $userId,
            content: $data['content'] ?? null,
            visibility: PostVisibility::from($data['visibility'] ?? 'public'),
            images: $data['images'] ?? [],
            videos: $data['videos'] ?? [],
        );
    }

    public function hasMedia(): bool
    {
        return count($this->images) > 0 || count($this->videos) > 0;
    }

    public function isEmpty(): bool
    {
        return empty($this->content) && ! $this->hasMedia();
    }
}
