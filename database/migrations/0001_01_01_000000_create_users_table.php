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
        DB::statement('CREATE EXTENSION IF NOT EXISTS citext');
        DB::statement('CREATE EXTENSION IF NOT EXISTS pgcrypto');

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')
                ->default(DB::raw('gen_random_uuid()'));
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email');
            $table->string('avatar')->nullable();
            $table->string('password');
            $table->enum('status', [
                'active',
                'suspended',
                'deleted',
            ])->default('active');
            $table->rememberToken();
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->unique('public_id');
        });

        // Convert email to CITEXT
        DB::statement('
            ALTER TABLE users
            ALTER COLUMN email TYPE CITEXT
        ');

        // Partial unique index for soft deletes
        DB::statement('
            CREATE UNIQUE INDEX users_email_unique
            ON users(email)
            WHERE deleted_at IS NULL
        ');

        // Optional database validation
        DB::statement('
            ALTER TABLE users
            ADD CONSTRAINT users_name_len
            CHECK (
                char_length(first_name) > 0
                AND char_length(last_name) > 0
            )
        ');

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
