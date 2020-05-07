import produce, { Patch, nothing, applyPatches } from "immer";
import * as firebase from "firebase/app";
import * as get from "lodash.get";

const getFirestorePath = (path: (string | number)[]): string => {
  if (path.some((p) => typeof p === "number")) {
    throw new Error("Firebase does not support updating elements of arrays.");
  }
  return (path as string[]).map((p) => p.replace(".", "\\.")).join(".");
};

type Update<T> =
  | { type: "set"; value: T }
  | { type: "update"; update: firebase.firestore.UpdateData }
  | { type: "delete" };

export default <T>(original: T, patches: Patch[]): Update<T> => {
  const setPatch = patches.find((patch) => patch.path.length === 0);
  if (setPatch != null) {
    if (setPatch.value === nothing) {
      // Delete entire document
      return { type: "delete" };
    } else {
      // Update entire document
      return { type: "set", value: setPatch.value };
    }
  }

  return {
    type: "update",
    update: patches.reduce((update, patch) => {
      const newUpdate = produce(update, (u) => {
        const path = patch.path;
        if (typeof path[path.length - 1] === "number") {
          // Insert into array
          const arrayPath = path.slice(0, path.length - 1);
          const index = path[path.length - 1] as number;
          const originalArray = get(original, arrayPath);
          u[getFirestorePath(arrayPath)] = [
            ...originalArray.slice(0, index),
            ...(patch.op === "remove" ? [] : [patch.value]),
            ...originalArray.slice(patch.op === "add" ? index : index + 1),
          ];
        } else {
          if (patch.op === "add" || patch.op === "replace") {
            // Insert into object
            u[getFirestorePath(path)] = patch.value;
          } else {
            // Delete from object
            u[getFirestorePath(path)] = firebase.firestore.FieldValue.delete();
          }
        }
      });

      original = applyPatches(original, [patch]);

      return newUpdate;
    }, {}),
  };
};
