# REST

The client gets the content of each preview from one endpoint. The code
lives in `sources/server/Rest/`.

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
[Filters](#filters).

## Errors

Every rejection answers `404` with the code `not_found`. The response never
says which check failed.

## Cache

| Request | Header |
| --- | --- |
| anonymous | `Cache-Control: public, max-age=300` |
| from a logged-in user | `Cache-Control: no-store` |

The client also caches each settled result for the page session. See
[Preview](../client/preview.md).

## Filters

| Filter | Default | Purpose |
| --- | --- | --- |
| `rinkukado.rest.post-types` | every public type except `attachment` | The types that the endpoint accepts. |
| `rinkukado.rest.excerpt-length` | `30` | The word count of the fallback excerpt. |
| `rinkukado.rest.payload` | the payload | The last change before the response. |

### Post types

The default list of post types excludes `attachment`, so a media page shows
no preview. Add `attachment` back through `rinkukado.rest.post-types` when a
site wants a preview for its media pages.

### Payload

`rinkukado.rest.payload` receives the payload array and the `WP_Post` object,
just before the endpoint sends the response.
