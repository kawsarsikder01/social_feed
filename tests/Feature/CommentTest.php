<?php

use App\Events\CommentCreated;
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
        ])
        ->assertJsonPath('comment.liked_by_user', false);

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

it('cannot create a comment on a private post that the user does not own', function () {
    $user = User::factory()->create(['status' => 'active']);
    $otherUser = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create([
        'visibility' => 'private',
        'user_id' => $otherUser->id,
    ]);
    $this->actingAs($user);

    $response = $this->postJson("/posts/{$post->public_id}/comments", [
        'content' => 'This should not be allowed',
    ]);

    $response->assertStatus(403);
});

it('cannot view replies on a private post that the user does not own', function () {
    $user = User::factory()->create(['status' => 'active']);
    $otherUser = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create([
        'visibility' => 'private',
        'user_id' => $otherUser->id,
    ]);
    $comment = Comment::factory()->create(['post_id' => $post->id, 'user_id' => $otherUser->id]);
    $this->actingAs($user);

    $response = $this->getJson("/comments/{$comment->id}/replies");

    $response->assertStatus(403);
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

it('deletes a parent comment and its replies while updating the post comment count', function () {
    $user = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['visibility' => 'public', 'comment_count' => 3]);
    $parentComment = Comment::factory()->create([
        'post_id' => $post->id,
        'user_id' => $user->id,
        'reply_count' => 2,
    ]);
    $firstReply = Comment::factory()->create([
        'post_id' => $post->id,
        'parent_comment_id' => $parentComment->id,
    ]);
    $secondReply = Comment::factory()->create([
        'post_id' => $post->id,
        'parent_comment_id' => $parentComment->id,
    ]);
    $this->actingAs($user);

    $response = $this->deleteJson("/comments/{$parentComment->id}");

    $response->assertOk()
        ->assertJsonPath('post_comment_count', 0)
        ->assertJsonCount(3, 'deleted_comment_ids');

    $this->assertSoftDeleted('comments', ['id' => $parentComment->id]);
    $this->assertSoftDeleted('comments', ['id' => $firstReply->id]);
    $this->assertSoftDeleted('comments', ['id' => $secondReply->id]);
    expect($post->fresh()->comment_count)->toBe(0);
});

it('loads top-level comments through cursor pagination without likes or replies', function () {
    $user = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['visibility' => 'public']);
    $comment = Comment::factory()->create(['post_id' => $post->id]);
    $comment->likes()->attach($user->id);
    $this->actingAs($user);

    $response = $this->getJson("/posts/{$post->public_id}/comments");

    $response->assertSuccessful()
        ->assertJsonPath('data.0.id', $comment->id)
        ->assertJsonPath('data.0.liked_by_user', true)
        ->assertJsonMissingPath('data.0.likes')
        ->assertJsonMissingPath('data.0.replies');
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

it('does not include user emails in comment created broadcast payload', function () {
    $user = User::factory()->create(['status' => 'active']);
    $replyToUser = User::factory()->create(['status' => 'active']);
    $post = Post::factory()->create(['visibility' => 'public']);
    $comment = Comment::factory()->create([
        'post_id' => $post->id,
        'user_id' => $user->id,
        'reply_to_user_id' => $replyToUser->id,
    ]);

    $event = new CommentCreated($comment);
    $payload = $event->broadcastWith();

    expect($payload['comment']['user'])->not->toHaveKey('email')
        ->and($payload['comment']['reply_to_user'])->not->toHaveKey('email');
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
