<?php

namespace App\Http\Controllers;

use App\Actions\Comments\CreateCommentAction;
use App\Actions\Comments\DeleteCommentAction;
use App\Actions\Comments\ToggleCommentLikeAction;
use App\DTOs\CreateCommentData;
use App\Http\Requests\CreateCommentRequest;
use App\Models\Comment;
use App\Models\Post;
use App\Services\CommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function index(Post $post, CommentService $commentService): JsonResponse
    {
        return response()->json(
            $commentService->getTopLevelComments($post, Auth::id()),
        );
    }

    public function store(CreateCommentRequest $request, Post $post): JsonResponse
    {

        $data = CreateCommentData::fromRequest(
            $request->validated(),
            Auth::id(),
            $post->id,
        );

        $comment = app(CreateCommentAction::class)->execute($data, $post);
        $comment->setAttribute('liked_by_user', false);

        return response()->json([
            'message' => 'Comment added successfully.',
            'comment' => $comment,
            'post_comment_count' => $post->fresh()->comment_count,
            'parent_reply_count' => $comment->parent_comment_id === null
                ? null
                : $comment->parent()->value('reply_count'),
        ], 201);
    }

    public function replies(Comment $comment, CommentService $commentService): JsonResponse
    {
        return response()->json(
            $commentService->getReplies($comment, Auth::id()),
        );
    }

    public function destroy(Comment $comment): JsonResponse
    {

        abort_unless($comment->user_id === Auth::id(), 403);

        $result = app(DeleteCommentAction::class)->execute($comment);

        return response()->json([
            'message' => 'Comment deleted successfully.',
            ...$result,
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
