import { playerActions } from "../store/player.store";
import { Decoder } from "../audio-engine/pkg/audio_engine.js";

let audioContext: AudioContext;
let workletNode: AudioWorkletNode | null = null;
let isInitialized = false;

// State for pause/resume logic
let startTime = 0;
let pausedAt = 0;

export async function initAudioContext() {
    if (!isInitialized) {
        audioContext = new AudioContext();
        await audioContext.audioWorklet.addModule('audio-processor.js').catch(e => console.error(e));
        isInitialized = true;
    }
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
}

export async function play(audioData: Uint8Array) {
    if (!isInitialized) await initAudioContext();
    if (workletNode) {
        workletNode.disconnect();
    }
    
    workletNode = new AudioWorkletNode(audioContext, 'audio-stream-processor');
    
    workletNode.port.onmessage = (event) => {
        if (event.data.finished) {
            playerActions.setPlaying(false);
        }
    };
    
    workletNode.connect(audioContext.destination);

    // Decode the audio data using our WASM decoder.
    const decoder = new Decoder(audioData);
    const pcmData = decoder.decode();
    const sampleRate = decoder.sample_rate;
    const duration = pcmData.length / sampleRate;
    
    playerActions.setDuration(duration);
    
    // Send the full decoded audio data and sample rate to the worklet.
    workletNode.port.postMessage({ pcm: pcmData, sampleRate: sampleRate });

    playerActions.setPlaying(true);
    startTime = audioContext.currentTime;
    pausedAt = 0;
}

export function pause() {
    if (audioContext && audioContext.state === 'running') {
        audioContext.suspend();
        pausedAt = audioContext.currentTime - startTime;
        playerActions.setPlaying(false);
    }
}

export function resume() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
        startTime = audioContext.currentTime - pausedAt;
        playerActions.setPlaying(true);
    }
}

export function seek(time: number) {
    if (workletNode) {
        workletNode.port.postMessage({ seek: time });
        if (audioContext.state === 'running') {
            startTime = audioContext.currentTime - time;
        }
        pausedAt = time;
    }
}

export function getCurrentTime(): number {
    if (audioContext && audioContext.state === 'running') {
        return audioContext.currentTime - startTime;
    }
    return pausedAt;
}
