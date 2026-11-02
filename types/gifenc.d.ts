/** gifenc 1.x 没有自带类型声明;按官方 README API 手写最小面(只声明我们用到的)。 */
declare module "gifenc" {
  export type Palette = number[][];

  export type QuantizeFormat = "rgb565" | "rgb444" | "rgba4444";

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    opts?: { format?: QuantizeFormat; oneBitAlpha?: boolean; clearAlpha?: boolean; clearAlphaThreshold?: number; clearAlphaColor?: number },
  ): Palette;

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: Palette,
    format?: QuantizeFormat,
  ): Uint8Array;

  export type WriteFrameOpts = {
    palette?: Palette;
    /** 帧延时,毫秒 */
    delay?: number;
    /** 0 = 循环播放 */
    repeat?: number;
    first?: boolean;
    transparent?: boolean;
    transparentIndex?: number;
    dispose?: number;
  };

  export function GIFEncoder(opts?: { auto?: boolean; initialCapacity?: number }): {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: WriteFrameOpts): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    reset(): void;
  };
}
