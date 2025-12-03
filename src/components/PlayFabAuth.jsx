import { useState } from 'react';
import { usePlayFab } from '../hooks/usePlayFab';

const PlayFabAuth = () => {
  const {
    isAuthenticated,
    user,
    loading,
    error,
    titleId,
    registerUser,
    loginWithEmail,
    loginWithCustomId,
    checkUserExists,
    logout,
    clearError,
    executeCloudScript,
    getUserData
  } = usePlayFab();

  const [mode, setMode] = useState('check'); // 'check', 'login', 'register'
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [cloudScriptFunction, setCloudScriptFunction] = useState('');
  const [cloudScriptParams, setCloudScriptParams] = useState('{}');
  const [cloudScriptResult, setCloudScriptResult] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handleCheckUser = async (e) => {
    e.preventDefault();
    if (!formData.email) return;

    try {
      const exists = await checkUserExists(formData.email);
      setMode(exists ? 'login' : 'register');
    } catch (err) {
      console.error('Error checking user:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    try {
      await loginWithEmail(formData.email, formData.password);
      setFormData({ email: '', username: '', password: '', confirmPassword: '' });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.username || !formData.password) return;
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      await registerUser(formData.username, formData.email, formData.password);
      setFormData({ email: '', username: '', password: '', confirmPassword: '' });
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleQuickLogin = async () => {
    try {
      await loginWithCustomId();
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  const handleExecuteCloudScript = async () => {
    if (!cloudScriptFunction) return;

    try {
      let params = {};
      if (cloudScriptParams.trim()) {
        params = JSON.parse(cloudScriptParams);
      }
      
      const result = await executeCloudScript(cloudScriptFunction, params);
      setCloudScriptResult(result);
    } catch (err) {
      console.error('CloudScript execution failed:', err);
      setCloudScriptResult({ error: err.message });
    }
  };

  const handleGetUserData = async () => {
    try {
      const data = await getUserData();
      setCloudScriptResult(data);
    } catch (err) {
      console.error('Get user data failed:', err);
      setCloudScriptResult({ error: err.message });
    }
  };

  const resetForm = () => {
    setMode('check');
    setFormData({ email: '', username: '', password: '', confirmPassword: '' });
    clearError();
  };

  if (isAuthenticated) {
    return (
      <div className="border rounded-lg p-4 bg-purple-50">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">🎮 PlayFab Authentication</h3>
        
        {/* User Info */}
        <div className="bg-green-100 p-3 rounded-md mb-4">
          <h4 className="font-semibold text-green-800 mb-2">✅ Authenticated User</h4>
          <div className="text-sm text-green-700 space-y-1">
            <div><strong>Title ID:</strong> {titleId}</div>
            <div><strong>PlayFab ID:</strong> {user?.PlayFabId}</div>
            {user?.Username && <div><strong>Username:</strong> {user.Username}</div>}
            {user?.Email && <div><strong>Email:</strong> {user.Email}</div>}
            <div><strong>Custom ID:</strong> {user?.CustomId}</div>
          </div>
        </div>

        {/* CloudScript Testing */}
        <div className="space-y-4">
          <h4 className="font-semibold text-purple-800">☁️ CloudScript Functions</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Function Name
              </label>
              <input
                type="text"
                value={cloudScriptFunction}
                onChange={(e) => setCloudScriptFunction(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., HelloWorld"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parameters (JSON)
              </label>
              <input
                type="text"
                value={cloudScriptParams}
                onChange={(e) => setCloudScriptParams(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder='{"key": "value"}'
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleExecuteCloudScript}
              disabled={loading || !cloudScriptFunction}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Executing...' : 'Execute CloudScript'}
            </button>
            
            <button
              onClick={handleGetUserData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get User Data'}
            </button>
          </div>

          {/* CloudScript Result */}
          {cloudScriptResult && (
            <div className="bg-gray-100 p-3 rounded-md">
              <h5 className="font-semibold text-gray-800 mb-2">Result:</h5>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(cloudScriptResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="flex justify-end mt-4">
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-purple-50">
      <h3 className="text-lg font-semibold text-purple-800 mb-4">🎮 PlayFab Authentication</h3>
      
      <div className="bg-blue-100 p-3 rounded-md mb-4">
        <div className="text-sm text-blue-700">
          <div><strong>Title ID:</strong> {titleId}</div>
          <div className="mt-1">Connect to PlayFab to access CloudScript functions and user management.</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 p-3 rounded-md mb-4">
          <div className="text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Quick Login Option */}
      <div className="mb-4">
        <button
          onClick={handleQuickLogin}
          disabled={loading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Connecting...' : 'Quick Login (Custom ID)'}
        </button>
        <p className="text-xs text-gray-600 mt-1">
          Use device-specific ID for anonymous authentication
        </p>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-purple-50 text-gray-500">or login with email</span>
        </div>
      </div>

      {/* Email Check Form */}
      {mode === 'check' && (
        <form onSubmit={handleCheckUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !formData.email}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Continue'}
          </button>
        </form>
      )}

      {/* Login Form */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        </form>
      )}

      {/* Registration Form */}
      {mode === 'register' && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Choose a username"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.username || !formData.password || !formData.confirmPassword}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PlayFabAuth;
