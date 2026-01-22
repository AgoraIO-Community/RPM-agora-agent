import { useState, useRef, useEffect } from "react";

// WebAudio-based lip sync manager
export const useLipSync = () => {
  const [viseme, setViseme] = useState("viseme_PP");
  const [features, setFeatures] = useState({ volume: 0, centroid: 0 });
  const [isConnected, setIsConnected] = useState(false);
  
  const animationFrameRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  const audioContextRef = useRef(null);

  // Connect audio element to WebAudio analyzer
  const connectAudio = (audioElement) => {
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
        
        // Connect audio source to analyzer
        const source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        setIsConnected(true);
        
        // Start the analysis loop
        if (!animationFrameRef.current) {
          startAnalysis();
        }
      } catch (error) {
        console.error('❌ Error connecting audio to WebAudio:', error);
        setIsConnected(false);
      }
    }
  };

  // Disconnect audio
  const disconnectAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    audioAnalyserRef.current = null;
    setIsConnected(false);
    setViseme("viseme_PP");
    setFeatures({ volume: 0, centroid: 0 });
  };

  // Start analysis loop
  const startAnalysis = () => {
    const analyzeAudio = () => {
      if (audioAnalyserRef.current && isConnected) {
        try {
          const dataArray = new Uint8Array(audioAnalyserRef.current.frequencyBinCount);
          audioAnalyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate volume
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          const volume = average / 255;
          
          // Simple viseme detection based on frequency ranges
          let currentViseme = 'viseme_PP';
          if (volume > 0.01) {
            const lowFreq = dataArray.slice(0, 15).reduce((sum, val) => sum + val, 0) / 15;
            const midFreq = dataArray.slice(15, 60).reduce((sum, val) => sum + val, 0) / 45;
            const highFreq = dataArray.slice(60, 100).reduce((sum, val) => sum + val, 0) / 40;
            
            if (highFreq > midFreq && highFreq > lowFreq) {
              currentViseme = 'viseme_I';
            } else if (lowFreq > midFreq) {
              currentViseme = 'viseme_O';
            } else {
              currentViseme = 'viseme_AA';
            }
          }
          
          setViseme(currentViseme);
          setFeatures({ volume, centroid: 0 });
        } catch (error) {
          console.error('❌ Error in lip sync analysis:', error);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    };
    
    analyzeAudio();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectAudio();
    };
  }, []);

  return {
    viseme,
    features,
    isConnected,
    connectAudio,
    disconnectAudio
  };
};
