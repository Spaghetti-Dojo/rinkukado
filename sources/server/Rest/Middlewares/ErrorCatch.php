<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest\Middlewares;

use SpaghettiDojo\Rinkukado\Rest;

class ErrorCatch implements Rest\Middleware
{
    public static function new(
        Rest\ErrorFactory $errorFactory,
    ): ErrorCatch {

        return new self($errorFactory);
    }

    final private function __construct(
        private readonly Rest\ErrorFactory $errorFactory
    ) {
    }

    public function __invoke(\WP_REST_Request $request, callable $next): \WP_REST_Response|\WP_Error
    {
        try {
            return $next($request);
        } catch (\Throwable $exception) {
            $data = ['status' => 500];

            if (defined('WP_DEBUG') && WP_DEBUG) {
                $data += [
                    'code' => $exception->getCode(),
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                    'message' => $exception->getMessage(),
                    'stackTrace' => $exception->getTraceAsString(),
                ];
            }

            return $this->errorFactory->create(
                'internal_error',
                __(
                    'An internal error occurred. Contact the site owner or try again later.',
                    'rinkukado'
                ),
                $data
            );
        }
    }
}
