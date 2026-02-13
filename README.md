## Toolchain

- This project is Bun-first. Use Bun for install, scripts, and command execution.

## Development (Bun)

```bash
bun install
bun run build:debug
bun run build
bun run test
bun run type-check
```

## Special

- [lazyMap()](src/lazyMap.ts)
  like Array's map(), but each loop will check if new task is pushed in todo queue
  inspired by `window.requestIdleCallback()`
