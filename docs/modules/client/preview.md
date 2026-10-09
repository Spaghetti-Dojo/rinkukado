# Preview

The client preview shows a popover, or a sheet, with the preview of a link.
The code lives in `sources/client/preview/`. This document describes each
module and how the modules work together.

## Modes

The preview has three modes. `media-queries.ts` reads the mode from the
`sheetQuery` and `hoverQuery` values of the server configuration.

| Mode | Device | Behavior |
| --- | --- | --- |
| `hover` | fine pointer, wide window | A hover or a focus opens a popover next to the link. |
| `sheet` | coarse pointer | The first tap opens a sheet. A second tap on the same link navigates. |
| `off` | fine pointer, narrow window | The links keep their normal behavior. |

## Modules

| Module | Role | DOM | Side effects |
| --- | --- | --- | --- |
| `index.module.ts` | Entry point. Registers the `rinkukado` store and connects the other modules. | yes | yes |
| `events.ts` | Delegated listeners. Turns page events into intent events. | yes | sends events |
| `context.ts` | The `EventContext` and the `Refs` that the listeners share. | no | no |
| `driver.ts` | Runs the intent machine, its commands and its timer. | no | timer |
| `intent.ts` | The intent machine. A pure reducer. | no | no |
| `network.ts` | The fetcher. Requests, validates and caches the previews. | no | `fetch` |
| `policy.ts` | Decides if a link can show a preview. | no | no |
| `dom.ts` | DOM helpers: root, previewable link, mode, dialog placement. | yes | yes |
| `position.ts` | Computes the side and the position of the popover. | no | no |
| `media-queries.ts` | Reports the mode at the start and at each change. | no | listeners |
| `schemas.ts` | The Zod schemas of the config and the state from the server. | no | no |
| `server.ts` | Checks the server data one time, and gives the checked config. | no | no |
| `types.ts` | The shared types. The server types come from the schemas. | no | no |
| `style.scss` | The popover, the sheet and the custom properties. | — | — |

The pure modules (`intent.ts`, `policy.ts`, `position.ts`) have no DOM and no
timer. Jest tests them in `tests/unit/client/`.

## Dependencies

An arrow points from a module to the module that it imports. The diagram
leaves out `types.ts`, because it holds only types. `server-data.ts` belongs
to the shared helpers. See [Interactivity](interactivity.md).

```mermaid
flowchart TD
    index["index.module.ts<br/>store"]
    events["events.ts<br/>listeners"]
    context["context.ts<br/>EventContext, Refs"]
    driver["driver.ts<br/>driver"]
    intent["intent.ts<br/>reducer"]
    network["network.ts<br/>fetcher"]
    mq["media-queries.ts"]
    dom["dom.ts"]
    policy["policy.ts"]
    position["position.ts"]
    server["server.ts<br/>checked config"]
    schemas["schemas.ts"]
    helpers["server-data.ts<br/>shared helpers"]

    index --> server
    server --> schemas
    server --> helpers
    index --> events
    index --> driver
    index --> network
    index --> mq
    index --> dom
    events --> context
    events --> dom
    context --> dom
    driver --> intent
    mq --> dom
    dom --> policy
    dom --> position
```

## Server data

The server gives a config and a state to the store. The PHP side of this
data is in [Popover](../server/popover.md).

`schemas.ts` holds one strict schema for the config and one for the state.
Each schema holds exactly the keys that the server sends. `types.ts` takes
`ServerConfig`, `ServerState` and `Timings` from the schemas.

The first `init` calls `validateServerData()` of `server.ts`, before it
binds a listener or a media query:

1. It parses the config.
2. It parses the state, and writes the result into the state of the store.
3. It caches the config. `config()` then gives the cached config to the
   other modules.

If a parse fails, `init` reports the error with `reportError`, and returns.
The store binds nothing, so the links keep their normal behavior. The
console shows which key is wrong.

A later `init` does not parse again. A second parse would reset the state of
an open popover to the values of the server.

`config()` throws if a module calls it before the check.

## Data flow

The data moves in one direction. The listeners send events. The machine
returns commands. The store runs the commands and changes the state.

```mermaid
flowchart LR
    page(["Page events<br/>pointer, focus, click, key, scroll"])
    mqEvents(["Media query change"])

    subgraph listeners["events.ts"]
        policyCheck{"previewableLink<br/>(dom.ts + policy.ts)"}
    end

    subgraph drv["driver.ts"]
        reducer["reduce<br/>(intent.ts)"]
        timer["timer<br/>tick at next deadline"]
    end

    subgraph store["index.module.ts"]
        effects["Effects<br/>prefetch, open, close,<br/>abort, navigate"]
        state[("state<br/>isOpen, isSheet,<br/>title, excerpt, ...")]
    end

    fetcher["network.ts<br/>fetcher + cache"]
    rest[("REST endpoint")]
    dialog["Dialog<br/>placeDialog (dom.ts)"]

    page --> policyCheck
    policyCheck -- "IntentEvent" --> reducer
    reducer -- "Machine" --> timer
    timer -- "tick" --> reducer
    reducer -- "Command" --> effects
    effects --> fetcher
    fetcher <--> rest
    fetcher -- "Preview" --> effects
    effects --> state
    effects --> dialog
    fetcher -. "unavailable" .-> reducer
    mqEvents --> mq["media-queries.ts"] -- "Mode" --> state
```

## Intent machine

`intent.ts` holds the machine. The machine has three phases and up to three
deadlines: `prefetchAt`, `openAt` and `closeAt`. The `timings` of the server
configuration set the deadlines. The driver sends a `tick` event when the
next deadline arrives.

```mermaid
stateDiagram-v2
    [*] --> idle

    idle --> intent: enter / focus
    intent --> intent: tick (prefetchAt) / prefetch
    intent --> open: tick (openAt) / open
    intent --> idle: leave / abort

    idle --> open: tap / prefetch + open
    intent --> open: tap / prefetch + open
    open --> open: tap (same href) / navigate
    open --> open: tap (other href) / close + prefetch + open

    open --> open: leave / set closeAt
    open --> open: enter (same href) / clear closeAt
    open --> intent: enter / focus (other href) / close
    open --> idle: tick (closeAt) / close
    open --> idle: escape / outside / close
    open --> idle: unavailable (same href) / close
    intent --> idle: escape / outside / close
```

## Sequence of a hover

This sequence shows the `hover` mode, from the pointer on the link to the
close of the popover.

```mermaid
sequenceDiagram
    actor Visitor
    participant Events as events.ts
    participant Driver as driver.ts
    participant Intent as intent.ts
    participant Store as index.module.ts
    participant Fetcher as network.ts

    Visitor->>Events: pointerover on a link
    Events->>Events: previewableLink (policy)
    Events->>Driver: send enter
    Driver->>Intent: reduce
    Intent-->>Driver: phase intent, prefetchAt, openAt
    Driver->>Driver: setTimeout (next deadline)

    Driver->>Intent: tick (prefetchAt)
    Intent-->>Driver: prefetch
    Driver->>Store: effects.prefetch
    Store->>Fetcher: load (starts the request)

    Driver->>Intent: tick (openAt)
    Intent-->>Driver: open
    Driver->>Store: effects.open
    Store->>Fetcher: load (same promise, or the cache)
    Fetcher-->>Store: Preview
    Store->>Store: applyPreview, revealDialog

    Visitor->>Events: pointerout
    Events->>Driver: send leave
    Driver->>Intent: reduce
    Intent-->>Driver: set closeAt
    Driver->>Intent: tick (closeAt)
    Intent-->>Driver: close
    Driver->>Store: effects.close
    Store->>Store: isOpen = false, unplaceDialog
```

## Rules of the design

- Only `driver.send` changes the machine. A transition never skips its
  commands or the timer that follows.
- The machine does not know the DOM, the network or the clock. Each event
  carries its own time in `at`.
- The fetcher keeps one request for each href. A second `load` call for the
  same href gets the same promise.
- The fetcher caches each settled result for the page session. An abort is
  not cached, so a later visit can try again.
- If the fetch fails after a tap, the store navigates to the link. The link
  keeps its normal behavior.
- The configuration (`ServerConfig`) does not change while the page is open.
  It stays out of the state.
- The store uses no server data before the check of `server.ts` passes.
