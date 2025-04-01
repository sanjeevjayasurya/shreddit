// Magical restore sound effect implementation
export const playRestoreSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a magical sweep oscillator
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.8);
    
    // Create a gain node for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
    
    // Add magical sparkle effects - higher pitched random notes
    for (let i = 0; i < 20; i++) {
      const sparkleTime = audioContext.currentTime + (i * 0.05);
      const sparkleOsc = audioContext.createOscillator();
      const sparkleGain = audioContext.createGain();
      
      sparkleOsc.frequency.value = 2000 + (i * 100) + Math.random() * 500;
      sparkleGain.gain.setValueAtTime(0, sparkleTime);
      sparkleGain.gain.linearRampToValueAtTime(0.03, sparkleTime + 0.01);
      sparkleGain.gain.linearRampToValueAtTime(0, sparkleTime + 0.1);
      
      // Add some variation to the sparkle sounds
      if (i % 3 === 0) {
        sparkleOsc.type = 'triangle';
      } else {
        sparkleOsc.type = 'sine';
      }
      
      sparkleOsc.connect(sparkleGain);
      sparkleGain.connect(audioContext.destination);
      
      sparkleOsc.start(sparkleTime);
      sparkleOsc.stop(sparkleTime + 0.1);
    }
    
    // Add a final "pop" sound
    const popTime = audioContext.currentTime + 0.8;
    const popOsc = audioContext.createOscillator();
    const popGain = audioContext.createGain();
    
    popOsc.frequency.value = 800;
    popOsc.type = 'sine';
    popGain.gain.setValueAtTime(0, popTime);
    popGain.gain.linearRampToValueAtTime(0.2, popTime + 0.01);
    popGain.gain.linearRampToValueAtTime(0, popTime + 0.2);
    
    popOsc.connect(popGain);
    popGain.connect(audioContext.destination);
    
    popOsc.start(popTime);
    popOsc.stop(popTime + 0.2);
    
    // Connect and play the main sweep
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
  } catch (err) {
    console.warn('Web Audio API not supported', err);
  }
};
