import type { TransitionConfig } from "svelte/transition";
import { type ClassValue, clsx } from "clsx";
import { cubicOut } from "svelte/easing";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
  duration?: number;
  start?: number;
  x?: number;
  y?: number;
};

export const flyAndScale = (
  node: Element,
  params: FlyAndScaleParams = { duration: 150, start: 0.95, x: 0, y: -8 }
): TransitionConfig => {
  const style = getComputedStyle(node);
  const transform = style.transform === "none" ? "" : style.transform;

  const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
    const [minA, maxA] = scaleA;
    const [minB, maxB] = scaleB;

    const percentage = (valueA - minA) / (maxA - minA);
    return percentage * (maxB - minB) + minB;
  };

  const styleToString = (style: Record<string, number | string | undefined>): string => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str;
      return str + `${key}:${style[key]};`;
    }, "");
  };

  return {
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

      return styleToString({
        opacity: t,
        transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`
      });
    },
    delay: 0,
    duration: params.duration ?? 200,
    easing: cubicOut
  };
};

/**
 * Convert the first letter of a string to uppercase
 * @param s the string to capitalize
 */
export function capitalize(s: string) {
  if (s.length === 0) return s;
  if (s.length === 1) return s.toUpperCase();
  return s[0].toUpperCase() + s.slice(1);
}

export function debounce<T extends (...args: unknown[]) => void>(callback: T, wait: number = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>): void => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback(...args);
    }, wait);
  };
}
