<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado;

/**
 * The configuration of the plugin, read from the filters once.
 *
 * @phpstan-type Timings array{prefetch: int, open: int, close: int}
 */
final readonly class Config
{
    public const DEFAULT_ROOT_SELECTOR = 'main';
    public const DEFAULT_DENY_CLASS = 'no-rinkukado';
    public const DEFAULT_EXCERPT_LENGTH = 30;

    private const DEFAULT_TIMINGS = ['prefetch' => 80, 'open' => 300, 'close' => 200];

    public static function new(): self
    {
        return new self();
    }

    private function __construct()
    {
    }

    public function rootSelector(): string
    {
        $value = apply_filters(
            'rinkukado.popover.root-selector',
            self::DEFAULT_ROOT_SELECTOR
        );

        $selector = is_string($value) ? trim($value) : '';

        return $selector === '' ? self::DEFAULT_ROOT_SELECTOR : $selector;
    }

    public function denyClass(): string
    {
        $value = apply_filters('rinkukado.popover.deny-class', self::DEFAULT_DENY_CLASS);

        $class = is_string($value) ? trim($value) : '';

        return $class === '' ? self::DEFAULT_DENY_CLASS : $class;
    }

    /**
     * @return Timings
     */
    public function timings(): array
    {
        $value = apply_filters('rinkukado.popover.timings', self::DEFAULT_TIMINGS);
        $value = is_array($value) ? $value : [];

        $timings = self::DEFAULT_TIMINGS;
        foreach (array_keys(self::DEFAULT_TIMINGS) as $key) {
            $candidate = $value[$key] ?? null;
            if (is_int($candidate) && $candidate >= 0) {
                $timings[$key] = $candidate;
            }
        }

        return $timings;
    }

    /**
     * @return list<string>
     */
    public function postTypes(): array
    {
        $public = get_post_types(['public' => true]);
        $public = array_values(array_map(static fn (mixed $type): string => (string) $type, $public));

        $value = apply_filters('rinkukado.rest.post-types', $public);
        $value = is_array($value) ? $value : $public;

        $types = array_values(array_filter(
            $value,
            static fn (mixed $type): bool => is_string($type) && in_array($type, $public, true)
        ));

        return $types;
    }

    public function excerptLength(): int
    {
        $value = apply_filters('rinkukado.rest.excerpt-length', self::DEFAULT_EXCERPT_LENGTH);

        return is_int($value) && $value > 0 ? $value : self::DEFAULT_EXCERPT_LENGTH;
    }
}
