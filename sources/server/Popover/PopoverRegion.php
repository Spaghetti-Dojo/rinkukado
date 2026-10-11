<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Popover;

use SpaghettiDojo\Rinkukado\Config;

/**
 * Prints the single dialog of the page, seeds the configuration of the store
 * and seeds the state of the store.
 */
final readonly class PopoverRegion
{
    public const STORE = 'rinkukado';
    // A coarse pointer always gets the sheet. A fine pointer gets the anchored
    // popover only when the window holds it. Below that width a fine pointer
    // gets no popover at all, because a sheet far from the link loses the
    // hover, and a click that opens a sheet swallows the navigation.
    private const SHEET_QUERY = '(pointer: coarse)';
    private const HOVER_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 782px)';

    public static function new(Config $config): self
    {
        return new self($config);
    }

    private function __construct(private Config $config)
    {
    }

    public function init(): void
    {
        add_action('wp_footer', $this->render(...));
    }

    private function render(): void
    {
        if (!is_singular()) {
            return;
        }

        wp_interactivity_config(self::STORE, $this->clientConfig());
        wp_interactivity_state(self::STORE, $this->state());

        ?>
        <div class="rinkukado" data-wp-interactive="rinkukado" data-wp-init="callbacks.init">
            <div
                class="rinkukado__dialog"
                role="dialog"
                aria-modal="false"
                tabindex="-1"
                aria-labelledby="rinkukado-title"
                data-wp-bind--hidden="!state.isOpen"
                data-wp-class--rinkukado--sheet="state.isSheet"
                data-wp-class--rinkukado--with-media="state.hasThumbnail"
                data-wp-on--keydown="actions.onDialogKeydown"
            >
                <button
                    type="button"
                    class="rinkukado__close"
                    data-wp-bind--aria-label="state.closeLabel"
                    data-wp-on--click="actions.close"
                >
                    <span aria-hidden="true">&times;</span>
                </button>
                <a
                    id="rinkukado-title"
                    class="rinkukado__title"
                    data-wp-bind--href="state.permalink"
                    data-wp-text="state.title"
                ></a>
                <p class="rinkukado__excerpt" data-wp-text="state.excerpt"></p>
                <img
                    class="rinkukado__media"
                    alt=""
                    data-wp-bind--src="state.thumbnailSrc"
                    data-wp-bind--srcset="state.thumbnailSrcset"
                    data-wp-bind--alt="state.thumbnailAlt"
                >
                <a
                    class="rinkukado__cta"
                    data-wp-bind--href="state.permalink"
                    data-wp-text="state.ctaLabel"
                ></a>
            </div>
        </div>
        <?php
    }

    /**
     * The values that do not change while the page is open. No directive
     * reads them.
     *
     * @return array<string, mixed>
     */
    private function clientConfig(): array
    {
        return [
            'endpoint' => rest_url('rinkukado/v1/preview'),
            'nonce' => is_user_logged_in() ? wp_create_nonce('wp_rest') : '',
            'rootSelector' => $this->config->rootSelector(),
            'containerSelector' => $this->config->containerSelector(),
            'denyClass' => $this->config->denyClass(),
            'timings' => $this->config->timings(),
            'sheetQuery' => self::SHEET_QUERY,
            'hoverQuery' => self::HOVER_QUERY,
        ];
    }

    /**
     * The values that the directives of the dialog read.
     *
     * @return array<string, mixed>
     */
    private function state(): array
    {
        return [
            'closeLabel' => __('Close the preview', 'rinkukado'),
            'ctaLabel' => __('Read the article', 'rinkukado'),
            'isOpen' => false,
            'isSheet' => false,
            'hasThumbnail' => false,
            'title' => '',
            'excerpt' => '',
            'permalink' => '',
            'thumbnailSrc' => '',
            'thumbnailSrcset' => '',
            'thumbnailAlt' => '',
        ];
    }
}
