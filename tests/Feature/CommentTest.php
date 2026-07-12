<?php

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;

uses()->group('comments');

it('can create a comment on a post', function () {
    $user = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['visibility' => 'public']);
    $this->actingAs($user);

    $response = $this->postJson("/posts/{$post->public_id}/comments", [
        'content' => 'This is a test comment',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'message',
            'comment' => ['id', 'content'],
        ]);

    $this->assertDatabaseHas('comments', [
        'post_id' => $post->id,
        'user_id' => $user->id,
        'content' => 'This is a test comment',
    ]);

    $post->refresh();
    $this->assertEquals(1, $post->comment_count);
});

it('validates comment content is required', function () {
    $user = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['visibility' => 'public']);
    $this->actingAs($user);

    $response = $this->postJson("/posts/{$post->public_id}/comments", [
        'content' => '',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['content']);
});

it('validates comment content length', function () {
    $user = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['visibility' => 'public']);
    $this->actingAs($user);

    $response = $this->postJson("/posts/{$post->public_id}/comments", [
        'content' => str_repeat('a', 2001),
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['content']);
});

it('can reply to a comment', function () {
    $user = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['visibility' => 'public']);
    $parentComment = Comment::factory()->create(['post_id' => $post->id]);
    $this->actingAs($user);

    $response = $this->postJson("/posts/{$post->public_id}/comments", [
        'content' => 'This is a reply',
        'parent_comment_id' => $parentComment->id,
    ]);

    $response->assertStatus(201);

    $parentComment->refresh();
    $this->assertEquals(1, $parentComment->reply_count);
});

it('can delete own comment', function () {
    $user = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['visibility' => 'public']);
    $comment = Comment::factory()->create([
        'post_id' => $post->id,
        'user_id' => $user->id,
    ]);
    $post->increment('comment_count');
    $this->actingAs($user);

    $response = $this->deleteJson("/comments/{$comment->id}");

    $response->assertOk()
        ->assertJson(['message' => 'Comment deleted successfully.']);

    $this->assertSoftDeleted('comments', ['id' => $comment->id]);
});

it('cannot delete other users comment', function () {
    $user = User::factory()->create(['status' => 'active']);
    $otherUser = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['visibility' => 'public']);
    $comment = Comment::factory()->create([
        'post_id' => $post->id,
        'user_id' => $otherUser->id,
    ]);
    $this->actingAs($user);

    $response = $this->deleteJson("/comments/{$comment->id}");

    $response->assertStatus(403);
});

it('can toggle like on comment', function () {
    $user = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['visibility' => 'public']);
    $comment = Comment::factory()->create(['post_id' => $post->id]);
    $this->actingAs($user);

    $response = $this->postJson("/comments/{$comment->id}/like");

    $response->assertOk()
        ->assertJson([
            'liked' => true,
            'like_count' => 1,
        ]);

    $this->assertDatabaseHas('comment_likes', [
        'comment_id' => $comment->id,
        'user_id' => $user->id,
    ]);
});

it('can unlike a liked comment', function () {
    $user = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['visibility' => 'public']);
    $comment = Comment::factory()->create(['post_id' => $post->id]);
    $comment->likes()->attach($user->id);
    $comment->increment('like_count');
    $this->actingAs($user);

    $response = $this->postJson("/comments/{$comment->id}/like");

    $response->assertOk()
        ->assertJson([
            'liked' => false,
            'like_count' => 0,
        ]);

    $this->assertDatabaseMissing('comment_likes', [
        'comment_id' => $comment->id,
        'user_id' => $user->id,
    ]);
});
