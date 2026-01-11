import React, { useRef, useEffect, useState } from 'react';
import { useLipSync } from "../hooks/useLipSync";

const audioFiles = [
  {
    name: "Emma",
    files: [
      {
        name: "A",
        path: "models/audios/Emma_a.mp3",
      },
      {
        name: "E",
        path: "models/audios/Emma_e.mp3",
      },
      {
        name: "O",
        path: "models/audios/Emma_o.mp3",
      },
      {
        name: "You",
        path: "models/audios/Emma_you.mp3",
      },
      {
        name: "Vowels",
        path: "models/audios/Emma_vowels.mp3",
      },

      {
        name: "Ta",
        path: "models/audios/Emma_ta.mp3",
      },
      {
        name: "Click",
        path: "models/audios/Emma_click.mp3",
      },
      {
        name: "Bump",
        path: "models/audios/Emma_bump.mp3",
      },
      {
        name: "Not",
        path: "models/audios/Emma_not.mp3",
      },
      {
        name: "Lot",
        path: "models/audios/Emma_lot.mp3",
      },
      {
        name: "Think",
        path: "models/audios/Emma_think.mp3",
      },
      {
        name: "Fan",
        path: "models/audios/Emma_fan.mp3",
      },
      {
        name: "This",
        path: "models/audios/Emma_this.mp3",
      },
      {
        name: "Consonants",
        path: "models/audios/Emma_consonants.mp3",
      },
    ],
  },
];

export const Visualizer = ({ onVisemeChange, onAudioLevelChange }) => {
  const canvasRef = useRef(null);
  const visemeRef = useRef(null);
  const volumeRef = useRef(null);
  const centroidRef = useRef(null);

  const audioRef = useRef(null);
  const [audioFile, setAudioFile] = useState("");

  // Use the useLipSync hook for WebAudio analysis
  const { viseme, features, isConnected, connectAudio, disconnectAudio } = useLipSync();

  // Update parent component with viseme data when it changes
  useEffect(() => {
    if (onVisemeChange) {
      onVisemeChange(viseme);
    }
    if (onAudioLevelChange && features) {
      onAudioLevelChange(features.volume || 0);
    }
  }, [viseme, features, onVisemeChange, onAudioLevelChange]);

  useEffect(() => {
    const handleAudioEnded = () => {
      setAudioFile("");
    };
    audioRef.current?.addEventListener("ended", handleAudioEnded);
    return () => {
      audioRef.current?.removeEventListener("ended", handleAudioEnded);
    };
  }, []);

  useEffect(() => {
    if (!audioFile) {
      return;
    }
    setDetectedVisemes([]);

    // Create or update audio element
    const src = `${import.meta.env.BASE_URL}${audioFile}`;
    audioRef.current.src = src; // Update source

    // Wait for metadata to be available before connecting to useLipSync
    const waitForMetadata = new Promise((resolve, reject) => {
      const el = audioRef.current;
      if (!el) return reject(new Error('Audio element missing'));
      const onLoaded = () => {
        el.removeEventListener('loadedmetadata', onLoaded);
        resolve();
      };
      const onError = (e) => {
        el.removeEventListener('error', onError);
        reject(new Error('Audio element error'));
      };
      el.addEventListener('loadedmetadata', onLoaded, { once: true });
      el.addEventListener('error', onError, { once: true });
      // Trigger load
      try { el.load(); } catch (e) {}
      // Timeout fallback
      setTimeout(() => resolve(), 3000);
    });

    waitForMetadata
      .then(() => {
        try {
          connectAudio(audioRef.current);
          console.log('✅ Visualizer connected static audio to useLipSync', src);
        } catch (e) {
          console.warn('⚠️ Failed to connect static audio to useLipSync', e);
        }
        // Start playback
        audioRef.current.play().catch((e) => console.warn('⚠️ audio play failed', e));
      })
      .catch((err) => {
        console.warn('⚠️ Metadata wait failed, attempting to connect/play anyway', err);
        try { connectAudio(audioRef.current); } catch (e) {}
        audioRef.current.play().catch(() => {});
      });

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        // Do not clear src to allow reuse
      }
    };
  }, [audioFile, connectAudio]);
  const [detectedVisemes, setDetectedVisemes] = useState([]);
  const prevViseme = useRef(null);

  useEffect(() => {
    const drawVisualisation = (features, viseme) => {
  if (!canvasRef.current) return; // canvas might not be mounted
  const ctx = canvasRef.current.getContext("2d");
  if (!ctx) return;
  const width = canvasRef.current.width;
  const height = canvasRef.current.height;
      const maxCentroid = 7000; // Max frequency to display

      // Define virtual padding
      const padding = {
        left: 60, // Space for Y-axis labels
        right: 60, // Small buffer for right edge
        top: 60, // Small buffer for top edge
        bottom: 30, // Space for X-axis labels
      };

      // Calculate content area
      const contentWidth = width - padding.left - padding.right;
      const contentHeight = height - padding.top - padding.bottom;
      const barWidth = contentWidth / features.bands.length;

      // Clear canvas
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);

      // Draw frequency bands
      features.bands.forEach((energy, i) => {
        const barHeight = energy * contentHeight;
        ctx.fillStyle = `hsl(${i * (360 / features.bands.length)}, 70%, 50%)`;
        ctx.fillRect(
          padding.left + i * barWidth,
          height - padding.bottom - barHeight,
          barWidth - 2,
          barHeight
        );
      });

      // Draw centroid
      const centroidX =
        padding.left + (features.centroid / maxCentroid) * contentWidth;
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centroidX, padding.top);
      ctx.lineTo(centroidX, height - padding.bottom);
      ctx.stroke();

      // Draw X-axis (frequency) legend
      ctx.fillStyle = "white";
      ctx.font = "15px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const xTicks = [0, 200, 400, 800, 1500, 2500, 4000, 8000]; // Frequency values in Hz
      xTicks.forEach((freq, i) => {
        const x = padding.left + i * barWidth;
        ctx.fillText(`${freq} Hz`, x, height - padding.bottom + 5); // Position in bottom padding
        // Draw tick mark
        ctx.beginPath();
        ctx.moveTo(x, height - padding.bottom - 5);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();
      });

      const xTicksCentroid = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000]; // Frequency values in Hz
      xTicksCentroid.forEach((freq, i) => {
        const x = padding.left + i * barWidth;
        ctx.fillText(`${freq} Hz`, x, padding.top + 5); // Position in bottom padding
        // Draw tick mark
        ctx.beginPath();
        ctx.moveTo(x, padding.top - 5);
        ctx.lineTo(x, padding.top);
        ctx.stroke();
      });

      // Draw Y-axis (energy) legend
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      const yTicks = [0, 0.25, 0.5, 0.75, 1]; // Energy values (normalized)
      yTicks.forEach((energy) => {
        const y = height - padding.bottom - energy * contentHeight;
        ctx.fillText(energy.toFixed(2), padding.left - 10, y); // Position in left padding
        // Draw tick mark
        ctx.beginPath();
        ctx.moveTo(padding.left - 5, y);
        ctx.lineTo(padding.left, y);
        ctx.stroke();
      });
    };

    let rafId = null;
    const analyzeAudio = () => {
      rafId = requestAnimationFrame(analyzeAudio);
      try {
        // Use the viseme and features from the useLipSync hook
        const currentFeatures = features || { volume: 0, centroid: 0, bands: new Array(64).fill(0) };
        
        if (visemeRef.current) {
          visemeRef.current.innerText = viseme;
        }
        if (volumeRef.current) {
          volumeRef.current.innerText = (currentFeatures.volume || 0).toFixed(2);
        }
        if (centroidRef.current) {
          centroidRef.current.innerText = `${(currentFeatures.centroid || 0).toFixed(2)} Hz`;
        }
        // draw only if canvas exists
        try {
          drawVisualisation(currentFeatures, viseme);
        } catch (e) {
          // swallow drawing errors if canvas gets removed mid-frame
        }
        if (viseme !== prevViseme.current) {
          setDetectedVisemes((prev) => [...prev, viseme]);
          prevViseme.current = viseme;
        }
      } catch (err) {
        console.warn('Visualizer analyzeAudio error:', err);
      }
    };

    analyzeAudio();
    return () => {
      // cleanup RAF loop if unmounted
      if (typeof rafId === 'number') cancelAnimationFrame(rafId);
    };
  }, [viseme, features]);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-4">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg"
          width={1000}
          height={500}
        />
        <audio ref={audioRef} controls className="w-full" />
        <div className="flex flex-row items-center justify-between gap-2">
                <div className="text-center">
                  <p className="text-sm font-mono" ref={visemeRef}>
                    SI
                  </p>
                  <h2>Viseme</h2>
                </div>
                <div className="text-center">
                  <p className="text-sm font-mono" ref={volumeRef}>
                    122db
                  </p>
                  <h2>Volume</h2>
                </div>
                <div className="text-center">
                  <p className="text-sm font-mono" ref={centroidRef}>
                    1000 Hz
                  </p>
                  <h2>Centroid</h2>
                </div>
        </div>
      </section>
      <div className="pointer-events-auto flex flex-col gap-4">
        {audioFiles.map((section, sectionIndex) => (
          <div key={sectionIndex} className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-left">Audios</h2>
            <div className="flex flex-row items-center justify-start gap-2 flex-wrap">
              {section.files.map((audio, index) => (
                <button
                  key={index}
                  className="p-2 text-white bg-indigo-500 hover:bg-indigo-600 cursor-pointer rounded min-w-12"
                  onClick={() => setAudioFile(audio.path)}
                >
                  {audio.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {detectedVisemes.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-left">Detected Visemes</h2>
          <div className="flex flex-row items-center justify-start gap-2  flex-wrap">
            {detectedVisemes.map((viseme, index) => {
              return (
                <span
                  key={index}
                  className="px-3 py-2 text-black font-medium bg-pink-100 rounded flex items-center"
                >
                  <span className="text-sm font-bold text-purple-600">{viseme}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
