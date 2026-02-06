# 🎭 Real-Time AI Avatars with Lip Sync Using Agora ConvoAI
![Agora_Agents (1)](https://github.com/user-attachments/assets/d32de4cc-a2ea-4e6d-a4d0-76975c77c368)

**Live Demo**: https://agoraio-community.github.io/RPM-agora-agent/

> **Build conversational AI agents with synchronized lip movements, natural expressions, and genuine real-time responses powered by Agora ConvoAI Engine, WebAudio API, and ReadyPlayer.me avatars.**

## 🌟 Key Features

### 🎤 **WebAudio-Driven Lip Sync**
- **Real-Time FFT Analysis** - Analyzes AI voice at 60 FPS using WebAudio API (85-255 Hz speech range)
- **ARKit Viseme Mapping** - Frequency patterns map to phonemes (aa, E, I, O, U, PP, FF, TH, etc.)
- **50+ Morph Targets** - ARKit blend shapes for realistic facial deformation
- **Exponential Smoothing** - Delta-time easing for fluid transitions without jitter
- **<50ms Latency** - Audio-to-visual synchronization with minimal delay
- **Breathing Simulation** - Subtle sine wave variations for natural idle behavior

### 🤖 **Agora ConvoAI Engine**
- **Ultra-Low Latency WebRTC** - Real-time voice streaming via Agora RTC SDK
- **Speech-to-Text (ASR)** - Automatic speech recognition for user input
- **LLM Integration** - OpenAI GPT-4 or compatible models for intelligent responses
- **Text-to-Speech (TTS)** - Azure Speech Services for natural voice synthesis
- **Cloud-Based Agent** - ConvoAI Agent joins Agora channel as a remote user
- **Multi-Language Support** - Configurable ASR/TTS language settings

### 🎨 **ReadyPlayer.me Avatar System**
- **GLB 3D Models** - Optimized web-ready avatars with facial rigs
- **Facial Expressions** - 7 emotional states (smile, surprised, sad, angry, etc.)
- **Body Animations** - Idle, talking, laughing, crying, and more
- **Real-Time Morphing** - Facial blend shapes respond to live audio analysis
- **Manual Override** - UI panels for expression/animation control
- **Three.js Rendering** - 60 FPS WebGL performance

## 🎯 How It Works

### Real-Time Data Flow
```
User Speech → Agora RTC → ConvoAI Engine → LLM (GPT-4) → TTS (Azure) → Audio Stream
                                                                              ↓
                                                                    WebAudio Analyzer
                                                                              ↓
                                                                    FFT Analysis (256)
                                                                              ↓
                                                              Frequency → Viseme Mapping
                                                                              ↓
                                                                  ARKit Blend Shapes
                                                                              ↓
                                                              Three.js Rendering (60 FPS)
                                                                              ↓
                                                                  Synchronized Lip Sync
```

1. **User speaks** → Agora RTC captures and streams audio to ConvoAI Engine
2. **ConvoAI processes** → Speech-to-text (ASR), LLM reasoning, text-to-speech (TTS)
3. **AI responds** → TTS audio streams back through Agora RTC as remote user
4. **WebAudio analyzes** → AnalyserNode performs FFT on audio stream (85-255 Hz speech range)
5. **Viseme mapping** → Frequency patterns map to phoneme shapes (A, E, I, O, U, PP, FF, etc.)
6. **Morph targets update** → ARKit blend shapes deform facial mesh at 60 FPS
7. **Avatar speaks** → Realistic lip sync with <50ms audio-to-visual latency

### Technical Deep Dive

#### **Frequency-to-Viseme Mapping**
Human speech frequencies cluster in predictable ranges:
- **Low (85-150 Hz)**: Open vowels → "O", "U" visemes
- **Mid (150-200 Hz)**: Central vowels → "A" visemes
- **High (200-255 Hz)**: Closed vowels → "E", "I" visemes
- **Consonants**: Distinct spikes → PP, FF, TH, kk visemes

#### **ARKit Blend Shape Targets**
```javascript
// Vowel phonemes with complex mouth shapes
A: { jawOpen: 0.7, mouthOpen: 0.8, mouthWide: 0.5 }
E: { jawOpen: 0.4, mouthOpen: 0.6, mouthWide: 0.7, mouthSmile: 0.3 }
I: { jawOpen: 0.2, mouthOpen: 0.3, mouthWide: 0.8, mouthSmile: 0.5 }
O: { jawOpen: 0.5, mouthOpen: 0.7, mouthFunnel: 0.6, mouthPucker: 0.4 }
U: { jawOpen: 0.3, mouthOpen: 0.4, mouthFunnel: 0.8, mouthPucker: 0.7 }

// Consonant phonemes with precise articulation
PP: { mouthPressLeft: 0.8, mouthPressRight: 0.8, mouthClose: 0.9 }
FF: { jawOpen: 0.1, mouthOpen: 0.2, mouthFunnel: 0.3 }
TH: { jawOpen: 0.3, mouthOpen: 0.4, tongueOut: 0.2 }
```

#### **Smooth Animation Pipeline**
- **Exponential Smoothing**: `lerp(current, target, 1 - exp(-15 * deltaTime))` eliminates jitter
- **Frame-Rate Independent**: Delta-time integration for consistent animation speed
- **Viseme Transitions**: 12x speed multiplier for natural phoneme blending
- **Breathing Variation**: `sin(time * 2) * 0.1` adds subtle idle movement
- **Intensity Scaling**: 2x-4x audio level multipliers for visible mouth movement

## 🚀 Quick Start

### Prerequisites
- [Agora account](https://console.agora.io/) with App ID and Token
- Agora ConvoAI API credentials ("Customer ID" and "Customer Secret")
- [OpenAI API key](https://platform.openai.com/) or compatible LLM
- [Azure Speech Services API key](https://portal.azure.com/) for TTS
- Modern browser with WebAudio API support (Chrome 80+, Firefox 75+, Safari 14+, Edge 80+)

### 1. **Access the Live Demo**
Visit: https://agoraio-community.github.io/RPM-agora-agent/

### 2. **Configure Your API Credentials**
Click the **Settings** (☰) button in the top-right and enter your credentials:

#### **Agora Tab**
```
App ID: [From Agora Console]
Token: [Generate from Agora Console]
Channel: [Your channel name, e.g., "test-channel"]
```

#### **ConvoAI Tab**
```
API Base URL: https://api.agora.io/v1
Customer ID: [Your ConvoAI Customer ID]
Customer Secret: [Your ConvoAI Customer Secret]
Agent Name: Virtual Assistant
Agent UID: 8888
```

#### **LLM Tab**
```
API URL: https://api.openai.com/v1
API Key: [Your OpenAI API Key]
Model: gpt-4o-mini
System Message: You are a friendly virtual agent assistant.
Greeting: Hello! How can I help you today?
```

#### **TTS Tab**
```
API Key: [Your Azure Speech Key]
Region: eastus (or your region)
Voice Name: en-US-AriaNeural
```

#### **ASR Tab**
```
Language: en-US
```

Settings are stored in sessionStorage during your browser session.

### 3. **Start Conversing with Your AI Avatar**
1. Click **Connect** to join the Agora channel
2. The ConvoAI agent will automatically join as a remote user
3. Start speaking - the avatar will listen and analyze your speech
4. The AI responds with synthesized voice and synchronized lip movements
5. Watch real-time lip sync powered by WebAudio FFT analysis!
18** - UI component framework
- **React Three Fiber** - React renderer for Three.js
- **Three.js** - WebGL graphics engine for 3D rendering
- **@react-three/drei** - Useful helpers for R3F (useGLTF, etc.)
- **Agora RTC SDK** - WebRTC communication and streaming
- **WebAudio API** - Browser-native audio analysis (AnalyserNode, FFT)
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

### **Real-Time Audio Processing**
- **Sample Rate**: 48kHz audio streams from Agora RTC
- **FFT Size**: 256 (provides 128 frequency bins)
- **Frequency Range**: 85-255 Hz (primary speech frequencies)
- **Analysis Rate**: ~60 FPS via requestAnimationFrame
- **Latency**: <50ms from audio output to visual update
- **Smoothing**: Exponential interpolation (`lerp` with `exp(-speed * deltaTime)`)

### **3D Avatar Architecture**
- **Model Format**: GLB (Binary glTF) - optimized for web streaming
- **Facial Rig**: 50+ ARKit-compatible morph targets
- **Rendering**: Three.js SkinnedMesh with morph target influences
- **Animation**: Frame-by-frame morph target updates at 60 FPS
- **Expressions**: Layered blend shapes (expressions + lip sync)
- **Source**: ReadyPlayer.me avatar creator with full facial rig

### **ConvoAI Integration**
- **REST API**: Join/leave agent endpoints
- **Authentication**: Basic Auth with Customer ID/Secret
- **Agent Lifecycle**: Programmatic agent creation and management
- **Voice Pipeline**: ASR → LLM → TTS fully managed by ConvoAI
- **Agent UID**: ConvoAI agent joins as remote user in Agora channel

*Manual controls override AI behavior for creative control*

## 🔧 Technical Architecture

### **Frontend Stack**
- **React Three Fiber** - 3D rendering and animation
- **Three.js** - WebGL graphics engine
- **WebAudio API** - Real-time audio analysis
- **Agora SDK** - WebRTC communication
- **Tailwind CSS** - UI styling

### **Real-Time Processing**
- **Audio Sampling**: 44.1kHz audio analysis
- **Frequency Analysis**: FFT processing for audio features
- **Viseme Detection**: Speech sound classification
- **Morph Target Interpolation**: Smooth facial animation
- **Frame Rate**: 60fps animation updates

### **3D Model Features**
- **File Format**: GLB (optimized for web)
- **Facial Rig**: 50+ morph targets
- **Animation System**: Mixamo-compatible FBX animations
- **Texture Resolution**: Optimized for real-time rendering
- **LOD System**: Performance-optimized for web browsers

## 💰 Cost Structure

### **User-Controlled Costs**
You provide all API credentials and control spending:
RPM-agora-agent

# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### **Project Structure**
```
src/
├── components/
│   ├── Avatar.jsx          # 3D avatar with lip sync engine
│   ├── Experience.jsx      # Three.js scene setup
│   ├── UI.jsx              # Main interface
│   ├── Settings.jsx        # API credentials panel
│   └── CombinedChat.jsx    # Chat interface
├── hooks/
│   ├── useAgora.jsx        # Agora RTC + ConvoAI integration
│   ├── useChat.jsx         # Chat state management
│   └── useLipSync.jsx      # Lip sync audio analysis
├── App.jsx                 # Root component
└── main.jsx                # Entry point
```

### **Customization Options**
- **Avatar Models**: Replace GLB files in `public/models/Avatars/` with custom ReadyPlayer.me avatars
- **Viseme Tuning**: Adjust frequency ranges and intensity multipliers in `useAgora.jsx`
- **LLM Models**: Switch between GPT-4, GPT-3.5, or other OpenAI-compatible APIs
- **TTS Voices**: Choose from 400+ Azure neural voices in different languages
- **UI Styling**: Modify Tailwind classes for custom appearance
- **Facial Expressions**: Add new expression presets in `Avatar.jsx`ser closes
- ✅ **Open Source** - Full code transparency
- ✅ **No Tracking** - No analytics or user tracking

## 🛠️ Advanced Development

### **Local Development**
```bash
# Clone repository
git clone https://github.com/AgoraIO-Community/RPM-agora-agent.git
cd agora-agent

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### **Key Development Features**
- **No Environment Variables** - All config via UI
- **Hot Module Replacement** - Instant code updates
- **Debug Panels** - Real-time lip sync monitoring
- **Animation Controls** - Manual override capabilities
- **Audio Level Indicators** - WebRTC connection status

### **Customization Options**
- **Avatar Models** - Replace GLB files with custom 3D models
- **Animation Sets** - Add custom FBX animations
- **Voice Personalities** - Configure different AI personalities
- **UI Themes** - Customize interface appearance
- **Lip Sync Tuning** - Adjust viseme sensitivity parameters

## � PerformanceResources

### **Common Issues**
1. **No Audio Output**: Check microphone permissions and Agora token validity
2. **ConvoAI Connection Failed**: Verify Customer ID/Secret and App ID match
3. **No Lip Sync**: Ensure AudioContext is not suspended (some browsers require user interaction)
4. **Avatar Not Loading**: Check browser console for GLB loading errors
5. **Performance Issues**: Close other browser tabs, check FPS in Three.js stats

### **Debug Mode**
- Open browser DevTools Console for detailed logs
- Check Network tab for ConvoAI API call responses
- Monitor WebAudio analyzer data in `useAgora.jsx`
- Use Three.js DevTools extension for scene inspection

### **Learn More**
- **Comprehensive Guide**: See [GUIDE.md](GUIDE.md) for detailed implementation walkthrough
- **Deployment**: See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment
- **Architecture**: See [docs/ARCHITECTURE_PLAN.md](docs/ARCHITECTURE_PLAN.md) for system design

### **Resources**
- [Agora ConvoAI Documentation](https://docs.agora.io/en/conversational-ai/overview/product-overview)
- [Agora RTC Web SDK Reference](https://docs.agora.io/en/voice-calling/reference/api)
- [ReadyPlayer.me Documentation](https://docs.readyplayer.me/)
- [WebAudio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Three.js Morph Targets](https://threejs.org/docs/#api/en/core/BufferGeometry.morphAttributes)
- Join the [Agora Developer Community](https://discord.gg/uhkxjDpJsN)

---

## 🎉 Experience Real-Time AI Avatars

**WebAudio-driven lip sync meets AI conversation in stunning 3D - all running in your browser with <50ms latency!**

**Live Demo**: https://agoraio-community.github.io/RPM-agora-agent/

---

*Built with ❤️ using Agora ConvoAI, ReadyPlayer.me, and WebAudio API*  
*Questions? Open an issue on [GitHub](https://github.com/AgoraIO-Community/RPM-agora-agent/issues)*
- ES6 modules

## 📞 Support & Troubleshooting

### **Common Issues**
1. **No Audio**: Check microphone permissions
2. **Connection Failed**: Verify Agora credentials
3. **No Lip Sync**: Ensure WebAudio permissions
4. **Performance Issues**: Lower quality settings

### **Debug Mode**
- Open browser DevTools
- Check Console for errors
- Monitor Network tab for API calls
- Use Performance tab for optimization

---

## 🎉 Experience the Future of AI Interaction

**Real-time lip sync meets AI conversation in stunning 3D - all running in your browser!**

**Live Demo**: https://agoraio-community.github.io/RPM-agora-agent/
