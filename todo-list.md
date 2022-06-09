
imply this
```ts
function createCancelableAsyncFunction(
  hfn: (cancelController) => fn
): [cancelableFn: anyFn, controller]
```
