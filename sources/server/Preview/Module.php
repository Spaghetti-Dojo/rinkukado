<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Preview;

use Inpsyde\Modularity\Module\ExecutableModule;
use Inpsyde\Modularity\Module\ModuleClassNameIdTrait;
use Inpsyde\Modularity\Module\ServiceModule;
use Psr\Container\ContainerInterface;
use SpaghettiDojo\Rinkukado\Config;
use SpaghettiDojo\Rinkukado\Rest\ErrorFactory;
use SpaghettiDojo\Rinkukado\Rest\Middlewares\Caching;
use SpaghettiDojo\Rinkukado\Rest\Middlewares\ErrorCatch;
use SpaghettiDojo\Rinkukado\Rest\Route;

/**
 * Publishes the services of the preview and registers the preview route.
 */
final class Module implements ServiceModule, ExecutableModule
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
            Config::class => static fn (): Config => Config::new(),

            Rest\Repository::class => static function (
                ContainerInterface $container
            ): Rest\Repository {
                $config = $container->get(Config::class);

                return Rest\Repository::new(
                    Rest\Excerpt::new($config->excerptLength()),
                    $config->excerptLength()
                );
            },

            Rest\Controller::class => static fn (
                ContainerInterface $container
            ): Rest\Controller => Rest\Controller::new(
                $container->get(Config::class),
                $container->get(Rest\Repository::class),
                $container->get(ErrorFactory::class)
            ),
        ];
    }

    public function run(ContainerInterface $container): bool
    {
        $container->get(Rest\Repository::class)->init();

        add_action('rest_api_init', static function () use ($container): void {
            Route::get(
                'rinkukado/v1',
                '/preview',
                Rest\Schema::new(),
                $container->get(Rest\Controller::class)
            )
                ->withMiddleware($container->get(ErrorCatch::class))
                ->withMiddleware($container->get(Caching::class))
                ->register();
        });

        return true;
    }
}
