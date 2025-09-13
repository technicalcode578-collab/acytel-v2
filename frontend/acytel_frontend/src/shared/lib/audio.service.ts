// File: src/shared/lib/audio.service.ts
import { getWasmModule } from './wasm-loader';

interface DecodedAudio {
    sample_rate: number;
    pcm_data: Float32Array;
}

let audioContext: AudioContext | null = null;
let sourceNode: AudioBufferSourceNode | null = null;
let currentBuffer: AudioBuffer | null = null;
let isPaused = false;
let contextStartTime = 0;
let bufferOffset = 0;

export const initAudioContext = async (sampleRate?: number) => {
    if (audioContext && audioContext.sampleRate === sampleRate) return;
    if (audioContext && audioContext.state !== 'closed') {
        await audioContext.close();
    }
    audioContext = new AudioContext({ sampleRate });
};

export const playFromBuffer = async (audioData: Uint8Array): Promise<number> => {
    const wasm = getWasmModule();
    const decodedResult = wasm.decode(audioData) as DecodedAudio;
    const sampleRate = decodedResult.sample_rate;
    const pcmData = decodedResult.pcm_data;

    await initAudioContext(sampleRate);
    stop();

    const audioBuffer = audioContext!.createBuffer(1, pcmData.length, audioContext!.sampleRate);
    audioBuffer.getChannelData(0).set(pcmData);
    currentBuffer = audioBuffer;

    return startPlayback(0);
};

const startPlayback = (offset: number): number => {
    if (!currentBuffer) return 0;
    sourceNode = audioContext!.createBufferSource();
    sourceNode.buffer = currentBuffer;
    sourceNode.connect(audioContext!.destination);
    sourceNode.start(0, offset);
    bufferOffset = offset;
    contextStartTime = audioContext!.currentTime;
    isPaused = false;
    return currentBuffer.duration;
}

export const stop = () => {
    if (sourceNode) {
        sourceNode.stop();
        sourceNode.disconnect();
        sourceNode = null;
    }
    isPaused = false;
    bufferOffset = 0;
    contextStartTime = 0;
    currentBuffer = null;
};

export const pause = () => {
    if (isPaused || !sourceNode) return;
    bufferOffset = bufferOffset + (audioContext!.currentTime - contextStartTime);
    sourceNode.stop();
    isPaused = true;
};

export const resume = () => {
    if (!isPaused || !currentBuffer) return;
    startPlayback(bufferOffset);
};

export const seek = (time: number) => {
    if (currentBuffer) {
        if (sourceNode) {
            sourceNode.stop();
        }
        startPlayback(time);
        if (isPaused) {
            audioContext?.resume().then(() => audioContext?.suspend());
        }
    }
};

export const getCurrentTime = (): number => {
    if (!audioContext || !currentBuffer) return 0;
    if (isPaused) {
        return bufferOffset;
    }
    const time = bufferOffset + (audioContext.currentTime - contextStartTime);
    return Math.min(time, currentBuffer.duration);
};