class Tone {
  context: AudioContext;
  oscillator1: OscillatorNode;
  oscillator2: OscillatorNode;
  gainNode: GainNode;
  status: number;
  ringerLFOBuffer: AudioBuffer | null;
  ringerLFOSource: AudioBufferSourceNode | null;

  constructor(context: AudioContext, freq1: number, freq2: number) {
    this.context = context;
    this.oscillator1 = context.createOscillator();
    this.oscillator2 = context.createOscillator();
    this.gainNode = context.createGain();
    this.status = 0;
    this.ringerLFOBuffer = null;
    this.ringerLFOSource = null;

    this.oscillator1.frequency.value = freq1;
    this.oscillator2.frequency.value = freq2;

    this.oscillator1.connect(this.gainNode);
    this.oscillator2.connect(this.gainNode);
    this.gainNode.connect(context.destination);
  }

  start() {
    this.oscillator1.start(0);
    this.oscillator2.start(0);
  }

  stop() {
    this.oscillator1.stop(0);
    this.oscillator2.stop(0);
    this.status = 0;
  }

  createRingerLFO() {
    const channels = 1;
    const sampleRate = this.context.sampleRate;
    const frameCount = sampleRate * 3;
    const arrayBuffer = this.context.createBuffer(
      channels,
      frameCount,
      sampleRate,
    );

    const bufferData = arrayBuffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      if (
        (i / sampleRate > 0 && i / sampleRate < 0.4) ||
        (i / sampleRate > 0.6 && i / sampleRate < 1.0)
      ) {
        bufferData[i] = 0.25;
      }
    }

    this.ringerLFOBuffer = arrayBuffer;
  }

  startRinging() {
    this.start();
    this.gainNode.gain.value = 0;
    this.status = 1;

    this.createRingerLFO();

    this.ringerLFOSource = this.context.createBufferSource();
    if (this.ringerLFOBuffer) {
      this.ringerLFOSource.buffer = this.ringerLFOBuffer;
    }
    this.ringerLFOSource.loop = true;
    this.ringerLFOSource.connect(this.gainNode.gain);
    this.ringerLFOSource.start(0);
  }

  stopRinging() {
    this.stop();
    if (this.ringerLFOSource) {
      this.ringerLFOSource.stop(0);
    }
  }
}

let ringerTone: Tone | null = null;
let audioContext: AudioContext | null = null;

export async function startRinger() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  if (!ringerTone) {
    ringerTone = new Tone(audioContext, 400, 450);
  }
  ringerTone.startRinging();
}

export function stopRinger() {
  if (ringerTone) {
    ringerTone.stopRinging();
  }
}

export function resetRinger() {
  if (ringerTone) {
    ringerTone.stop();
    ringerTone = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}
