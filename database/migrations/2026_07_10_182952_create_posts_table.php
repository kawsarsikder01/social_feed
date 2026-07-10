<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->default(DB::raw('gen_random_uuid()'));

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->text('content')->nullable();

            $table->enum('visibility', [
                'public',
                'private',
            ])->default('public');

            $table->unsignedBigInteger('like_count')->default(0);
            $table->unsignedBigInteger('comment_count')->default(0);

            $table->timestampsTz();
            $table->softDeletesTz();

            $table->unique('public_id');
        });

        # PostgreSQL CHECK constraint
        DB::statement("
            ALTER TABLE posts
            ADD CONSTRAINT posts_content_len
            CHECK (
                content IS NULL
                OR char_length(content) <= 10000
            )
        ");

        # Partial index for public feed
        DB::statement("
            CREATE INDEX posts_public_feed_idx
            ON posts (created_at DESC, id DESC)
            WHERE visibility = 'public'
            AND deleted_at IS NULL
        ");

        # Partial index for user's posts
        DB::statement("
            CREATE INDEX posts_user_idx
            ON posts (user_id, created_at DESC)
            WHERE deleted_at IS NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
