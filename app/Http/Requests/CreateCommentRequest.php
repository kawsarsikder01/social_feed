<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:2000'],
            'parent_comment_id' => ['nullable', 'integer', 'exists:comments,id'],
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
