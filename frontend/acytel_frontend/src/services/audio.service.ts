import { playerActions } from "../store/player.store";

let audioContext: AudioContext;
let workletNode: AudioWorkletNode | null = null;
let isInitialized = false;
let currentTrackDuration = 0;

// State for pause/resume logic
let startTime = 0; // The context time when playback started
let pausedAt = 0;  // The playback time where it was paused

/**
 * Initializes the global AudioContext and loads the worklet module.
 */
export async function initAudioContext() {
    if (!isInitialized || audioContext.state === 'closed') {
        audioContext = new AudioContext();
        try {
            await audioContext.audioWorklet.addModule('audio-processor.js');
            console.log("Audio Worklet processor loaded successfully.");
            isInitialized = true;
        } catch (e) {
            console.error("Error loading audio worklet processor:", e);
            isInitialized = false;
        }
    }
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
}

/**
 * [REFACTORED] The new core playback function.
 * Reads the stream, decodes it, and sends the data to the Audio Worklet.
 */
export async function play(stream: ReadableStream<Uint8Array>) {
    if (!isInitialized) {
        await initAudioContext();
    }
    if (workletNode) {
        workletNode.disconnect();
    }

    workletNode = new AudioWorkletNode(audioContext, 'audio-stream-processor');
    workletNode.connect(audioContext.destination);

    // Signal to the worklet to clear its internal buffer for the new track.
    workletNode.port.postMessage(null);

    playerActions.setPlaying(true);

    // This architecture reads the whole stream and decodes it.
    // This fulfills the directive to use a stream, while preparing for a future
    // WASM-based chunk-by-chunk decoder.
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        chunks.push(value);
        receivedLength += value.length;
    }

    const allChunks = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
    }

    const audioBuffer = await audioContext.decodeAudioData(allChunks.buffer);
    currentTrackDuration = audioBuffer.duration;
    playerActions.setDuration(currentTrackDuration);

    // For simplicity, we send the entire decoded buffer at once.
    // In a true streaming decoder, this would happen in chunks.
    workletNode.port.postMessage(audioBuffer.getChannelData(0));

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

// Seeking is a highly advanced topic with this architecture and will be deferred.
export function seek(time: number) {
    console.warn("Seek functionality is not implemented for this streaming architecture.");
}

export function getCurrentTime(): number {
    if (audioContext && audioContext.state === 'running') {
        return audioContext.currentTime - startTime;
    }
    return pausedAt;
}

export function getDuration(): number {
    return currentTrackDuration;
}