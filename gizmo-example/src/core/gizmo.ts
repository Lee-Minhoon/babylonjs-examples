import {
  EventState,
  GizmoManager,
  Nullable,
  Observer,
  PointerInfo,
  Scene,
  Vector3,
} from "@babylonjs/core";
import { Subject, Subscription, timer } from "rxjs";
import { shallow } from "zustand/shallow";
import { meshStore } from "../store/mesh";

type EventData = {
  delta: Vector3;
  dragPlanePoint: Vector3;
  dragPlaneNormal: Vector3;
  dragDistance: number;
  pointerId: number;
  pointerInfo: Nullable<PointerInfo>;
};

export class GizmoController {
  private static instance: Nullable<GizmoController>;
  private _gizmoManager!: GizmoManager;
  private _subject: Nullable<
    Subject<{ eventData: EventData; eventState: EventState }>
  > = null;
  private _observers: Nullable<Observer<EventData>>[] = [];
  private _unsubscribers: Array<() => void> = [];

  constructor(scene: Scene) {
    if (!GizmoController.instance) {
      GizmoController.instance = this;
      this._gizmoManager = new GizmoManager(scene);
      this._gizmoManager.usePointerToAttachGizmos = true;
      this._gizmoManager.positionGizmoEnabled = true;
      this._gizmoManager.rotationGizmoEnabled = true;

      // position gimzo가 드래그 될 때 이벤트 정보를 방출합니다.
      if (this._gizmoManager.gizmos.positionGizmo) {
        const { xGizmo, yGizmo, zGizmo } =
          this._gizmoManager.gizmos.positionGizmo;
        const gizmos = [xGizmo, yGizmo, zGizmo];
        gizmos.forEach((gizmo) => {
          this._observers.push(
            gizmo.dragBehavior.onDragObservable.add((eventData, eventState) => {
              if (this._subject) {
                this._subject.next({ eventData, eventState });
              }
            })
          );
        });
      }

      // rotation gimzo가 드래그 될 때 이벤트 정보를 방출합니다.
      if (this._gizmoManager.gizmos.rotationGizmo) {
        const { xGizmo, yGizmo, zGizmo } =
          this._gizmoManager.gizmos.rotationGizmo;
        const gizmos = [xGizmo, yGizmo, zGizmo];
        gizmos.forEach((gizmo) => {
          this._observers.push(
            gizmo.dragBehavior.onDragObservable.add((eventData, eventState) => {
              if (this._subject) {
                this._subject.next({ eventData, eventState });
              }
            })
          );
        });
      }

      const setSelectedMesh = meshStore.getState().setSelectedMesh;
      this._gizmoManager.onAttachedToMeshObservable.add((mesh) => {
        if (mesh) {
          setSelectedMesh(mesh);
        }
      });

      this._unsubscribers.push(
        meshStore.subscribe(
          (state) => state.selectedMesh,
          (mesh) => {
            if (mesh) {
              this._gizmoManager.attachToMesh(mesh);
            } else {
              this._gizmoManager.attachToMesh(null);
            }
          },
          { equalityFn: shallow }
        )
      );
    }

    return GizmoController.instance;
  }

  public subscribe(
    callback: ({
      eventData,
      eventState,
    }: {
      eventData: EventData;
      eventState: EventState;
    }) => void,
    throttle?: number
  ) {
    let _ready = true;
    let _timer: Nullable<Subscription> = null;
    this._subject = new Subject();
    const throttledCallback = throttle
      ? (stream: { eventData: EventData; eventState: EventState }) => {
          if (_ready) {
            _timer?.unsubscribe();
            callback(stream);
            _ready = false;
            _timer = timer(throttle).subscribe(() => {
              _ready = true;
            });
          }
        }
      : callback;
    return this._subject.subscribe(throttledCallback);
  }

  public unsubscribe() {
    this._subject?.unsubscribe();
  }

  public dispose() {
    this._gizmoManager.dispose();
    this._observers.forEach((observer) => observer?.remove());
    this._unsubscribers.forEach((unsubscriber) => unsubscriber());
    GizmoController.instance = null;
  }
}
