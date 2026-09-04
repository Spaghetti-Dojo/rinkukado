<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest;

trait RestRegistTrait
{
    public function register(): void
    {
        $handler = function (\WP_REST_Request $request): \WP_REST_Response|\WP_Error {
            return MiddlewareProcess::run(
                $this->middlewares,
                $this->controller,
                $request
            );
        };

        register_rest_route($this->namespace, $this->route, [
            'methods' => $this->method->value,
            'callback' => $handler,
            'args' => rest_get_endpoint_args_for_schema(
                $this->schema->toArray(),
                $this->method->value
            ),
            'schema' => [
                'schema' => $this->schema->toArray(),
                '$schema' => 'http://json-schema.org/draft-04/schema#',
            ],
            'permission_callback' => '__return_true',
        ]);
    }
}
