<?php

namespace App\Http\Controllers;

use App\Actions\Posts\CreatePostAction;
use App\Actions\Posts\DeletePostAction;
use App\Actions\Posts\TogglePostLikeAction;
use App\DTOs\CreatePostData;
use App\Http\Requests\CreatePostRequest;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    public function store(CreatePostRequest $request)
    {
        Gate::authorize('create', Post::class);

        $data = CreatePostData::fromRequest(
            $request->validated(),
            Auth::id(),
        );

        if ($data->isEmpty()) {
            return back()->withErrors([
                'content' => 'Post cannot be empty. Please add content or media.',
            ]);
        }

        app(CreatePostAction::class)->execute($data);

        return back();
    }

    public function destroy(Post $post): JsonResponse
    {
        Gate::authorize('delete', $post);

        app(DeletePostAction::class)->execute($post);

        return response()->json([
            'message' => 'Post deleted successfully.',
        ]);
    }

    public function toggleLike(Post $post): JsonResponse
    {
        Gate::authorize('like', $post);

        $liked = app(TogglePostLikeAction::class)
            ->execute($post, Auth::user());

        return response()->json([
            'liked' => $liked,
            'like_count' => $post->fresh()->like_count,
        ]);
    }
}
