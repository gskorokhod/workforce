import type { Serializer } from "svelte-persisted-store";
import type { Jsonifiable } from "type-fest";

export interface DraggableProps<T extends Jsonifiable> {
  serializer?: Serializer<T>;
  data: T;
  pointer?: CSSStyleDeclaration["cursor"];
}

export interface DraggableReturn<T extends Jsonifiable> {
  update: (props: DraggableProps<T>) => void;
  destroy: () => void;
}

export function draggable<T extends Jsonifiable>(element: HTMLElement, props: DraggableProps<T>): DraggableReturn<T> {
  let state: DraggableProps<T> = props;

  element.draggable = true;
  element.style.cursor = state.pointer || "grab";

  function handleDragStart(e: DragEvent) {
    const serializer = serializerOrDefault(state.serializer);
    e.dataTransfer?.setData("text/plain", serializer.stringify(state.data));
  }

  element.addEventListener("dragstart", handleDragStart);

  return {
    update: (props: DraggableProps<T>) => {
      state = props;
    },
    destroy: () => {
      element.removeEventListener("dragstart", handleDragStart);
    }
  }
}

export interface DropTargetProps<T extends Jsonifiable> {
  serializer?: Serializer<T>;
  onDrop: (data: T, event: DragEvent) => void;
  onDragOver?: (event: DragEvent) => void;
  onDragEnter?: (event: DragEvent) => void;
  onDragLeave?: (event: DragEvent) => void;
  dropEffect?: DropEffect | ((event: DragEvent) => DropEffect);
  dragOverClass?: string | string[];
}

export interface DropTargetReturn<T extends Jsonifiable> {
  update: (props: DropTargetProps<T>) => void;
  destroy: () => void;
}

export function dropTarget<T extends Jsonifiable>(element: HTMLElement, props: DropTargetProps<T>): DropTargetReturn<T> {
  let state: DropTargetProps<T> = props;
  let currentClasses: string[] = [];

  function handleDragEnter(e: DragEvent) {
    const classes = parseClassList(state.dragOverClass);
    if (classes.length) {
      element.classList.add(...classes);
      currentClasses = classes;
    }
    state.onDragEnter?.(e);
  }

  function handleDragLeave(e: DragEvent) {
    if (currentClasses.length) {
      element.classList.remove(...currentClasses);
      currentClasses = [];
    }
    state.onDragLeave?.(e);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      const effect = typeof state.dropEffect === "function" ? state.dropEffect(e) : state.dropEffect;
      e.dataTransfer.dropEffect = effect || "move";
    }
    state.onDragOver?.(e);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    const serializer = serializerOrDefault(state.serializer);
    const data = serializer.parse(e.dataTransfer?.getData("text/plain") || "");
    state.onDrop(data, e);
  }

  element.addEventListener("drop", handleDrop);
  element.addEventListener("dragover", handleDragOver);
  element.addEventListener("dragenter", handleDragEnter);
  element.addEventListener("dragleave", handleDragLeave);

  return {
    update: (props: DropTargetProps<T>) => {
      state = props;
    },
    destroy: () => {
      element.removeEventListener("drop", handleDrop);
      element.removeEventListener("dragover", handleDragOver);
      element.removeEventListener("dragenter", handleDragEnter);
      element.removeEventListener("dragleave", handleDragLeave);
    }
  }
}

function serializerOrDefault<T>(serializer?: Serializer<T>): Serializer<T> {
  return serializer || {
    parse: (str: string) => JSON.parse(str) as T,
    stringify: JSON.stringify
  };
}

function parseClassList(classes: string | string[] | undefined): string[] {
  if (Array.isArray(classes)) {
    return classes.map(c => c.trim()).filter(c => c);
  } else if (typeof classes === "string") {
    return classes.split(" ").map(c => c.trim()).filter(c => c);
  } else {
    return [];
  }
}

type DropEffect = "copy" | "move" | "link" | "none";