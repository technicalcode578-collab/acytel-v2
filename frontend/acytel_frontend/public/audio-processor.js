// This version is fortified with a queue to handle a stream of PCM chunks.
class AudioStreamProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this._buffer = []; // A queue for incoming PCM data chunks.
        this._bufferPos = 0;
        this._sampleRate = 44100;
        this._isFinished = false; // Flag to indicate the stream has ended.

        this.port.onmessage = (event) => {
            if (event.data.pcm) {
                this._buffer.push(event.data.pcm);
            }
            if (event.data.sampleRate) {
                this._sampleRate = event.data.sampleRate;
            }
            if (event.data.finished) {
                this._isFinished = true;
            }
        };
    }

    process(inputs, outputs, parameters) {
        const outputChannel = outputs[0][0];
        const frameSize = outputChannel.length;

        let pos = 0;
        while (pos < frameSize) {
            const currentChunk = this._buffer[0];
            if (!currentChunk) {
                // Buffer is empty. If the stream has finished, we can signal completion.
                if (this._isFinished) {
                    this.port.postMessage({ finished: true });
                    this._isFinished = false; // Send message only once.
                }
                // Fill remainder of the frame with silence.
                outputChannel.fill(0, pos);
                break;
            }
            
            const remainingInChunk = currentChunk.length - this._bufferPos;
            const toCopy = Math.min(frameSize - pos, remainingInChunk);

            outputChannel.set(currentChunk.subarray(this._bufferPos, this._bufferPos + toCopy), pos);
            
            this._bufferPos += toCopy;
            pos += toCopy;
            
            if (this._bufferPos >= currentChunk.length) {
                this._buffer.shift(); // Move to the next chunk in the queue.
                this._bufferPos = 0;
            }
        }
        
        return true;
    }
}

registerProcessor('audio-stream-processor', AudioStreamProcessor);

