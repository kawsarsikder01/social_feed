<?php

namespace App\Http\Controllers;

use App\Services\PostService;
use Inertia\Inertia;
use Inertia\Response;

class FeedController extends Controller
{
    public function __construct(
        protected PostService $postService,
    ) {}

    public function index(): Response
    {
        $userId = auth()->id();
        $posts = $this->postService->getFeed($userId);

        return Inertia::render('feed', [
            'posts' => $posts,
        ]);
    }
}
