<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Rest;

use Brain\Monkey\Functions;
use SpaghettiDojo\Rinkukado\Rest;

it('caches the response of an anonymous request', function (): void {
    Functions\when('is_user_logged_in')->justReturn(false);

    $request = \Mockery::mock(\WP_REST_Request::class);
    $response = \Mockery::mock(\WP_REST_Response::class);
    $response->expects('header')->once()->with('Cache-Control', 'public, max-age=300');

    $result = Rest\Middlewares\Caching::new()(
        $request,
        static fn (): \WP_REST_Response => $response
    );

    expect($result)->toBe($response);
});

it('never caches the response of a logged in user', function (): void {
    Functions\when('is_user_logged_in')->justReturn(true);

    $request = \Mockery::mock(\WP_REST_Request::class);
    $response = \Mockery::mock(\WP_REST_Response::class);
    $response->expects('header')->once()->with('Cache-Control', 'no-store');

    expect(Rest\Middlewares\Caching::new()($request, static fn (): \WP_REST_Response => $response))
        ->toBe($response);
});

it('sets no header on an error', function (): void {
    Functions\when('is_user_logged_in')->justReturn(false);

    $request = \Mockery::mock(\WP_REST_Request::class);
    $error = \Mockery::mock(\WP_Error::class);

    expect(Rest\Middlewares\Caching::new()($request, static fn (): \WP_Error => $error))
        ->toBe($error);
});
