declare module 'shaka-player/dist/shaka-player.compiled.js' {
  export interface ShakaPlayer {
    destroy(): Promise<void>;
    configure(config: ShakaPlayerConfig): void;
    getNetworkingEngine(): ShakaNetworkingEngine;
    addEventListener(event: string, handler: (event: ShakaErrorEvent) => void): void;
    load(src: string): Promise<void>;
  }

  export interface ShakaPlayerConfig {
    streaming?: {
      rebufferingGoal?: number;
      bufferingGoal?: number;
      bufferBehind?: number;
      retryParameters?: ShakaRetryParameters;
    };
    drm?: {
      retryParameters?: ShakaRetryParameters;
    };
    manifest?: {
      retryParameters?: ShakaRetryParameters;
    };
    abr?: {
      enabled?: boolean;
      defaultBandwidthEstimate?: number;
      switchInterval?: number;
      bandwidthUpdateInterval?: number;
      useNetworkInformation?: boolean;
    };
  }

  export interface ShakaRetryParameters {
    timeout: number;
    maxAttempts: number;
    backoffFactor: number;
    fuzzFactor: number;
  }

  export interface ShakaNetworkingEngine {
    registerRequestFilter(filter: (type: string, request: ShakaRequest) => void): void;
  }

  export interface ShakaRequest {
    uris?: string[];
  }

  export interface ShakaErrorEvent {
    detail: ShakaError;
  }

  export interface ShakaError {
    code: number;
    category: string;
    severity: number;
    message: string;
  }

  export interface ShakaPlayerConstructor {
    new(video: HTMLVideoElement): ShakaPlayer;
    isBrowserSupported(): boolean;
  }

  export interface ShakaPolyfill {
    installAll(): void;
  }

  export interface ShakaModule {
    Player: ShakaPlayerConstructor;
    polyfill?: ShakaPolyfill;
  }

  const shaka: ShakaModule;
  export default shaka;
}
