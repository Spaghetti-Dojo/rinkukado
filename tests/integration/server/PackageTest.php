<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Integration;

use Inpsyde\Modularity\Package;

use function SpaghettiDojo\Rinkukado\package;

it('builds the package of the plugin', function (): void {
    expect(package())->toBeInstanceOf(Package::class);
});

it('always returns the same instance', function (): void {
    expect(package())->toBe(package());
});
