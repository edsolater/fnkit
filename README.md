## Toolchain

- This project is Bun-first. Use Bun for install, scripts, and command execution.

## Development (Bun)

```bash
bun install
bun run build

# Optional: Remove stale dist outputs (when files were deleted/renamed)
bun run clean
bun run test
bun run type-check
```

## Special

- [lazyMap()](src/lazyMap.ts)
  like Array's map(), but each loop will check if new task is pushed in todo queue
  inspired by `window.requestIdleCallback()`
