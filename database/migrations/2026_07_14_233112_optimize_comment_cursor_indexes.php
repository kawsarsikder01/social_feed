<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('DROP INDEX comments_post_top_level_idx');
        DB::statement('DROP INDEX comments_parent_idx');

        DB::statement('
            CREATE INDEX comments_post_top_level_cursor_idx
            ON comments(post_id, created_at DESC, id DESC)
            WHERE parent_comment_id IS NULL
            AND deleted_at IS NULL
        ');

        DB::statement('
            CREATE INDEX comments_parent_cursor_idx
            ON comments(parent_comment_id, created_at, id)
            WHERE deleted_at IS NULL
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX comments_post_top_level_cursor_idx');
        DB::statement('DROP INDEX comments_parent_cursor_idx');

        DB::statement('
            CREATE INDEX comments_post_top_level_idx
            ON comments(post_id, created_at)
            WHERE parent_comment_id IS NULL
            AND deleted_at IS NULL
        ');

        DB::statement('
            CREATE INDEX comments_parent_idx
            ON comments(parent_comment_id, created_at)
            WHERE deleted_at IS NULL
        ');
    }
};
