<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Popover;

/**
 * Registers the script module and the style of the popover.
 */
final readonly class ScriptModules
{
    public const HANDLE = 'rinkukado-preview';

    public static function new(): self
    {
        return new self();
    }

    private function __construct()
    {
    }

    public function init(): void
    {
        add_action('init', $this->register(...));
        add_action('wp_enqueue_scripts', $this->enqueue(...));
    }

    private function register(): void
    {
        $asset = $this->asset();

        wp_register_script_module(
            self::HANDLE,
            plugins_url('build/preview/index.js', $this->pluginFile()),
            $asset['dependencies'],
            $asset['version']
        );

        wp_register_style(
            self::HANDLE,
            plugins_url('build/preview/style-index.css', $this->pluginFile()),
            [],
            $asset['version']
        );
    }

    private function enqueue(): void
    {
        if (is_admin() || is_feed()) {
            return;
        }

        wp_enqueue_script_module(self::HANDLE);
        wp_enqueue_style(self::HANDLE);
    }

    /**
     * @return array{dependencies: array<array<string, string>|string>, version: string}
     */
    private function asset(): array
    {
        $file = dirname($this->pluginFile()) . '/build/preview/index.asset.php';

        $asset = is_readable($file) ? require $file : [];
        $asset = is_array($asset) ? $asset : [];

        $dependencies = $asset['dependencies'] ?? [];
        $dependencies = is_array($dependencies) ? $dependencies : [];
        $version = $asset['version'] ?? '';

        return [
            'dependencies' => array_values(array_filter(
                $dependencies,
                static fn (mixed $dependency): bool => is_string($dependency) || self::isDependencyMap($dependency)
            )),
            'version' => is_string($version) && $version !== '' ? $version : '0.1.0',
        ];
    }

    /**
     * @phpstan-assert-if-true array<string, string> $dependency
     */
    private static function isDependencyMap(mixed $dependency): bool
    {
        if (!is_array($dependency)) {
            return false;
        }

        foreach ($dependency as $key => $value) {
            if (!is_string($key) || !is_string($value)) {
                return false;
            }
        }

        return true;
    }

    private function pluginFile(): string
    {
        return dirname(__DIR__, 3) . '/rinkukado.php';
    }
}
