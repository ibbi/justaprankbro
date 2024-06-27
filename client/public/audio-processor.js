// public/audio-processor.js
import { mulaw } from "alawmulaw";

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
        channel[i] = this.buffer[this.bufferIndex++];
      } else {
        channel[i] = 0;
      }
    }

    return true;
  }

  processAudio(data) {
    const decoded = mulaw.decode(new Uint8Array(data));
    const float32Array = new Float32Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      float32Array[i] = decoded[i] / 32768.0; // Convert Int16 to Float32
    }
    this.buffer = float32Array;
    this.bufferIndex = 0;
  }
}

registerProcessor("audio-processor", AudioProcessor);
