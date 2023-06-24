import { Vector3 } from "@babylonjs/core";

export const randomVector = () => {
  return new Vector3(
    Math.random() * 10,
    Math.random() * 10,
    Math.random() * 10
  );
};
