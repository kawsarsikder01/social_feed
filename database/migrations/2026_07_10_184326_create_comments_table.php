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
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->foreignId('parent_comment_id')->nullable()->constrained('comments')->cascadeOnDelete();

            $table->foreignId('reply_to_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->text('content');

            $table->unsignedBigInteger('like_count')->default(0);
            $table->unsignedBigInteger('reply_count')->default(0);

            $table->timestampsTz();
            $table->softDeletesTz();
        });

        // Content length constraint
        DB::statement('
            ALTER TABLE comments
            ADD CONSTRAINT comments_content_len
            CHECK (
                char_length(content) > 0
                AND char_length(content) <= 2000
            )
        ');

        // Top-level comments
        DB::statement('
            CREATE INDEX comments_post_top_level_idx
            ON comments(post_id, created_at)
            WHERE parent_comment_id IS NULL
            AND deleted_at IS NULL
        ');

        // Replies
        DB::statement('
            CREATE INDEX comments_parent_idx
            ON comments(parent_comment_id, created_at)
            WHERE deleted_at IS NULL
        ');

        // User comments
        DB::statement('
            CREATE INDEX comments_user_idx
            ON comments(user_id)
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
