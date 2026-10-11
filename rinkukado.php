<?php

/**
 * Plugin Name: Rinkukado
 * Description: Shows a popover with the title, the excerpt and the thumbnail of a linked post.
 * Version: 0.1.0
 * Requires at least: 7.1
 * Requires PHP: 8.4
 * Text Domain: rinkukado
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package SpaghettiDojo\Rinkukado
 */

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado;

defined('ABSPATH') || exit;

function autoload(string $projectRoot): void
{
    $autoloadFile = "{$projectRoot}/vendor/autoload.php";
    if (!\is_readable($autoloadFile)) {
        return;
    }
    require_once $autoloadFile;
}

autoload(__DIR__);

add_action(
    'plugins_loaded',
    static function (): void {
        package()
            ->addModule(Rest\Module::new())
            ->addModule(Preview\Module::new())
            ->addModule(Popover\Module::new())
            ->boot();
    }
);
