<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Rest;

arch('the REST library does not use the plugin')
    ->expect('SpaghettiDojo\Rinkukado\Rest')
    ->not->toUse([
        'SpaghettiDojo\Rinkukado\Config',
        'SpaghettiDojo\Rinkukado\Preview',
        'SpaghettiDojo\Rinkukado\Popover',
    ]);
