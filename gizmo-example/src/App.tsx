import { useEffect, useRef } from "react";
import "./App.css";
import { GizmoController } from "./core/gizmo";
import { createMeshes, createScene } from "./core/helpers";
import { useMeshStore } from "./store/mesh";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { meshes, setMeshes, selectedMesh, setSelectedMesh } = useMeshStore([
    "meshes",
    "setMeshes",
    "selectedMesh",
    "setSelectedMesh",
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = createScene(canvas);
    const meshes = createMeshes(scene, 10);
    setMeshes(meshes);

    const gizmoController = new GizmoController(scene);
    gizmoController.subscribe(({ eventData, eventState }) => {
      console.log(eventData);
      console.log(eventState);
    }, 100);

    return () => {
      meshes.forEach((mesh) => mesh.dispose());
      gizmoController.dispose();
      scene.dispose();
    };
  }, [setMeshes]);

  return (
    <>
      <div
        style={{
          zIndex: 1,
          position: "fixed",
          display: "flex",
          flexDirection: "column",
          width: "200px",
          height: "100vh",
          backgroundColor: "white",
        }}
      >
        {meshes.map((mesh) => (
          <div
            key={mesh.name}
            onClick={() => setSelectedMesh(mesh)}
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "10px",
              backgroundColor:
                mesh === selectedMesh
                  ? "rgba(255, 0, 0, 0.5)"
                  : "rgba(0, 0, 255, 0.5)",
              cursor: "pointer",
            }}
          >
            <span>{mesh.name}</span>
          </div>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
        }}
      />
    </>
  );
}

export default App;
