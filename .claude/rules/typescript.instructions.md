---
paths:
  - "sources/client/**/*.ts"
  - "sources/client/**/*.tsx"
---

# TypeScript Instructions

## Naming Conventions

### Methods and Functions

**Do not use `get` prefix for method names.** This is a JavaScript/TypeScript convention that should be avoided in this project.

❌ **Bad:**
```typescript
function getBlockEntries(): Entries {
    // ...
}

class Block {
    private name: string;

    getTitle(): string {
        return this.name;
    }
}
```

✅ **Good:**
```typescript
function blockEntries(): Entries {
    // ...
}

class Block {
    private name: string;

    title(): string {
        return this.name;
    }
}
```

### Exceptions

The only acceptable use of `get` is in actual TypeScript/JavaScript getter properties:

```typescript
class Block {
    private _title: string;

    get title(): string {
        return this._title;
    }
}
```
