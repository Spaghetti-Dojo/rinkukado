# REST API

The client gets the content of each preview from one endpoint.

## Request

```
GET /wp-json/rinkukado/v1/preview?url=<absolute-url>
```

The `url` parameter is the absolute URL of a post of this site.

## Response

The endpoint answers `200` with `id`, `title`, `excerpt`, `permalink` and
`thumbnail`. The `thumbnail` field is `null`, or an object with `src`,
`srcset`, `width`, `height` and `alt`.

```json
{
  "id": 42,
  "title": "Hello world",
  "excerpt": "The first words of the post…",
  "permalink": "https://example.com/hello-world/",
  "thumbnail": {
    "src": "https://example.com/wp-content/uploads/hello.jpg",
    "srcset": "…",
    "width": 300,
    "height": 200,
    "alt": ""
  }
}
```

The `rinkukado.rest.payload` filter can change the payload. See
[Customize](customize.md).

## Errors

Every rejection answers `404` with the code `not_found`. The response never
says which check failed.

## Cache

| Request | Header |
| --- | --- |
| anonymous | `Cache-Control: public, max-age=300` |
| from a logged-in user | `Cache-Control: no-store` |

The client also caches each settled result for the page session. See
[Client preview](client-preview.md).
