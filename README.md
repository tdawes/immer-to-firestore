# Immer to Firestore

Converts an immer patch to a firestore update.

## Usage

```ts
import immerToFirestore from "immer-to-firestore";
import * as immer from "immer";

// Enable patches in immer.
immer.enablePatches();

// Apply your mutations and collect the patches from immer
let patches;
immer.produce(original, draft => /* ... */, ps => { patches = ps; });

// Transform your patches to a Firestore update.
const firestoreUpdate = immerToFirestore(original, patches);

// Send the update to Firestore
if (firestoreUpdate.type === "set") {
  ref.set(firestoreUpdarte.value);
} else if (firestoreUpdate.type === "delete") {
  ref.delete();
|} else if (firestoreUpdate.type === "update") {
  ref.update(firestoreUpdate.update);
}
```

#### Warning

Due to limitations with Firestore's handling of arrays, it is not yet possible to mutate an object inside an array. You can add and remove elements, however.
