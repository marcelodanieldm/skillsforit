declare module 'canvas-confetti' {
  export interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: Array<'square' | 'circle'>;
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  export interface GlobalOptions {
    resize?: boolean;
    useWorker?: boolean;
  }

  interface ConfettiFunction {
    (options?: Options): Promise<null>;
    reset: () => void;
    create: (canvas: HTMLCanvasElement, options?: GlobalOptions) => ConfettiFunction;
  }

  const confetti: ConfettiFunction;
  export default confetti;
}
