import { AbstractMesh, Nullable } from "@babylonjs/core";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useShallow } from "../hooks/useShallow";

interface MeshStoreStates {
  meshes: AbstractMesh[];
  selectedMesh: Nullable<AbstractMesh>;

  setMeshes: (meshes: AbstractMesh[]) => void;
  setSelectedMesh: (mesh: Nullable<AbstractMesh>) => void;
}

export const meshStore = create(
  subscribeWithSelector<MeshStoreStates>((set) => ({
    meshes: [],
    selectedMesh: null,

    setMeshes: (meshes) => set({ meshes }),
    setSelectedMesh: (selectedMesh) => set({ selectedMesh }),
  }))
);

export const useMeshStore = <T extends keyof MeshStoreStates>(keys: T[]) => {
  return useShallow(meshStore, keys);
};
