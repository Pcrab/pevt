# PEvt

PEvt is a simple but type-safe eventbus library.

## Usage

```typescript
import createPEvt from "./index";

// new pevt instance with msg name and msg value type defined explicitly.
const pevt = createPEvt<{
    ["some event"]: {
        foo: string;
        bar: boolean;
    };
}>();

// register event
pevt.on("some event", (msg: { foo: string; bar: boolean }) => {
    console.log(msg);
});

// emit event
pevt.emit("some event", {
    foo: "some random string",
    bar: true,
});
```

More examples can be found in [test files](./src/index.spec.ts).
