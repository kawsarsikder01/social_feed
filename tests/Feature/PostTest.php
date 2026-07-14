<?php

use App\Events\PostCreated;
use App\Listeners\SendPostNotification;
use App\Models\Post;
use App\Models\User;
use App\Notifications\NewPostNotification;
use Illuminate\Support\Facades\Notification;

uses()->group('posts');

it('can create a post with content', function () {
    $user = User::factory()->create(['status' => 'active']);
    $this->actingAs($user);

    $response = $this->post('/posts', [
        'content' => 'This is a test post',
        'visibility' => 'public',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('posts', [
        'user_id' => $user->id,
        'content' => 'This is a test post',
        'visibility' => 'public',
    ]);
});

it('can create a private post', function () {
    $user = User::factory()->create(['status' => 'active']);
    $this->actingAs($user);

    $response = $this->post('/posts', [
        'content' => 'Private post content',
        'visibility' => 'private',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('posts', [
        'user_id' => $user->id,
        'visibility' => 'private',
    ]);
});

it('validates post content length', function () {
    $user = User::factory()->create(['status' => 'active']);
    $this->actingAs($user);

    $response = $this->post('/posts', [
        'content' => str_repeat('a', 10001),
        'visibility' => 'public',
    ]);

    $response->assertSessionHasErrors(['content']);
});

it('validates visibility field', function () {
    $user = User::factory()->create(['status' => 'active']);
    $this->actingAs($user);

    $response = $this->post('/posts', [
        'content' => 'Test post',
        'visibility' => 'invalid',
    ]);

    $response->assertSessionHasErrors(['visibility']);
});

it('requires either content or media', function () {
    $user = User::factory()->create(['status' => 'active']);
    $this->actingAs($user);

    $response = $this->post('/posts', [
        'visibility' => 'public',
    ]);

    $response->assertSessionHasErrors();
});

it('can delete own post', function () {
    $user = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['user_id' => $user->id]);
    $this->actingAs($user);

    $response = $this->deleteJson("/posts/{$post->public_id}");

    $response->assertOk()
        ->assertJson(['message' => 'Post deleted successfully.']);

    $this->assertSoftDeleted('posts', ['id' => $post->id]);
});

it('cannot delete other users post', function () {
    $user = User::factory()->create(['status' => 'active']);
    $otherUser = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['user_id' => $otherUser->id]);
    $this->actingAs($user);

    $response = $this->deleteJson("/posts/{$post->public_id}");

    $response->assertStatus(403);
});

it('sends a notification only to the post owner for public posts', function () {
    Notification::fake();

    $author = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create([
        'user_id' => $author->id,
        'visibility' => 'public',
    ]);

    $listener = new SendPostNotification;
    $listener->handle(new PostCreated($post));

    Notification::assertSentTo($author, NewPostNotification::class);
});

it('can toggle like on post', function () {
    $user = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['user_id' => $user->id]);
    $this->actingAs($user);

    $response = $this->postJson("/posts/{$post->public_id}/like");

    $response->assertOk()
        ->assertJson([
            'liked' => true,
            'like_count' => 1,
        ]);

    $this->assertDatabaseHas('post_likes', [
        'post_id' => $post->id,
        'user_id' => $user->id,
    ]);
});

it('can unlike a liked post', function () {
    $user = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['user_id' => $user->id]);
    $post->likes()->attach($user->id);
    $post->increment('like_count');
    $this->actingAs($user);

    $response = $this->postJson("/posts/{$post->public_id}/like");

    $response->assertOk()
        ->assertJson([
            'liked' => false,
            'like_count' => 0,
        ]);

    $this->assertDatabaseMissing('post_likes', [
        'post_id' => $post->id,
        'user_id' => $user->id,
    ]);
});

it('can view public posts', function () {
    $user = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['visibility' => 'public']);
    $this->actingAs($user);

    $response = $this->get('/');

    $response->assertOk();
});

it('can view own private posts', function () {
    $user = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create([
        'user_id' => $user->id,
        'visibility' => 'private',
    ]);
    $this->actingAs($user);

    $response = $this->get('/');

    $response->assertOk();
});
