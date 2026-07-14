<?php

namespace App\Http\Controllers;

use App\Actions\Comments\CreateCommentAction;
use App\Actions\Comments\DeleteCommentAction;
use App\Actions\Comments\ToggleCommentLikeAction;
use App\DTOs\CreateCommentData;
use App\Http\Requests\CreateCommentRequest;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth; 

class CommentController extends Controller
{
    public function store(CreateCommentRequest $request, Post $post): JsonResponse
    {

        $data = CreateCommentData::fromRequest(
            $request->validated(),
            Auth::id(),
            $post->id,
        );

        $comment = app(CreateCommentAction::class)->execute($data, $post);

        return response()->json([
            'message' => 'Comment added successfully.',
            'comment' => $comment,
        ], 201);
    }

    public function destroy(Comment $comment): JsonResponse
    {

        $post = $comment->post;

        app(DeleteCommentAction::class)->execute($comment);

        return response()->json([
            'message' => 'Comment deleted successfully.',
            'post_comment_count' => $post->fresh()->comment_count,
        ]);
    }

    public function toggleLike(Comment $comment): JsonResponse
    { 

        $liked = app(ToggleCommentLikeAction::class)
            ->execute($comment, Auth::user());

        return response()->json([
            'liked' => $liked,
            'like_count' => $comment->fresh()->like_count,
        ]);
    }
}
