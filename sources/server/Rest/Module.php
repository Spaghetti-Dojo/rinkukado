<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest;

use Inpsyde\Modularity\Module\ExecutableModule;
use Inpsyde\Modularity\Module\ModuleClassNameIdTrait;
use Inpsyde\Modularity\Module\ServiceModule;
use Psr\Container\ContainerInterface;
use SpaghettiDojo\Rinkukado\Config;
use SpaghettiDojo\Rinkukado\Preview;

/**
 * Publishes the services of the REST layer and registers the preview route.
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

            ErrorFactory::class => static fn (): ErrorFactory => ErrorFactory::new(),

            Middlewares\ErrorCatch::class => static fn (
                ContainerInterface $container
            ): Middlewares\ErrorCatch => Middlewares\ErrorCatch::new(
                $container->get(ErrorFactory::class)
            ),

            Middlewares\Caching::class
                => static fn (): Middlewares\Caching => Middlewares\Caching::new(),

            Preview\Rest\Repository::class => static function (
                ContainerInterface $container
            ): Preview\Rest\Repository {
                $config = $container->get(Config::class);

                return Preview\Rest\Repository::new(
                    Preview\Rest\Excerpt::new($config->excerptLength()),
                    $config->excerptLength()
                );
            },

            Preview\Rest\Controller::class => static fn (
                ContainerInterface $container
            ): Preview\Rest\Controller => Preview\Rest\Controller::new(
                $container->get(Config::class),
                $container->get(Preview\Rest\Repository::class),
                $container->get(ErrorFactory::class)
            ),
        ];
    }

    public function run(ContainerInterface $container): bool
    {
        $container->get(Preview\Rest\Repository::class)->init();

        add_action('rest_api_init', static function () use ($container): void {
            Route::get(
                'rinkukado/v1',
                '/preview',
                Preview\Rest\Schema::new(),
                $container->get(Preview\Rest\Controller::class)
            )
                ->withMiddleware($container->get(Middlewares\ErrorCatch::class))
                ->withMiddleware($container->get(Middlewares\Caching::class))
                ->register();
        });

        return true;
    }
}
