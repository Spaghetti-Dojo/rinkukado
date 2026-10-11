<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Rest;

use Brain\Monkey\Functions;
use SpaghettiDojo\Rinkukado\Rest;

final class FakeSchema implements Rest\Schema
{
    public function toArray(): array
    {
        return ['title' => 'fake', 'type' => 'object', 'properties' => []];
    }
}

final class FakeController implements Rest\Controller
{
    public function __invoke(\WP_REST_Request $request): \WP_REST_Response|\WP_Error
    {
        return new \WP_REST_Response(['ok' => true], 200);
    }
}

it('registers a route with the GET method', function (): void {
    Functions\when('rest_get_endpoint_args_for_schema')->justReturn([]);

    Functions\expect('register_rest_route')
        ->once()
        ->with(
            'rinkukado/v1',
            '/preview',
            \Mockery::on(static fn (array $args): bool => $args['methods'] === 'GET')
        );

    Rest\Route::get('rinkukado/v1', '/preview', new FakeSchema(), new FakeController())
        ->register();
});
