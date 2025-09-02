// This class runs in a separate, high-priority audio thread.
// Its job is to receive raw audio data (PCM) and feed it to the speakers.
class AudioStreamProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this._buffer = [];
        this._bufferPos = 0;
        this._sampleRate = 44100; // Default sample rate
        this._isPlaying = false;

        this.port.onmessage = (event) => {
            if (event.data.pcm) {
                // Received new audio data to play
                this._buffer = [event.data.pcm];
                this._sampleRate = event.data.sampleRate;
                this._bufferPos = 0;
                this._isPlaying = true;
            } else if (event.data.seek) {
                // Received a seek command
                this._bufferPos = Math.floor(event.data.seek * this._sampleRate);
            } else {
                // A null or other message signals to clear the buffer
                this._buffer = [];
                this._bufferPos = 0;
                this._isPlaying = false;
            }
        };
    }

    process(inputs, outputs, parameters) {
        const outputChannel = outputs[0][0]; // We'll work with mono audio for simplicity

        if (this._buffer.length > 0) {
            const currentChunk = this._buffer[0];
            const remainingInChunk = currentChunk.length - this._bufferPos;
            const frameSize = outputChannel.length;

            if (remainingInChunk >= frameSize) {
                // If we have enough data in the current chunk, copy it over.
                outputChannel.set(currentChunk.subarray(this._bufferPos, this._bufferPos + frameSize));
                this._bufferPos += frameSize;
            } else {
                // If we don't have enough, copy what's left and move to the next chunk.
                outputChannel.set(currentChunk.subarray(this._bufferPos));
                this._buffer.shift(); // Remove the used chunk
                this._bufferPos = 0;
            }
        } else {
            // If there's no data, send silence to prevent glitches.
            if (this._isPlaying) {
                this.port.postMessage({ finished: true });
                this._isPlaying = false;
            }
            outputChannel.fill(0);
        }
        
        // Return true to keep the processor alive and running.
        return true;
    }
}

registerProcessor('audio-stream-processor', AudioStreamProcessor);