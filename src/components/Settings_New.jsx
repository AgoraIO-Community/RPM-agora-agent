import { useState, useEffect } from 'react';
import PlayFabAuth from './PlayFabAuth';

const Settings = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('agora');
  const [settings, setSettings] = useState({
    // Agora Configuration
    agoraAppId: '',
    agoraToken: '',
    agoraChannel: '',
    
    // ConvoAI REST API Configuration
    convoaiApiBaseUrl: '',
    restfulApiKey: '',
    restfulPassword: '',
    convoaiAgentName: '',
    convoaiAgentUid: '',
    
    // LLM Configuration
    llmUrl: '',
    llmApiKey: '',
    llmModel: '',
    llmSystemMessage: '',
    llmGreeting: '',
    
    // TTS Configuration
    ttsApiKey: '',
    ttsRegion: '',
    ttsVoiceName: '',
    
    // ASR Configuration
    asrLanguage: '',
  });

  // Load current environment variables when component mounts
  useEffect(() => {
    if (isOpen) {
      setSettings({
        // Agora Configuration
        agoraAppId: import.meta.env.VITE_AGORA_APP_ID || '',
        agoraToken: import.meta.env.VITE_AGORA_TOKEN || '',
        agoraChannel: import.meta.env.VITE_AGORA_CHANNEL || 'AgoraAgent_Channel',
        
        // ConvoAI REST API Configuration
        convoaiApiBaseUrl: import.meta.env.VITE_CONVOAI_API_BASE_URL || 'https://api.agora.io/api/conversational-ai-agent/v2',
        restfulApiKey: import.meta.env.VITE_RESTFUL_API_KEY || '',
        restfulPassword: import.meta.env.VITE_RESTFUL_PASSWORD || '',
        convoaiAgentName: import.meta.env.VITE_CONVOAI_AGENT_NAME || 'Agora Agent',
        convoaiAgentUid: import.meta.env.VITE_CONVOAI_AGENT_UID || '8888',
        
        // LLM Configuration
        llmUrl: import.meta.env.VITE_LLM_URL || 'https://api.openai.com/v1/chat/completions',
        llmApiKey: import.meta.env.VITE_LLM_API_KEY || '',
        llmModel: import.meta.env.VITE_LLM_MODEL || 'gpt-4o-mini',
        llmSystemMessage: import.meta.env.VITE_LLM_SYSTEM_MESSAGE || 'You are a friendly Agora agent assistant.',
        llmGreeting: import.meta.env.VITE_LLM_GREETING || "Hello! I'm your Agora agent. How can I help you today?",
        
        // TTS Configuration
        ttsApiKey: import.meta.env.VITE_TTS_API_KEY || '',
        ttsRegion: import.meta.env.VITE_TTS_REGION || 'eastus',
        ttsVoiceName: import.meta.env.VITE_TTS_VOICE_NAME || 'en-US-AriaNeural',
        
        // ASR Configuration
        asrLanguage: import.meta.env.VITE_ASR_LANGUAGE || 'en-US',
      });
    }
  }, [isOpen]);

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Convert camelCase keys to VITE_UPPER_CASE format and save to sessionStorage
    Object.entries(settings).forEach(([key, value]) => {
      // Convert camelCase to UPPER_CASE
      const envKey = key.replace(/([A-Z])/g, '_$1').toUpperCase();
      const fullEnvKey = `VITE_${envKey}`;
      
      if (value && value.trim() !== '') {
        sessionStorage.setItem(fullEnvKey, value.trim());
        console.log(`💾 Saved ${fullEnvKey}:`, value.trim());
      } else {
        // Remove empty values
        sessionStorage.removeItem(fullEnvKey);
      }
    });

    // Trigger custom event to notify components of sessionStorage update
    window.dispatchEvent(new Event('sessionStorageUpdate'));

    // Show success message
    alert('Settings saved! Please refresh the page for changes to take effect.');
    onClose();
  };

  const handleReset = () => {
    // Clear sessionStorage
    Object.keys(settings).forEach(key => {
      const envKey = key.replace(/([A-Z])/g, '_$1').toUpperCase();
      sessionStorage.removeItem(`VITE_${envKey}`);
    });
    
    // Reset to defaults
    setSettings({
      agoraAppId: '',
      agoraToken: '',
      agoraChannel: 'AgoraAgent_Channel',
      convoaiApiBaseUrl: 'https://api.agora.io/api/conversational-ai-agent/v2',
      restfulApiKey: '',
      restfulPassword: '',
      convoaiAgentName: 'Agora Agent',
      convoaiAgentUid: '8888',
      llmUrl: 'https://api.openai.com/v1/chat/completions',
      llmApiKey: '',
      llmModel: 'gpt-4o-mini',
      llmSystemMessage: 'You are a friendly Agora agent assistant.',
      llmGreeting: "Hello! I'm your Agora agent. How can I help you today?",
      ttsApiKey: '',
      ttsRegion: 'eastus',
      ttsVoiceName: 'en-US-AriaNeural',
      asrLanguage: 'en-US',
    });
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'agora', label: '🎯 Agora', icon: '🎯' },
    { id: 'convoai', label: '🤖 ConvoAI', icon: '🤖' },
    { id: 'llm', label: '🧠 LLM', icon: '🧠' },
    { id: 'tts', label: '🔊 TTS', icon: '🔊' },
    { id: 'asr', label: '🎙️ ASR', icon: '🎙️' },
    { id: 'playfab', label: '🎮 PlayFab', icon: '🎮' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'agora':
        return (
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">🎯 Agora Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  App ID *
                </label>
                <input
                  type="text"
                  value={settings.agoraAppId}
                  onChange={(e) => handleInputChange('agoraAppId', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Agora App ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Name *
                </label>
                <input
                  type="text"
                  value={settings.agoraChannel}
                  onChange={(e) => handleInputChange('agoraChannel', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="AgoraAgent_Channel"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token *
                </label>
                <textarea
                  value={settings.agoraToken}
                  onChange={(e) => handleInputChange('agoraToken', e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Agora Token"
                />
              </div>
            </div>
          </div>
        );

      case 'convoai':
        return (
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="text-lg font-semibold text-green-800 mb-4">🤖 ConvoAI REST API</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Base URL *
                </label>
                <input
                  type="url"
                  value={settings.convoaiApiBaseUrl}
                  onChange={(e) => handleInputChange('convoaiApiBaseUrl', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://api.agora.io/api/conversational-ai-agent/v2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The Agora ConvoAI REST API endpoint
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RESTful API Key *
                </label>
                <input
                  type="password"
                  value={settings.restfulApiKey}
                  onChange={(e) => handleInputChange('restfulApiKey', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your RESTful API Key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RESTful API Password *
                </label>
                <input
                  type="password"
                  value={settings.restfulPassword}
                  onChange={(e) => handleInputChange('restfulPassword', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your RESTful API Password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={settings.convoaiAgentName}
                  onChange={(e) => handleInputChange('convoaiAgentName', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Agora Agent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent UID
                </label>
                <input
                  type="number"
                  value={settings.convoaiAgentUid}
                  onChange={(e) => handleInputChange('convoaiAgentUid', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="8888"
                />
              </div>
            </div>
          </div>
        );

      case 'llm':
        return (
          <div className="border rounded-lg p-4 bg-indigo-50">
            <h3 className="text-lg font-semibold text-indigo-800 mb-4">🧠 Large Language Model (LLM)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LLM URL *
                </label>
                <input
                  type="url"
                  value={settings.llmUrl}
                  onChange={(e) => handleInputChange('llmUrl', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://api.openai.com/v1/chat/completions"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key *
                </label>
                <input
                  type="password"
                  value={settings.llmApiKey}
                  onChange={(e) => handleInputChange('llmApiKey', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Your LLM API Key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  value={settings.llmModel}
                  onChange={(e) => handleInputChange('llmModel', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="gpt-4o-mini"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Message
                </label>
                <textarea
                  value={settings.llmSystemMessage}
                  onChange={(e) => handleInputChange('llmSystemMessage', e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="You are a friendly Agora agent assistant."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Greeting Message
                </label>
                <textarea
                  value={settings.llmGreeting}
                  onChange={(e) => handleInputChange('llmGreeting', e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Hello! I'm your Agora agent. How can I help you today?"
                />
              </div>
            </div>
          </div>
        );

      case 'tts':
        return (
          <div className="border rounded-lg p-4 bg-yellow-50">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">🔊 Text-to-Speech (TTS)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TTS API Key *
                </label>
                <input
                  type="password"
                  value={settings.ttsApiKey}
                  onChange={(e) => handleInputChange('ttsApiKey', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Your Azure Speech API Key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Azure Region
                </label>
                <input
                  type="text"
                  value={settings.ttsRegion}
                  onChange={(e) => handleInputChange('ttsRegion', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="eastus"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice Name
                </label>
                <select
                  value={settings.ttsVoiceName}
                  onChange={(e) => handleInputChange('ttsVoiceName', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="en-US-AriaNeural">Aria (Female, US English)</option>
                  <option value="en-US-DavisNeural">Davis (Male, US English)</option>
                  <option value="en-US-ElizabethNeural">Elizabeth (Female, US English)</option>
                  <option value="en-US-GuyNeural">Guy (Male, US English)</option>
                  <option value="en-US-JennyNeural">Jenny (Female, US English)</option>
                  <option value="en-US-MichelleNeural">Michelle (Female, US English)</option>
                  <option value="en-GB-SoniaNeural">Sonia (Female, UK English)</option>
                  <option value="en-GB-RyanNeural">Ryan (Male, UK English)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'asr':
        return (
          <div className="border rounded-lg p-4 bg-orange-50">
            <h3 className="text-lg font-semibold text-orange-800 mb-4">🎙️ Automatic Speech Recognition (ASR)</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={settings.asrLanguage}
                  onChange={(e) => handleInputChange('asrLanguage', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                  <option value="ja-JP">Japanese</option>
                  <option value="ko-KR">Korean</option>
                  <option value="zh-CN">Chinese (Simplified)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'playfab':
        return <PlayFabAuth />;

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Configuration Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-50 border-b px-6 py-2">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>

        {/* Footer Actions */}
        {activeTab !== 'playfab' && (
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reset to Defaults
            </button>
            <div className="space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Help Text */}
        {activeTab !== 'playfab' && (
          <div className="px-6 pb-4 text-sm text-gray-600">
            <p className="mb-2">
              <strong>Note:</strong> Settings are saved in your browser session and will persist until you refresh the page or close the browser.
            </p>
            <p>
              Fields marked with <span className="text-red-500">*</span> are required for the application to function properly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
