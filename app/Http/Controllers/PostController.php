<?php

namespace App\Http\Controllers;

use App\Actions\Posts\CreatePostAction;
use App\Actions\Posts\DeletePostAction;
use App\Actions\Posts\TogglePostLikeAction;
use App\DTOs\CreatePostData;
use App\Http\Requests\CreatePostRequest;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PostController extends Controller
{
    public function store(CreatePostRequest $request): RedirectResponse|Response
    {
        $data = CreatePostData::fromRequest(
            $request->validated(),
            (int) Auth::id(),
        );

        if ($data->isEmpty()) {
            return back()->withErrors([
                'content' => 'Post cannot be empty. Please add content or media.',
            ]);
        }

        app(CreatePostAction::class)->execute($data);

        return Inertia::location('/');
    }

    public function destroy(Post $post): JsonResponse
    {
        $this->authorize('delete', $post);

        app(DeletePostAction::class)->execute($post);

        return response()->json([
            'message' => 'Post deleted successfully.',
        ]);
    }

    public function toggleLike(Post $post): JsonResponse
    {
        abort_unless($post->isVisibleToUser(Auth::user()), 403);

        $liked = app(TogglePostLikeAction::class)
            ->execute($post, Auth::user());

        return response()->json([
            'liked' => $liked,
            'like_count' => $post->fresh()->like_count,
        ]);
    }
}
