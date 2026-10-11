<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest\Middlewares;

use SpaghettiDojo\Rinkukado\Rest;

/**
 * Lets a shared cache keep the response of an anonymous visitor.
 */
final readonly class Caching implements Rest\Middleware
{
    public const MAX_AGE = 300;

    public static function new(): self
    {
        return new self();
    }

    private function __construct()
    {
    }

    public function __invoke(
        \WP_REST_Request $request,
        callable $next
    ): \WP_REST_Response|\WP_Error {

        $response = $next($request);

        if (!$response instanceof \WP_REST_Response) {
            return $response;
        }

        $response->header(
            'Cache-Control',
            is_user_logged_in() ? 'no-store' : 'public, max-age=' . self::MAX_AGE
        );

        return $response;
    }
}
