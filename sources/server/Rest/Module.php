<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest;

use Inpsyde\Modularity\Module\ModuleClassNameIdTrait;
use Inpsyde\Modularity\Module\ServiceModule;
use Psr\Container\ContainerInterface;

/**
 * Publishes the services of the REST library.
 */
final class Module implements ServiceModule
{
    use ModuleClassNameIdTrait;

    public static function new(): self
    {
        return new self();
    }

    private function __construct()
    {
    }

    public function services(): array
    {
        return [
            ErrorFactory::class => static fn (): ErrorFactory => ErrorFactory::new(),

            Middlewares\ErrorCatch::class => static fn (
                ContainerInterface $container
            ): Middlewares\ErrorCatch => Middlewares\ErrorCatch::new(
                $container->get(ErrorFactory::class)
            ),

            Middlewares\Caching::class
                => static fn (): Middlewares\Caching => Middlewares\Caching::new(),
        ];
    }
}
