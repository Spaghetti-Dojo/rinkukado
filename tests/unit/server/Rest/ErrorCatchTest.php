<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Rest;

use SpaghettiDojo\Rinkukado\Rest;

it('hides the details when WP_DEBUG is false', function (): void {
    $request = \Mockery::mock(\WP_REST_Request::class);

    $error = Rest\Middlewares\ErrorCatch::new(Rest\ErrorFactory::new())(
        $request,
        static fn (): never => throw new \RuntimeException('the secret path'),
    );

    $data = $error->get_error_data();

    expect($data['status'])->toBe(500)
        ->and($data)->not->toHaveKey('stackTrace')
        ->and($data)->not->toHaveKey('file')
        ->and(json_encode($data))->not->toContain('the secret path');
});
