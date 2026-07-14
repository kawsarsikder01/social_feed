<?php

namespace App\Providers;

use App\Models\Post;
use App\Observers\PostObserver;
use App\Services\PostService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PostService::class, fn () => new PostService);
    }

    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerObservers();
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): Password => Password::min(8)
            ->letters()
            ->numbers()
        );
    }

    protected function registerObservers(): void
    {
        Post::observe(PostObserver::class);
    }
}
