<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest;

use Inpsyde\Modularity\Module\ExecutableModule;
use Inpsyde\Modularity\Module\ModuleClassNameIdTrait;
use Inpsyde\Modularity\Module\ServiceModule;
use Psr\Container\ContainerInterface;
use SpaghettiDojo\Rinkukado\Config;

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

            Preview\PreviewRepository::class => static function (
                ContainerInterface $container
            ): Preview\PreviewRepository {
                $config = $container->get(Config::class);

                return Preview\PreviewRepository::new(
                    Preview\Excerpt::new($config->excerptLength()),
                    $config->excerptLength()
                );
            },

            Preview\PreviewController::class => static fn (
                ContainerInterface $container
            ): Preview\PreviewController => Preview\PreviewController::new(
                $container->get(Config::class),
                $container->get(Preview\PreviewRepository::class),
                $container->get(ErrorFactory::class)
            ),
        ];
    }

    public function run(ContainerInterface $container): bool
    {
        $container->get(Preview\PreviewRepository::class)->init();

        add_action('rest_api_init', static function () use ($container): void {
            Route::get(
                'rinkukado/v1',
                '/preview',
                Preview\PreviewSchema::new(),
                $container->get(Preview\PreviewController::class)
            )
                ->withMiddleware($container->get(Middlewares\ErrorCatch::class))
                ->withMiddleware($container->get(Middlewares\Caching::class))
                ->register();
        });

        return true;
    }
}
