<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Rest;

use SpaghettiDojo\Rinkukado\Rest;

final class TagMiddleware implements Rest\Middleware
{
    /** @param list<string> $log */
    public function __construct(private string $tag, private array &$log)
    {
    }

    public function __invoke(\WP_REST_Request $request, callable $next): \WP_REST_Response|\WP_Error
    {
        $this->log[] = "in:{$this->tag}";
        $response = $next($request);
        $this->log[] = "out:{$this->tag}";

        return $response;
    }
}

it('nests the middlewares in the order of attachment', function (): void {
    $log = [];
    $request = \Mockery::mock(\WP_REST_Request::class);

    Rest\MiddlewareProcess::run(
        [new TagMiddleware('outer', $log), new TagMiddleware('inner', $log)],
        static fn (\WP_REST_Request $request): \WP_REST_Response
            => new \WP_REST_Response([], 200),
        $request
    );

    expect($log)->toBe(['in:outer', 'in:inner', 'out:inner', 'out:outer']);
});
