// Simple sound synthesis for shredding sound
export const playShredSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a noise source for shredding
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Fill the buffer with noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    // Create noise node
    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    
    // Create a gain node for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.01, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.5);
    gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 2);
    
    // Create a filter for paper-like sound
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 0.5;
    
    // Connect the nodes
    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Play the sound
    whiteNoise.start();
    whiteNoise.stop(audioContext.currentTime + 2);
    
    // Add some clicks/cutting sounds
    for (let i = 0; i < 15; i++) {
      const clickTime = audioContext.currentTime + (i * 0.15);
      const clickOsc = audioContext.createOscillator();
      const clickGain = audioContext.createGain();
      
      clickOsc.frequency.value = 2000 + Math.random() * 500;
      clickGain.gain.setValueAtTime(0, clickTime);
      clickGain.gain.linearRampToValueAtTime(0.05, clickTime + 0.005);
      clickGain.gain.linearRampToValueAtTime(0, clickTime + 0.05);
      
      clickOsc.connect(clickGain);
      clickGain.connect(audioContext.destination);
      
      clickOsc.start(clickTime);
      clickOsc.stop(clickTime + 0.05);
    }
  } catch (err) {
    console.warn('Web Audio API not supported', err);
  }
};

// Magical restore sound
export const playRestoreSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a sweep oscillator
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.8);
    
    // Create a gain node for volume
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
    
    // Add some sparkle effect
    for (let i = 0; i < 20; i++) {
      const sparkleTime = audioContext.currentTime + (i * 0.05);
      const sparkleOsc = audioContext.createOscillator();
      const sparkleGain = audioContext.createGain();
      
      sparkleOsc.frequency.value = 2000 + (i * 100) + Math.random() * 200;
      sparkleGain.gain.setValueAtTime(0, sparkleTime);
      sparkleGain.gain.linearRampToValueAtTime(0.03, sparkleTime + 0.01);
      sparkleGain.gain.linearRampToValueAtTime(0, sparkleTime + 0.1);
      
      sparkleOsc.connect(sparkleGain);
      sparkleGain.connect(audioContext.destination);
      
      sparkleOsc.start(sparkleTime);
      sparkleOsc.stop(sparkleTime + 0.1);
    }
    
    // Connect and play the main sweep
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
  } catch (err) {
    console.warn('Web Audio API not supported', err);
  }
};
