let audioContext: AudioContext;
let sourceNode: AudioBufferSourceNode | null = null;
let audioBuffer: AudioBuffer | null = null;
let startTime = 0;
let pauseTime = 0;
let isPlaying = false;

// Initialize the AudioContext (must be done after a user interaction)
export function initAudioContext() {
    if (!audioContext || audioContext.state === 'closed') {
        audioContext = new AudioContext();
    }
}

// Decode and play a new track
export async function play(arrayBuffer: ArrayBuffer) {
    if (!audioContext) {
        initAudioContext();
    }
    // Stop any currently playing track
    if (sourceNode) {
        sourceNode.stop();
    }

    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(audioContext.destination);

    startTime = audioContext.currentTime;
    pauseTime = 0;
    sourceNode.start(0);
    isPlaying = true;
}

// Pause the current track
export function pause() {
    if (sourceNode && isPlaying) {
        sourceNode.stop();
        pauseTime = audioContext.currentTime - startTime;
        isPlaying = false;
    }
}

// Resume the current track
export function resume() {
    if (audioBuffer && !isPlaying) {
        sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(audioContext.destination);

        // Start from the saved pause time
        startTime = audioContext.currentTime - pauseTime;
        sourceNode.start(0, pauseTime);
        isPlaying = true;
    }
}

// Seek to a new position in the track
export function seek(time: number) {
    if (audioBuffer) {
        if (sourceNode) {
            sourceNode.stop();
        }
        sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(audioContext.destination);
        
        startTime = audioContext.currentTime - time;
        pauseTime = time; // Update pauseTime to the seek time

        sourceNode.start(0, time);
        // If it wasn't playing before, we don't automatically start it
        if (!isPlaying) {
           sourceNode.stop(); // Immediately stop to stay in paused state
        }
    }
}

export function getDuration() {
    return audioBuffer?.duration || 0;
}

export function getCurrentTime() {
    if (isPlaying) {
        return audioContext.currentTime - startTime;
    }
    return pauseTime;
}
