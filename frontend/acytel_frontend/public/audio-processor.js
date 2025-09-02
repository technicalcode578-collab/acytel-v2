// This class runs in a separate, high-priority audio thread.
// Its job is to receive raw audio data (PCM) and feed it to the speakers.
class AudioStreamProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        // A simple First-In-First-Out (FIFO) buffer for audio chunks.
        this._buffer = [];
        this._bufferPos = 0; // Position in the current buffer chunk

        this.port.onmessage = (event) => {
            // A null message signals to clear the buffer for a new track.
            if (event.data === null) {
                this._buffer = [];
                this._bufferPos = 0;
            } else {
                // Add incoming audio data chunks to the buffer.
                this._buffer.push(event.data);
            }
        };
    }

    process(inputs, outputs, parameters) {
        const outputChannel = outputs[0][0]; // We'll work with a single channel for simplicity

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
            outputChannel.fill(0);
        }

        // Return true to keep the processor alive and running.
        return true;
    }
}

registerProcessor('audio-stream-processor', AudioStreamProcessor);