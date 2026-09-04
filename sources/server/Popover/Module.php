<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Popover;

use Inpsyde\Modularity\Module\ExecutableModule;
use Inpsyde\Modularity\Module\ModuleClassNameIdTrait;
use Psr\Container\ContainerInterface;
use SpaghettiDojo\Rinkukado\Config;

final class Module implements ExecutableModule
{
    use ModuleClassNameIdTrait;

    public static function new(): self
    {
        return new self();
    }

    private function __construct()
    {
    }

    public function run(ContainerInterface $container): bool
    {
        PopoverRegion::new(Config::new())->init();
        ScriptModules::new()->init();

        return true;
    }
}
