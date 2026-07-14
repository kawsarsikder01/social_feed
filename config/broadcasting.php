<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Broadcaster
    |--------------------------------------------------------------------------
    |
    | This option controls the default broadcaster that will be used by the
    | framework for broadcasting events when the event is not broadcasted
    | to any specific channel.
    |
    | Supported: "pusher", "ably", "redis", "log", "null"
    |
    */

    'default' => env('BROADCAST_DRIVER', 'log'),

    /*
    |--------------------------------------------------------------------------
    | Broadcast Connections
    |--------------------------------------------------------------------------
    |
    | Here you may define all of the broadcast connections that will be used
    | by the application. Broadcast drivers are typically configured for
    | each connection as needed.
    |
    */

    'connections' => [

        'pusher' => [
            'driver' => 'pusher',
            'key' => env('PUSHER_APP_KEY'),
            'secret' => env('PUSHER_APP_SECRET'),
            'app_id' => env('PUSHER_APP_ID'),
            'options' => [
                'cluster' => env('PUSHER_APP_CLUSTER', 'us2'),
                'useTLS' => true,
            ],
            'allowed_origins' => [env('APP_URL', '')],
        ],

        'ably' => [
            'driver' => 'ably',
            'app_id' => env('ABLY_APP_ID'),
            'key' => env('ABLY_KEY'),
        ],

        'redis' => [
            'driver' => 'redis',
            'connection' => 'default',
        ],

        'log' => [
            'driver' => 'log',
            'connection' => 'channels',
        ],

        'null' => [
            'driver' => 'null',
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Channel Names
    |--------------------------------------------------------------------------
    |
    | Here you may define channel names that are used by your application.
    |
    */

    'prefix' => env('BROADCAST_PREFIX', ''),

];
