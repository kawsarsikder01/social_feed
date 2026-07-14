<?php

namespace App\Http\Requests;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Foundation\Http\FormRequest;

class CreateCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $post = $this->route('post');

        return [
            'content' => ['required', 'string', 'max:2000'],
            'parent_comment_id' => [
                'nullable',
                'integer',
                'exists:comments,id',
                function ($attribute, $value, $fail) use ($post) {
                    if (! $post instanceof Post) {
                        return;
                    }

                    /** @var Comment|null $parentComment */
                    $parentComment = Comment::find($value);

                    if ($parentComment === null) {
                        return;
                    }

                    if ($parentComment->post_id !== $post->id) {
                        $fail('The parent comment does not belong to this post.');
                    }

                    if ($parentComment->parent_comment_id !== null) {
                        $fail('Only top-level comments can be replied to.');
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => 'Please enter a comment.',
            'content.max' => 'Comment cannot exceed 2,000 characters.',
            'parent_comment_id.exists' => 'The parent comment does not exist.',
        ];
    }
}
