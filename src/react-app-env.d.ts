/// <reference types="react-scripts" />

declare module 'qrcode' {
  export interface QRCodeRenderersOptions {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    type?: string;
    quality?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    width?: number;
  }

  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: QRCodeRenderersOptions
  ): Promise<void>;

  export function toDataURL(
    text: string,
    options?: QRCodeRenderersOptions
  ): Promise<string>;
}
