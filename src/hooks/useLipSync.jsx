import { useState, useRef, useEffect, useCallback } from "react";

/*
 * WebAudio-based Lip Sync Manager
 * 
 * For more accurate lip sync, consider these alternatives:
 * 1. Oculus/Meta Lipsync Web: https://github.com/meta-quest/lipsync-web
 * 2. Rhubarb Lip Sync: https://github.com/DanielSWolf/rhubarb-lip-sync (pre-process audio)
 * 3. Azure Speech SDK: Provides real-time viseme events with speech synthesis
 * 4. Ready Player Me Viseme API: Built-in support for RPM avatars
 * 
 * Current implementation uses formant frequency analysis for real-time detection
 */

// WebAudio-based lip sync manager
export const useLipSync = () => {
  const [viseme, setViseme] = useState("viseme_PP");
  const [features, setFeatures] = useState({ volume: 0, centroid: 0, bands: [] });
  const [isConnected, setIsConnected] = useState(false);
  
  const animationFrameRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  const audioContextRef = useRef(null);

  // Start analysis loop
  const startAnalysis = useCallback(() => {
    if (animationFrameRef.current) return; // Already running
    
    const analyzeAudio = () => {
      if (audioAnalyserRef.current && audioContextRef.current) {
        try {
          const dataArray = new Uint8Array(audioAnalyserRef.current.frequencyBinCount);
          audioAnalyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate volume
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          const volume = average / 255;

          // Calculate spectral centroid
          let weightedSum = 0;
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const freq = i * (audioContextRef.current.sampleRate / 2) / dataArray.length;
            weightedSum += freq * dataArray[i];
            sum += dataArray[i];
          }
          const centroid = sum > 0 ? weightedSum / sum : 0;

          // Create frequency bands for visualization
          const numBands = 8;
          const bandsArray = [];
          const bandSize = Math.floor(dataArray.length / numBands);
          for (let i = 0; i < numBands; i++) {
            const start = i * bandSize;
            const end = start + bandSize;
            const bandAvg = dataArray.slice(start, end).reduce((sum, val) => sum + val, 0) / bandSize;
            bandsArray.push(bandAvg / 255);
          }
          
          // Oculus/Meta Quest viseme detection based on formant analysis
          // Returns actual Oculus viseme blend shape names
          let currentViseme = 'viseme_sil'; // Default silence
          
          if (volume > 0.02) {
            // Calculate energy in specific frequency bands (formants)
            const f1 = dataArray.slice(0, 8).reduce((sum, val) => sum + val, 0) / 8;    // ~300Hz
            const f2 = dataArray.slice(8, 20).reduce((sum, val) => sum + val, 0) / 12;  // ~600Hz  
            const f3 = dataArray.slice(20, 40).reduce((sum, val) => sum + val, 0) / 20; // ~1200Hz
            const f4 = dataArray.slice(40, 70).reduce((sum, val) => sum + val, 0) / 30; // ~2000Hz
            const highF = dataArray.slice(70, 110).reduce((sum, val) => sum + val, 0) / 40; // ~3500Hz
            
            const totalEnergy = f1 + f2 + f3 + f4 + highF;
            
            if (totalEnergy > 10) {
              // Normalize formant energies
              const nf1 = f1 / totalEnergy;
              const nf2 = f2 / totalEnergy;
              const nf3 = f3 / totalEnergy;
              const nf4 = f4 / totalEnergy;
              const nhighF = highF / totalEnergy;
              
              // Vowel detection based on formant patterns
              if (nf1 > 0.25 && nf2 < 0.2) {
                // Strong F1, weak F2 = 'aa' sound (father, hot)
                currentViseme = 'viseme_aa';
              } else if (nf2 > 0.25 && nhighF > 0.2) {
                // Strong F2 and high frequencies = 'ee' sound (see, eat)
                currentViseme = 'viseme_I';
              } else if (nf1 > 0.2 && nf2 > 0.2) {
                // Balanced F1 and F2 = 'eh' sound (bed, head)
                currentViseme = 'viseme_E';
              } else if (nf1 < 0.15 && nf2 < 0.2 && nhighF > 0.25) {
                // Weak F1/F2, strong high = 'oo' sound (boot, food)
                currentViseme = 'viseme_U';
              } else if (nf1 < 0.2 && nf2 > 0.2 && nf3 > 0.2) {
                // Weak F1, strong F2/F3 = 'oh' sound (go, show)
                currentViseme = 'viseme_O';
              } else if (nhighF > 0.35) {
                // High frequency sibilants
                currentViseme = Math.random() > 0.5 ? 'viseme_SS' : 'viseme_CH'; // s/z or sh/ch
              } else if (nhighF > 0.25) {
                // Fricatives (f, v, th)
                currentViseme = Math.random() > 0.5 ? 'viseme_FF' : 'viseme_TH';
              } else if (nf1 < 0.15 && nf2 < 0.2 && nhighF < 0.2) {
                // Closed consonants (p, b, m)
                currentViseme = 'viseme_PP';
              } else if (nf2 < 0.2 && nf3 > 0.2) {
                // Back consonants (k, g)
                currentViseme = 'viseme_kk';
              } else {
                // Dental/alveolar consonants (d, t, n, l)
                currentViseme = 'viseme_DD';
              }
            }
          }
          
          setViseme(currentViseme);
          setFeatures({ volume, centroid, bands: bandsArray });
        } catch (error) {
          console.error('❌ Error in lip sync analysis:', error);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    };
    
    analyzeAudio();
  }, []);

  // Connect audio element to WebAudio analyzer
  const connectAudio = useCallback((audioElement) => {
    if (audioElement && !audioContextRef.current) {
      console.log('🎵 Connecting audio element to WebAudio analyzer');
      try {
        // Create AudioContext
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        // Create analyzer node
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        audioAnalyserRef.current = analyser;
        
        // Connect audio source to analyzer - only if not already connected
        if (!audioElement._audioSourceConnected) {
          const source = audioContext.createMediaElementSource(audioElement);
          source.connect(analyser);
          analyser.connect(audioContext.destination);
          audioElement._audioSourceConnected = true;
        }
        
        setIsConnected(true);
        
        // Start the analysis loop
        if (!animationFrameRef.current) {
          startAnalysis();
        }
      } catch (error) {
        console.error('❌ Error connecting audio to WebAudio:', error);
        setIsConnected(false);
      }
    } else if (audioElement && audioContextRef.current) {
      // Resume context if suspended
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      setIsConnected(true);
      
      // Restart analysis if needed
      if (!animationFrameRef.current) {
        startAnalysis();
      }
    }
  }, [startAnalysis]);

  // Disconnect audio
  const disconnectAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Don't close AudioContext to allow reuse
    // Just pause the analysis
    setIsConnected(false);
    setViseme("viseme_PP");
    setFeatures({ volume: 0, centroid: 0, bands: [] });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectAudio();
    };
  }, [disconnectAudio]);

  return {
    viseme,
    features,
    isConnected,
    connectAudio,
    disconnectAudio
  };
};
