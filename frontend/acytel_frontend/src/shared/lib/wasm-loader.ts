import init, * as wasm from "@/audio-engine/pkg/audio_engine.js";

let wasmModule: typeof wasm | null = null;
let initPromise: Promise<void> | null = null;

export const initializeWasm = (): Promise<void> => {
  if (!initPromise) {
    console.log("[WASM Loader] Initializing WebAssembly module...");
    initPromise = init().then(() => {
      // wasm-pack generates a weird structure, we can't use the passed module directly
      // Instead we rely on the star-import 'wasm' which is now populated.
      wasmModule = wasm;
      console.log("[WASM Loader] WebAssembly module initialized successfully.");
    }).catch(error => {
      console.error("[WASM Loader] Failed to initialize WASM module.", error);
      initPromise = null; 
      throw error;
    });
  }
  return initPromise;
};

export const getWasmModule = (): typeof wasm => {
  if (!wasmModule) {
    throw new Error("WASM module is not initialized. Call initializeWasm() at application startup.");
  }
  return wasmModule;
};