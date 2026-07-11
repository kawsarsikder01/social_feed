<?php

use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('/', 'welcome')->name('home');
});

require __DIR__.'/settings.php';
