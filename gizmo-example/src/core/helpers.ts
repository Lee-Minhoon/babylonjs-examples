import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  Vector3,
} from "@babylonjs/core";
import { randomVector } from "../utilities/vector";

export const createScene = (canvas: HTMLCanvasElement) => {
  const engine = new Engine(canvas, true);

  const scene = new Scene(engine);

  const camera = new ArcRotateCamera("camera", 0, 0, 50, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  const light = new HemisphericLight("light", new Vector3(0, 1, 1), scene);
  light.intensity = 0.7;

  engine.runRenderLoop(() => {
    scene.render();
  });

  return scene;
};

export const createMeshes = (scene: Scene, count: number) => {
  const meshes: Mesh[] = [];

  for (let i = 0; i < count; i++) {
    const mesh = MeshBuilder.CreateBox(`Box-${i}`, {}, scene);
    mesh.position = randomVector();
    mesh.isPickable = true;
    meshes.push(mesh);
  }

  return meshes;
};
