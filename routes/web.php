<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\PostController;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

Route::get('/migrate', function () {
   return Artisan::call('migrate', ['--force' => true]);
})->name('health');

RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

RateLimiter::for('posts', function (Request $request) {
    return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
});

RateLimiter::for('comments', function (Request $request) {
    return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
});

RateLimiter::for('likes', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

Route::middleware(['auth'])->group(function () {
    Route::get('/', [FeedController::class, 'index'])->name('feed');
    Route::get('/dashboard', [FeedController::class, 'index'])->name('dashboard');

    // Posts
    Route::post('/posts', [PostController::class, 'store'])
        ->middleware('throttle:posts')
        ->name('posts.store');
    Route::delete('/posts/{post}', [PostController::class, 'destroy'])
        ->middleware('throttle:posts')
        ->name('posts.destroy');
    Route::post('/posts/{post}/like', [PostController::class, 'toggleLike'])
        ->middleware('throttle:likes')
        ->name('posts.like');

    // Comments
    Route::get('/posts/{post}/comments', [CommentController::class, 'index'])
        ->name('comments.index');
    Route::post('/posts/{post}/comments', [CommentController::class, 'store'])
        ->middleware('throttle:comments')
        ->name('comments.store');
    Route::get('/comments/{comment}/replies', [CommentController::class, 'replies'])
        ->name('comments.replies');
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])
        ->middleware('throttle:comments')
        ->name('comments.destroy');
    Route::post('/comments/{comment}/like', [CommentController::class, 'toggleLike'])
        ->middleware('throttle:likes')
        ->name('comments.like');
});
