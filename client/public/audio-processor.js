// public/audio-processor.js
import { decodeSample } from "./mulaw.js";

class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(2048);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channel = output[0];

    console.log(inputs, parameters);

    for (let i = 0; i < channel.length; i++) {
      if (this.bufferIndex < this.buffer.length) {
        channel[i] = this.buffer[this.bufferIndex++] / 32768;
      } else {
        channel[i] = 0;
      }
    }

    return true;
  }

  processChunk(chunk) {
    const decoded = new Int16Array(chunk.length);
    for (let i = 0; i < chunk.length; i++) {
      decoded[i] = decodeSample(chunk[i]);
    }
    this.buffer.set(decoded, 0);
    this.bufferIndex = 0;
  }
}

registerProcessor("audio-processor", AudioProcessor);
