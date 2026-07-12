<?php

namespace App\DTOs;

final class CreateCommentData
{
    public function __construct(
        public readonly int $userId,
        public readonly int $postId,
        public readonly string $content,
        public readonly ?int $parentCommentId = null,
    ) {}

    public static function fromRequest(array $data, int $userId, int $postId): self
    {
        return new self(
            userId: $userId,
            postId: $postId,
            content: $data['content'],
            parentCommentId: $data['parent_comment_id'] ?? null,
        );
    }

    public function isReply(): bool
    {
        return $this->parentCommentId !== null;
    }
}
