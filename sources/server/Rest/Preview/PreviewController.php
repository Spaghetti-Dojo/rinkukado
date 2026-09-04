<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest\Preview;

use SpaghettiDojo\Rinkukado\Config;
use SpaghettiDojo\Rinkukado\Rest;

/**
 * Turns the URL of a link into the payload of a preview.
 */
final readonly class PreviewController implements Rest\Controller
{
    public static function new(
        Config $config,
        PreviewRepository $repository,
        Rest\ErrorFactory $errorFactory
    ): self {

        return new self($config, $repository, $errorFactory);
    }

    private function __construct(
        private Config $config,
        private PreviewRepository $repository,
        private Rest\ErrorFactory $errorFactory,
    ) {
    }

    public function __invoke(\WP_REST_Request $request): \WP_REST_Response|\WP_Error
    {
        $param = $request->get_param('url');
        $url = is_string($param) ? $param : '';

        $post = $this->post($url);

        if ($post === null) {
            return $this->notFound();
        }

        /** @var array<string, mixed> $payload */
        $payload = apply_filters(
            'rinkukado.rest.payload',
            $this->repository->forPost($post),
            $post
        );

        return new \WP_REST_Response($payload, 200);
    }

    private function post(string $url): ?\WP_Post
    {
        if (!$this->isLocal($url)) {
            return null;
        }

        $postId = url_to_postid($url);

        if ($postId < 1) {
            return null;
        }

        $post = get_post($postId);

        if (!$post instanceof \WP_Post) {
            return null;
        }

        if ($post->post_status !== 'publish' || $post->post_password !== '') {
            return null;
        }

        if (!in_array($post->post_type, $this->config->postTypes(), true)) {
            return null;
        }

        return $post;
    }

    private function isLocal(string $url): bool
    {
        $host = wp_parse_url($url, PHP_URL_HOST);
        $home = wp_parse_url(home_url(), PHP_URL_HOST);

        return is_string($host) && is_string($home) && strtolower($host) === strtolower($home);
    }

    private function notFound(): \WP_Error
    {
        return $this->errorFactory->create(
            'not_found',
            __('No preview exists for this link.', 'rinkukado'),
            ['status' => 404]
        );
    }
}
