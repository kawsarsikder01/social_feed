<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePostRequest extends FormRequest
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
        return [
            'content' => ['nullable', 'string', 'max:10000'],
            'visibility' => ['required', 'in:public,private'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['required', 'image', 'max:10240'],
            'videos' => ['nullable', 'array', 'max:3'],
            'videos.*' => ['required', 'file', 'mimetypes:video/mp4,video/quicktime,video/ogg,video/webm', 'max:51200'],
        ];
    }

    public function messages(): array
    {
        return [
            'content.max' => 'Post content cannot exceed 10,000 characters.',
            'visibility.required' => 'Please select a visibility option.',
            'visibility.in' => 'Visibility must be either public or private.',
            'images.array' => 'Please select valid images.',
            'images.*.image' => 'Each file must be a valid image.',
            'images.*.max' => 'Each image must be less than 10MB.',
            'videos.array' => 'Please select valid videos.',
            'videos.*.file' => 'Each file must be a valid video.',
            'videos.*.max' => 'Each video must be less than 50MB.',
        ];
    }
}
