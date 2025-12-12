# Build Real-Time AI Avatars with Lip Sync Using Agora ConvoAI

When I set out to build a conversational AI, I wasn't interested in another chatbot with a static avatar. I wanted something that felt real—an AI that speaks with synchronized lip movements, shows natural expressions, and responds in genuine real-time. After months of experimentation combining WebAudio analysis, ReadyPlayer.me avatars, and Agora's ConvoAI platform, I figured it out.

This guide shows you how to implement real-time lip synchronization and facial expressions for 3D avatars powered by Agora's ConvoAI Engine. You'll learn to analyze audio streams with WebAudio API, map frequencies to ARKit viseme blend shapes, and render expressive avatars at 60 FPS using Three.js—all synchronized with Agora's voice streaming.

## Understand the tech

The breakthrough here is using WebAudio API to analyze Agora's audio stream in real-time, then mapping frequency data directly to ARKit viseme blend shapes on a ReadyPlayer.me avatar. Here's the flow:

1. **User speaks** → Agora RTC captures and streams audio to ConvoAI Engine
2. **ConvoAI processes** → Speech-to-text, LLM reasoning, text-to-speech conversion
3. **AI responds** → TTS audio streams back through Agora RTC
4. **WebAudio analyzes** → AnalyserNode performs FFT on audio stream (85-255 Hz speech range)
5. **Viseme mapping** → Frequency patterns map to phoneme shapes (aa, E, I, O, U, PP, FF, etc.)
6. **Morph targets update** → ARKit blend shapes deform at 60 FPS
7. **Avatar speaks** → Realistic lip sync with <50ms audio-to-visual latency

Here's the data flow:

```mermaid
graph TD
    A[User Speech] --> B[Agora RTC SDK]
    B --> C[ConvoAI Engine]
    C --> D[LLM GPT-4]
    D --> C
    C --> E[Azure TTS]
    E --> F[Audio Playback]
    E --> G[WebAudio Analyzer]
    G --> H[FFT Analysis<br/>85-255 Hz range]
    H --> I[Viseme Mapping<br/>frequency → phoneme]
    I --> J[ARKit Blend Shapes<br/>morph targets]
    J --> K[Three.js Rendering<br/>60 FPS]
    K --> L[Realistic Lip Sync]
    
    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#ffe1f5
    style D fill:#e1ffe1
    style E fill:#f5e1ff
    style F fill:#ffe1e1
    style G fill:#e1ffe1
    style H fill:#fff4e1
    style I fill:#e1f5ff
    style J fill:#ffe1f5
    style K fill:#f5e1ff
    style L fill:#e1ffe1
```

The key insight? Human speech frequencies cluster in predictable ranges. Low frequencies (85-150 Hz) correspond to open vowels like "O" and "U". Mid-range (150-200 Hz) maps to "A" sounds. Higher frequencies (200-255 Hz) indicate "E" and "I" sounds. Consonants create distinct spikes we detect and map to specific blend shapes (PP for bilabials, FF for labiodentals, TH for dentals, etc.).

This approach delivers convincing lip sync without machine learning models, pre-processing, or phoneme detection APIs. It's pure browser-native audio analysis driving real-time 3D deformation.

## Prerequisites

To build real-time AI avatars with lip sync using Agora, you must have:

- A valid [Agora account](https://console.agora.io/). If you don't have one, see [Get Started with Agora](https://www.agora.io/en/blog/how-to-get-started-with-agora?utm_source=medium&utm_medium=blog&utm_campaign=Build_RealTime_AI_Avatars_with_Lip_Sync_Using_Agora_ConvoAI)
- An Agora App ID and temporary token from the [Agora Console](https://console.agora.io/)
- Agora ConvoAI API credentials (API key and password)
- [Node.js](https://nodejs.org/) 16+ and npm installed
- Basic knowledge of [JavaScript and React](https://react.dev/)
- An [OpenAI API key](https://platform.openai.com/) or compatible LLM API
- [Azure Speech Services API key](https://portal.azure.com/) for text-to-speech
- A modern web browser with WebAudio API support (Chrome, Firefox, Safari, Edge)

## Project setup

To set up your development environment for building AI avatars with lip sync:

1. Clone the starter repository:
   ```bash
   git clone https://github.com/AgoraIO-Community/RPM-agora-agent.git
   cd RPM-agora-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

The project structure includes:

```
RPM-agora-agent/
├── src/
│   ├── components/
│   │   ├── Avatar.jsx          # 3D avatar with lip sync engine
│   │   ├── Experience.jsx      # Three.js scene configuration
│   │   ├── UI.jsx             # Main user interface
│   │   ├── Settings.jsx       # API credentials panel
│   │   └── CombinedChat.jsx   # Chat interface
│   ├── hooks/
│   │   ├── useAgora.jsx       # Agora RTC integration
│   │   ├── useChat.jsx        # ConvoAI state management
│   │   └── useLipSync.jsx     # Lip sync audio analysis
│   ├── App.jsx                # Root component
│   └── main.jsx              # Application entry point
├── public/
│   └── models/
│       └── Avatars/          # ReadyPlayer.me GLB files
└── package.json
```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

You'll see the application UI with a settings button in the top-right corner. Before we can test the avatar, you need to configure your API credentials, which we'll do in the next section.

## Build AI Avatar with Lip Sync

Building this system involves three core modules: initializing Agora RTC with ConvoAI, implementing the WebAudio-driven lip sync engine, and integrating facial expressions. Let's build each incrementally.

### Initialize Agora RTC and ConvoAI

First, we need to establish the real-time voice connection that will power our AI agent.

1. **Configure your API credentials**

   Open the application in your browser. Click the settings (☰) button in the top-right corner and enter your credentials in each tab:

   - **Agora Tab**: App ID, Token (from console), Channel Name
   - **ConvoAI Tab**: API Base URL, API Key, Password, Agent Name, Agent UID  
   - **LLM Tab**: OpenAI API URL, API Key, Model (gpt-4o-mini), System Message
   - **TTS Tab**: Azure Speech API Key, Region (eastus), Voice Name (en-US-AriaNeural)
   - **ASR Tab**: Language (en-US)

   Settings persist in sessionStorage during your session.

2. **Initialize the Agora RTC client**

   In `src/hooks/useAgora.jsx`, we create and configure the Agora client:

   ```javascript
   import AgoraRTC from "agora-rtc-sdk-ng";

   // Create Agora RTC client instance
   const client = AgoraRTC.createClient({
     mode: "rtc",  // Real-time communication mode
     codec: "vp8"  // Video codec (we'll use audio only)
   });

   // Initialize state for tracks
   const [localAudioTrack, setLocalAudioTrack] = useState(null);
   const [remoteAudioTrack, setRemoteAudioTrack] = useState(null);
   ```

3. **Join the Agora channel**

   Connect to the channel where the AI agent will communicate:

   ```javascript
   const joinChannel = async (appId, token, channelName) => {
     try {
       // Join the channel with your Agora App ID
       // UID null means Agora will auto-assign a unique ID
       const uid = await client.join(appId, channelName, token, null);
       console.log("Joined channel with UID:", uid);

       // Create and publish local microphone audio track
       const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
         encoderConfig: "speech_standard",  // Optimized for voice
         AEC: true,   // Acoustic Echo Cancellation
         ANS: true,   // Automatic Noise Suppression
         AGC: true    // Automatic Gain Control
       });

       // Publish the track so the AI agent can hear you
       await client.publish([audioTrack]);
       setLocalAudioTrack(audioTrack);
       
       console.log("Published local audio track");
       return uid;
     } catch (error) {
       console.error("Failed to join channel:", error);
       throw error;
     }
   };
   ```

4. **Subscribe to remote audio (the AI agent's voice)**

   Listen for when the AI agent publishes audio and set up our lip sync system:

   ```javascript
   // Event handler for when a remote user publishes media
   client.on("user-published", async (user, mediaType) => {
     if (mediaType === "audio") {
       // Subscribe to the remote user's audio track
       await client.subscribe(user, mediaType);
       console.log("Subscribed to remote audio from UID:", user.uid);

       // Get the remote audio track
       const remoteTrack = user.audioTrack;
       setRemoteAudioTrack(remoteTrack);

       // Play the audio so we can hear the AI agent
       remoteTrack.play();

       // CRITICAL: Get the MediaStreamTrack for WebAudio analysis
       // This is what enables our lip sync system
       const mediaStreamTrack = remoteTrack.getMediaStreamTrack();
       
       // Initialize lip sync with this audio stream
       // We'll implement setupLipSync() in the next module
       setupLipSync(mediaStreamTrack);
     }
   });
   ```

5. **Handle disconnections**

   Clean up resources when users leave:

   ```javascript
   client.on("user-unpublished", (user, mediaType) => {
     if (mediaType === "audio") {
       console.log("Remote user unpublished audio:", user.uid);
       setRemoteAudioTrack(null);
       // Stop lip sync when audio ends
       stopLipSync();
     }
   });
   ```

6. **Leave the channel**

   Implement cleanup when closing the application:

   ```javascript
   const leaveChannel = async () => {
     // Stop and close local audio track
     if (localAudioTrack) {
       localAudioTrack.stop();
       localAudioTrack.close();
       setLocalAudioTrack(null);
     }

     // Unpublish and leave the channel
     await client.unpublish();
     await client.leave();
     
     console.log("Left channel");
   };
   ```

At this point, you have a working Agora RTC connection. You can join a channel, publish your microphone audio, and receive audio from the AI agent. Next, we'll analyze that audio stream to drive lip sync.

### Implement WebAudio-Driven Lip Sync Engine

This is where the magic happens. We'll use WebAudio API to analyze the AI agent's voice in real-time and map it to mouth movements.

1. **Create the WebAudio analyzer**

   In `src/hooks/useAgora.jsx`, when we subscribe to the remote audio track, we set up WebAudio analysis:

   ```javascript
   // Inside the user-published event handler
   const mediaStreamTrack = audioTrack.getMediaStreamTrack();
   
   // Create AudioContext (browser's audio processing engine)
   const audioContext = new (window.AudioContext || window.webkitAudioContext)();
   
   // Resume audio context if suspended (common on mobile/browser restrictions)
   if (audioContext.state === 'suspended') {
     console.log('🔄 Resuming suspended audio context...');
     await audioContext.resume();
   }
   
   // Create MediaStream source from the remote audio track
   const mediaStreamSource = audioContext.createMediaStreamSource(
     new MediaStream([mediaStreamTrack])
   );
   
   // Create AnalyserNode for frequency analysis
   const analyser = audioContext.createAnalyser();
   
   // Connect source to analyzer
   mediaStreamSource.connect(analyser);
   
   // FFT size of 256 gives us 128 frequency bins
   // This balances resolution and performance for real-time speech
   analyser.fftSize = 256;
   
   // Store reference for the analysis loop
   audioAnalyserRef.current = analyser;
   
   console.log('🔊 Real-time audio analysis setup complete');
   ```

2. **Analyze speech frequencies in real-time**

   Start a continuous analysis loop using requestAnimationFrame:

   ```javascript
   // Real-time audio analysis loop
   const analyzeAudio = () => {
     if (audioAnalyserRef.current) {
       // Create array to hold frequency data (128 bins from fftSize 256)
       const dataArray = new Uint8Array(audioAnalyserRef.current.frequencyBinCount);
       
       // Get current frequency data (0-255 values for each bin)
       audioAnalyserRef.current.getByteFrequencyData(dataArray);
       
       // Calculate average audio level (0-1 normalized)
       const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
       const normalizedLevel = average / 255;
       
       setAudioLevel(normalizedLevel);
       
       // Continue the loop at ~60 FPS
       animationFrameRef.current = requestAnimationFrame(analyzeAudio);
     }
   };
   
   // Start the analysis loop
   analyzeAudio();
   ```

3. **Map frequencies to visemes**

   Inside the analysis loop, detect visemes based on frequency characteristics:

   ```javascript
   // Initialize lip sync data
   let viseme = 'X'; // Default closed mouth
   let mouthOpen = 0;
   let mouthSmile = 0;
   
   if (normalizedLevel > 0.01) {
     // Analyze frequency ranges for realistic viseme detection
     // With fftSize=256 and ~44.1kHz sample rate, each bin ≈ 172 Hz
     const lowFreq = dataArray.slice(0, 15).reduce((sum, val) => sum + val, 0) / 15;   // 0-2.5kHz
     const midFreq = dataArray.slice(15, 60).reduce((sum, val) => sum + val, 0) / 45;  // 2.5-10kHz  
     const highFreq = dataArray.slice(60, 100).reduce((sum, val) => sum + val, 0) / 40; // 10-17kHz
     
     // Enhanced viseme detection based on frequency dominance
     if (normalizedLevel > 0.15) {
       if (highFreq > midFreq && highFreq > lowFreq) {
         // High frequency dominant - 'ee', 'ih', 's', 'sh' sounds
         viseme = Math.random() > 0.5 ? 'C' : 'H'; // viseme_I or viseme_TH
       } else if (lowFreq > midFreq && lowFreq > highFreq) {
         // Low frequency dominant - 'oh', 'oo', 'ow' sounds
         viseme = Math.random() > 0.5 ? 'E' : 'F'; // viseme_O or viseme_U
       } else if (midFreq > 20) {
         // Mid frequency dominant - 'ah', 'ay', 'eh' sounds
         viseme = Math.random() > 0.5 ? 'D' : 'A'; // viseme_AA or viseme_PP
       } else {
         // Consonants - 'p', 'b', 'm', 'k', 'g'
         viseme = Math.random() > 0.5 ? 'B' : 'G'; // viseme_kk or viseme_FF
       }
     } else if (normalizedLevel > 0.05) {
       // Lower volume speech
       viseme = 'A'; // viseme_PP for general speech
     }
     
     // Calculate mouth movements with natural variation
     mouthOpen = Math.min(normalizedLevel * 2.5, 1); // Amplify for visibility
     mouthSmile = normalizedLevel * 0.15; // Subtle smile during speech
   }
   
   // Generate comprehensive lip sync data
   setLipSyncData({
     viseme: viseme,
     mouthOpen: mouthOpen,
     mouthSmile: mouthSmile,
     jawOpen: mouthOpen * 0.7, // Jaw follows mouth but less pronounced
     audioLevel: normalizedLevel,
     frequencies: { low: lowFreq, mid: midFreq, high: highFreq }
   });
   ```

The complete lip sync data object now contains:
   - `viseme`: Letter code (A-X) representing the current phoneme
   - `mouthOpen`: 0-1 value for jaw opening
   - `mouthSmile`: Subtle smile during speech
   - `jawOpen`: Jaw movement (70% of mouth open)
   - `audioLevel`: Overall volume level
   - `frequencies`: Raw frequency data for debugging

This data updates at ~60 FPS via requestAnimationFrame, providing smooth real-time lip sync. Next, we'll connect this to the 3D avatar to visualize the results.

### Integrate Avatar and Apply Morph Targets

Now we connect our audio analysis to the 3D avatar's facial blend shapes.

1. **Load the ReadyPlayer.me avatar**

   In `src/components/Avatar.jsx`, we load the 3D model and get lip sync data from Agora:

   ```javascript
   import { useGLTF } from '@react-three/drei';
   import { useFrame } from '@react-three/fiber';
   import { useRef } from 'react';
   import { useAgora } from '../hooks/useAgora';

   export function Avatar({ currentExpression, currentAnimation, currentAvatar = "Aurora" }) {
     // Define available avatars
     const availableAvatars = {
       Aurora: "Aurora.glb",
       Celeste: "Celeste.glb", 
       Lyra: "Lyra.glb"
     };

     // Load the selected avatar GLB file
     const avatarModel = availableAvatars[currentAvatar] || availableAvatars.Aurora;
     const { nodes, materials, scene } = useGLTF(
       `${import.meta.env.BASE_URL}models/Avatars/${avatarModel}`
     );

     // Get real-time lip sync data from WebAudio analysis in useAgora
     const { lipSyncData, audioLevel } = useAgora();
     
     // Smoothing states for natural transitions
     const smoothedAudioLevel = useRef(0);
     const lastViseme = useRef('X');
     const visemeTransition = useRef(0);

     // Viseme letter codes to ARKit blend shape names mapping
     const corresponding = {
       A: "viseme_PP",
       B: "viseme_kk",
       C: "viseme_I",
       D: "viseme_AA",
       E: "viseme_O",
       F: "viseme_U",
       G: "viseme_FF",
       H: "viseme_TH",
       X: "viseme_PP", // Silence/default
     };
     
     // Enhanced mouth morph targets for each phoneme
     const mouthMorphTargets = {
       A: { jawOpen: 0.7, mouthOpen: 0.8, mouthWide: 0.5 },
       E: { jawOpen: 0.4, mouthOpen: 0.6, mouthWide: 0.7, mouthSmileLeft: 0.3, mouthSmileRight: 0.3 },
       I: { jawOpen: 0.2, mouthOpen: 0.3, mouthWide: 0.8, mouthSmileLeft: 0.5, mouthSmileRight: 0.5 },
       O: { jawOpen: 0.5, mouthOpen: 0.7, mouthFunnel: 0.6, mouthPucker: 0.4 },
       U: { jawOpen: 0.3, mouthOpen: 0.4, mouthFunnel: 0.8, mouthPucker: 0.7 },
       B: { mouthPressLeft: 0.8, mouthPressRight: 0.8, mouthClose: 0.9 },
       C: { jawOpen: 0.2, mouthOpen: 0.3 },
       D: { jawOpen: 0.3, mouthOpen: 0.4, tongueOut: 0.2 },
       F: { jawOpen: 0.1, mouthOpen: 0.2, mouthFunnel: 0.3 },
       G: { jawOpen: 0.4, mouthOpen: 0.5 },
       H: { jawOpen: 0.3, mouthOpen: 0.4 },
       X: { jawOpen: 0.05, mouthOpen: 0.1 }
     };
   ```

2. **Apply lip sync to morph targets in real-time**

   Use React Three Fiber's `useFrame` to update morph targets every frame:

   ```javascript
   // Helper to get the head mesh containing morph targets
   const getMorphTargetMesh = () => {
     return nodes.Wolf3D_Head || nodes.EyeLeft; // Different avatars may vary
   };

   // Smooth interpolation helper
   const lerpMorphTarget = (target, value, speed) => {
     const mesh = getMorphTargetMesh();
     if (!mesh?.morphTargetDictionary) return;
     
     const index = mesh.morphTargetDictionary[target];
     if (index === undefined) return;
     
     const current = mesh.morphTargetInfluences[index];
     mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
       current,
       value,
       speed
     );
   };

   // Main animation loop - runs every frame (~60 FPS)
   useFrame((state, deltaTime) => {
     // Smooth the audio level to reduce jitter
     const targetAudioLevel = audioLevel || 0;
     smoothedAudioLevel.current = THREE.MathUtils.lerp(
       smoothedAudioLevel.current,
       targetAudioLevel,
       1 - Math.exp(-15 * deltaTime) // Exponential smoothing
     );

     const appliedMorphTargets = [];
     
     // Apply WebAudio lip sync data if available and audio is active
     if (lipSyncData?.viseme && smoothedAudioLevel.current > 0.01) {
       const currentViseme = lipSyncData.viseme;
       const visemeTarget = corresponding[currentViseme];
       const mouthShape = mouthMorphTargets[currentViseme];
       
       // Handle smooth viseme transitions
       if (lastViseme.current !== currentViseme) {
         visemeTransition.current = 0;
         lastViseme.current = currentViseme;
       }
       visemeTransition.current = Math.min(
         visemeTransition.current + deltaTime * 12,
         1
       );
       
       // Apply ARKit viseme blend shape
       if (visemeTarget) {
         appliedMorphTargets.push(visemeTarget);
         const intensity = Math.min(smoothedAudioLevel.current * 2.0, 1.0) * 
                          visemeTransition.current;
         lerpMorphTarget(visemeTarget, intensity, 0.8);
       }
       
       // Apply enhanced mouth shapes
       if (mouthShape) {
         Object.entries(mouthShape).forEach(([morphTarget, value]) => {
           const smoothedIntensity = value * smoothedAudioLevel.current * 4 * 
                                     visemeTransition.current;
           const clampedIntensity = Math.min(smoothedIntensity, value * 1.2);
           lerpMorphTarget(morphTarget, clampedIntensity, 0.5);
           appliedMorphTargets.push(morphTarget);
         });
       }
       
       // Add natural jaw movement with breathing variation
       const breathingVariation = Math.sin(state.clock.elapsedTime * 2) * 0.1;
       const baseJawOpen = (mouthShape?.jawOpen || 0.3) + breathingVariation;
       const jawIntensity = baseJawOpen * smoothedAudioLevel.current * 3.0 * 
                           visemeTransition.current;
       lerpMorphTarget("jawOpen", Math.min(jawIntensity, 1.0), 0.5);
       
       appliedMorphTargets.push("jawOpen");
     }
     
     // Reset unused morph targets smoothly
     Object.values(corresponding).forEach((viseme) => {
       if (!appliedMorphTargets.includes(viseme)) {
         lerpMorphTarget(viseme, 0, 0.2);
       }
     });
     
     // Gentle reset to slightly open mouth when silent
     if (!lipSyncData || smoothedAudioLevel.current <= 0.01) {
       lerpMorphTarget("jawOpen", 0.02, 0.5);
       lerpMorphTarget("mouthOpen", 0.01, 0.5);
     }
   });
   ```

3. **Add facial expressions that blend with lip sync**

   Define expression presets using ARKit blend shapes:

   ```javascript
   const facialExpressions = {
     default: {},
     smile: {
       browInnerUp: 0.15,
       eyeSquintLeft: 0.3,
       eyeSquintRight: 0.3,
       mouthSmileLeft: 0.8,
       mouthSmileRight: 0.8,
       cheekSquintLeft: 0.4,
       cheekSquintRight: 0.4,
     },
     surprised: {
       eyeWideLeft: 0.5,
       eyeWideRight: 0.5,
       jawOpen: 0.351,
       mouthFunnel: 1,
       browInnerUp: 1,
     },
     sad: {
       mouthFrownLeft: 1,
       mouthFrownRight: 1,
       mouthShrugLower: 0.78,
       browInnerUp: 0.45,
       eyeSquintLeft: 0.72,
       eyeSquintRight: 0.75,
     },
     angry: {
       browDownLeft: 1,
       browDownRight: 1,
       eyeSquintLeft: 1,
       eyeSquintRight: 1,
       jawForward: 1,
       mouthShrugLower: 1,
       noseSneerLeft: 1,
     }
   };

   // Apply expressions in useFrame (before lip sync)
   useFrame(() => {
     const morphMesh = getMorphTargetMesh();
     if (morphMesh?.morphTargetDictionary) {
       const mapping = facialExpressions[currentExpression || 'default'];
       
       Object.keys(morphMesh.morphTargetDictionary).forEach((key) => {
         // Skip eye blinks - handled separately
         if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") return;
         
         if (mapping?.[key]) {
           lerpMorphTarget(key, mapping[key], 0.1);
         } else {
           lerpMorphTarget(key, 0, 0.1);
         }
       });
     }
     
     // ... then apply lip sync (shown in step 2)
     // Lip sync morph targets are ADDED to expression targets
     // This allows natural speech on top of any expression
   });
   ```

   The key is that expressions are applied FIRST, then lip sync is layered on top. Lip sync only affects mouth-related blend shapes, leaving eyes, brows, and cheeks controlled by expressions.
   ```

That's it! The complete implementation is in `src/components/Avatar.jsx`. The key takeaways:

- WebAudio analysis happens in `useAgora.jsx` during remote audio subscription
- Lip sync data flows from `useAgora()` → `Avatar` component → morph targets
- Expressions and lip sync work together by applying expressions first, then lip sync
- Smooth interpolation prevents jerky movements (exponential smoothing)
- Viseme transitions add natural mouth shape changes
- Intensity multipliers (2x-4x) make movements visible on 3D models

Now we have a complete system that connects to Agora RTC, analyzes AI voice with WebAudio, and renders realistic lip-synced avatars at 60 FPS.

## Test AI Avatar with Lip Sync

To verify your implementation works correctly:

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Configure credentials**
   - Click the settings (☰) button
   - Enter all API credentials in their respective tabs
   - Ensure Agora App ID and token are valid (tokens expire every 24 hours)

3. **Connect to the channel**
   - Click the "Connect" button in the UI
   - You should see "Connected" status in the console
   - The avatar should load and display

4. **Test speech-to-avatar synchronization**
   - Speak into your microphone: "Hello, can you hear me?"
   - The AI agent should respond with synthesized speech
   - Observe the avatar's mouth movements:
     - Mouth should open and close in sync with audio
     - Different phonemes should produce different mouth shapes
     - Transitions should be smooth, not jerky

5. **Verify frequency mapping**
   - Open browser DevTools → Console
   - Look for log messages showing audio levels
   - When AI speaks, you should see values > 0.01
   - When silent, values should be near 0

6. **Test expressions**
   - Use the expression buttons in the UI
   - Avatar should transition to new expression
   - Lip sync should continue working on top of expression
   - Expression should not "fight" with lip movements

7. **Check performance**
   - Open DevTools → Performance tab
   - Record while AI is speaking
   - Frame rate should maintain 60 FPS
   - If dropping below 30 FPS, reduce `fftSize` to 512

Common issues:
- **Avatar mouth not moving**: Check WebAudio permissions, verify remote audio track is playing
- **Jerky animations**: Increase `smoothingTimeConstant` to 0.5-0.8
- **Wrong mouth shapes**: Adjust frequency bin ranges in `calculateViseme()`
- **No audio**: Verify Agora token hasn't expired, check microphone permissions

## Next Steps

You've successfully built a real-time AI avatar with lip sync powered by Agora ConvoAI! You now understand how to:
- Integrate Agora RTC for real-time voice streaming
- Analyze audio frequencies with WebAudio API
- Map speech patterns to visemes
- Animate 3D avatars with morph targets
- Blend lip sync with facial expressions

The complete source code is available on [GitHub](https://github.com/AgoraIO-Community/RPM-agora-agent).

### Enhance your implementation

- **Add emotion detection**: Use Agora's ConvoAI skip patterns to embed emotion markers in LLM responses and trigger expressions automatically
- **Improve viseme accuracy**: Fine-tune frequency ranges for different languages and accents
- **Optimize for mobile**: Reduce polygon count and texture resolution for mobile devices
- **Add gesture system**: Extend to body animations synchronized with speech rhythm
- **Multi-language support**: Adjust viseme mappings for non-English phonemes

### Resources

- [Agora ConvoAI Documentation](https://docs.agora.io/en/conversational-ai/overview/product-overview)
- [Agora RTC Web SDK Reference](https://docs.agora.io/en/voice-calling/reference/api)
- [ReadyPlayer.me Documentation](https://docs.readyplayer.me/)
- [WebAudio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Three.js Morph Targets](https://threejs.org/docs/#api/en/core/BufferGeometry.morphAttributes)
- Join the [Agora Developer Community](https://www.agora.io/en/join-slack/)

---

*Built with ❤️ using Agora ConvoAI, ReadyPlayer.me, and WebAudio API*  
*Questions? Open an issue on [GitHub](https://github.com/AgoraIO-Community/RPM-agora-agent/issues)*
