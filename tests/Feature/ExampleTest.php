<?php

test('returns a successful response', function () {
    $response = $this->get(route('feed'));

    $response->assertRedirect(route('login'));
});
