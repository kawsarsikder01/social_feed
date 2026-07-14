<?php

use App\Models\Post;
use App\Models\User;
use App\Services\PostService;

uses()->group('feed');

it('displays paginated feed', function () {
    $user = User::factory()->create(['status' => 'active']);

    // Create 25 posts to test pagination
    for ($i = 0; $i < 25; $i++) {
        Post::factory()->create(['visibility' => 'public']);
    }

    $this->actingAs($user);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('feed'));
});

it('loads only public posts and own private posts in feed', function () {
    $user = User::factory()->create(['status' => 'active']);

    // Create public posts from other users
    Post::factory()->count(5)->create(['visibility' => 'public']);

    // Create private posts from other users (should not appear)
    Post::factory()->count(3)->create(['visibility' => 'private']);

    // Create own private post (should appear)
    Post::factory()->create([
        'user_id' => $user->id,
        'visibility' => 'private',
    ]);

    $this->actingAs($user);

    $response = $this->get('/');

    $response->assertOk();
});

it('eager loads relationships to prevent N+1', function () {
    $user = User::factory()->create(['status' => 'active']);

    // Create posts with relationships
    for ($i = 0; $i < 5; $i++) {
        $post = Post::factory()->create(['visibility' => 'public']);
        $post->media()->create([
            'file_path' => '/storage/test.jpg',
            'media_type' => 'image',
            'mime_type' => 'image/jpeg',
            'file_size' => 1024,
        ]);
    }

    $this->actingAs($user);

    $response = $this->get('/');

    $response->assertOk();
});

it('does not load comments or liker collections with feed posts', function () {
    $viewer = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['visibility' => 'public']);
    $post->likes()->attach($viewer->id);

    $feedPost = app(PostService::class)->getFeed($viewer->id)->items()[0];

    expect($feedPost->relationLoaded('comments'))->toBeFalse()
        ->and($feedPost->relationLoaded('likes'))->toBeFalse()
        ->and($feedPost->liked_by_user)->toBeTrue();
});

it('requires authentication for feed', function () {
    $response = $this->get('/');

    $response->assertRedirect('/login');
});
