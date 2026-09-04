<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest\Preview;

use SpaghettiDojo\Rinkukado\Rest;

/**
 * The request of the preview endpoint. WordPress validates it before the
 * controller runs.
 */
final readonly class PreviewSchema implements Rest\Schema
{
    public static function new(): self
    {
        return new self();
    }

    private function __construct()
    {
    }

    public function toArray(): array
    {
        return [
            'title' => 'preview',
            'type' => 'object',
            'properties' => [
                'url' => [
                    'type' => 'string',
                    'format' => 'uri',
                    'required' => true,
                    'description' => __(
                        'The absolute URL of the post to preview.',
                        'rinkukado'
                    ),
                ],
            ],
        ];
    }
}
