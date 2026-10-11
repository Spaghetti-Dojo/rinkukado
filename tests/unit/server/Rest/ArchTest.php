<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Rest;

/**
 * @return array<string, string>
 */
function librarySources(): array
{
    $directory = dirname(__DIR__, 4) . '/sources/server/Rest';
    $files = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($directory, \FilesystemIterator::SKIP_DOTS)
    );

    $sources = [];
    foreach ($files as $file) {
        assert($file instanceof \SplFileInfo);
        $sources[$file->getPathname()] = (string) file_get_contents($file->getPathname());
    }

    return $sources;
}

arch('the REST library does not use the modules of the plugin')
    ->expect('SpaghettiDojo\Rinkukado\Rest')
    ->not->toUse([
        'SpaghettiDojo\Rinkukado\Config',
        'SpaghettiDojo\Rinkukado\Preview',
        'SpaghettiDojo\Rinkukado\Popover',
    ]);

it('names no symbol of the plugin outside the REST library', function (): void {
    foreach (librarySources() as $path => $source) {
        preg_match_all('/SpaghettiDojo\\\\Rinkukado\\\\(\w+)/', $source, $matches);

        expect(array_diff($matches[1], ['Rest']))->toBe([], $path);
    }
});

it('names no filter of the plugin in the REST library', function (): void {
    foreach (librarySources() as $path => $source) {
        expect(str_contains($source, "'rinkukado."))->toBeFalse($path);
    }
});
