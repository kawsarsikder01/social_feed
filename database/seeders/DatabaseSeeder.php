<?php

namespace Database\Seeders;

use App\Models\Post;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $posts = [];

        for ($j = 1; $j <= 10; $j++) {
            for ($i = 0; $i < 1000; $i++) {
                $posts[] = [
                    'public_id' => fake()->unique()->uuid(),
                    'user_id' => 44,
                    'content' => fake()->text(100),
                    'visibility' => fake()->randomElement(['public', 'private']),
                ];
            }
        }

        Post::insert($posts);
    }
}
