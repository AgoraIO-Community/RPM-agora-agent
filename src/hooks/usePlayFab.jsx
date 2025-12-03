import { createContext, useContext, useEffect, useState, useCallback } from "react";

const PlayFabContext = createContext();

// PlayFab Title ID for this application
const PLAYFAB_TITLE_ID = "139EEA";

export const PlayFabProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionTicket, setSessionTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved session on mount
  useEffect(() => {
    const savedTicket = localStorage.getItem('playfab_session_ticket');
    const savedUser = localStorage.getItem('playfab_user');
    
    if (savedTicket && savedUser) {
      setSessionTicket(savedTicket);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      console.log('✅ PlayFab session restored from localStorage');
    }
  }, []);

  // Generate a unique custom ID for the user
  const generateCustomId = () => {
    let customId = localStorage.getItem('playfab_custom_id');
    if (!customId) {
      customId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('playfab_custom_id', customId);
    }
    return customId;
  };

  // Make PlayFab API calls
  const makePlayFabRequest = async (endpoint, data) => {
    const url = `https://${PLAYFAB_TITLE_ID}.playfabapi.com/Client/${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PlayFabSDK': 'WebSDK-2.180.250815'
      },
      body: JSON.stringify({
        TitleId: PLAYFAB_TITLE_ID,
        ...data
      })
    });

    const result = await response.json();
    
    if (result.code !== 200) {
      throw new Error(result.errorMessage || 'PlayFab API error');
    }
    
    return result.data;
  };

  // Register a new user
  const registerUser = useCallback(async (username, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Registering new PlayFab user...');
      
      const customId = generateCustomId();
      
      // Step 1: Register with email and password
      const registerData = await makePlayFabRequest('RegisterPlayFabUser', {
        Username: username,
        Email: email,
        Password: password,
        RequireBothUsernameAndEmail: false
      });

      console.log('✅ User registered successfully:', registerData);

      // Step 2: Link the custom ID to this account
      await makePlayFabRequest('LinkCustomID', {
        SessionTicket: registerData.SessionTicket,
        CustomId: customId,
        ForceLink: true
      });

      console.log('✅ Custom ID linked successfully');

      // Save session data
      setSessionTicket(registerData.SessionTicket);
      setUser({
        PlayFabId: registerData.PlayFabId,
        Username: username,
        Email: email,
        CustomId: customId
      });
      setIsAuthenticated(true);

      // Persist to localStorage
      localStorage.setItem('playfab_session_ticket', registerData.SessionTicket);
      localStorage.setItem('playfab_user', JSON.stringify({
        PlayFabId: registerData.PlayFabId,
        Username: username,
        Email: email,
        CustomId: customId
      }));

      return registerData;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with email and password
  const loginWithEmail = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Logging in with email and password...');
      
      const loginData = await makePlayFabRequest('LoginWithEmailAddress', {
        Email: email,
        Password: password
      });

      console.log('✅ Login successful:', loginData);

      // Save session data
      setSessionTicket(loginData.SessionTicket);
      setUser({
        PlayFabId: loginData.PlayFabId,
        Email: email,
        CustomId: generateCustomId() // Use existing or generate new
      });
      setIsAuthenticated(true);

      // Persist to localStorage
      localStorage.setItem('playfab_session_ticket', loginData.SessionTicket);
      localStorage.setItem('playfab_user', JSON.stringify({
        PlayFabId: loginData.PlayFabId,
        Email: email,
        CustomId: generateCustomId()
      }));

      return loginData;
    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with custom ID (for returning users)
  const loginWithCustomId = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Logging in with custom ID...');
      
      const customId = generateCustomId();
      
      const loginData = await makePlayFabRequest('LoginWithCustomID', {
        CustomId: customId,
        CreateAccount: false // Don't create account, just login
      });

      console.log('✅ Custom ID login successful:', loginData);

      // Save session data
      setSessionTicket(loginData.SessionTicket);
      setUser({
        PlayFabId: loginData.PlayFabId,
        CustomId: customId
      });
      setIsAuthenticated(true);

      // Persist to localStorage
      localStorage.setItem('playfab_session_ticket', loginData.SessionTicket);
      localStorage.setItem('playfab_user', JSON.stringify({
        PlayFabId: loginData.PlayFabId,
        CustomId: customId
      }));

      return loginData;
    } catch (error) {
      console.error('❌ Custom ID login failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user exists by email
  const checkUserExists = useCallback(async (email) => {
    try {
      console.log('🔍 Checking if user exists...');
      
      // Try to get account info - this will fail if user doesn't exist
      await makePlayFabRequest('GetAccountInfo', {
        Email: email
      });
      
      console.log('✅ User exists');
      return true;
    } catch (error) {
      console.log('ℹ️ User does not exist or error checking:', error.message);
      return false;
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    console.log('🚪 Logging out...');
    
    setIsAuthenticated(false);
    setUser(null);
    setSessionTicket(null);
    setError(null);
    
    // Clear localStorage
    localStorage.removeItem('playfab_session_ticket');
    localStorage.removeItem('playfab_user');
    
    console.log('✅ Logged out successfully');
  }, []);

  // Call CloudScript function
  const executeCloudScript = useCallback(async (functionName, functionParameter = {}) => {
    if (!sessionTicket) {
      throw new Error('Not authenticated - cannot call CloudScript');
    }
    
    try {
      console.log(`☁️ Executing CloudScript function: ${functionName}`);
      
      const result = await makePlayFabRequest('ExecuteCloudScript', {
        SessionTicket: sessionTicket,
        FunctionName: functionName,
        FunctionParameter: functionParameter
      });

      console.log('✅ CloudScript executed successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ CloudScript execution failed:', error);
      throw error;
    }
  }, [sessionTicket]);

  // Get user data
  const getUserData = useCallback(async () => {
    if (!sessionTicket) {
      throw new Error('Not authenticated');
    }
    
    try {
      console.log('📊 Getting user data...');
      
      const result = await makePlayFabRequest('GetUserData', {
        SessionTicket: sessionTicket
      });

      console.log('✅ User data retrieved:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to get user data:', error);
      throw error;
    }
  }, [sessionTicket]);

  // Update user data
  const updateUserData = useCallback(async (data) => {
    if (!sessionTicket) {
      throw new Error('Not authenticated');
    }
    
    try {
      console.log('📝 Updating user data...');
      
      const result = await makePlayFabRequest('UpdateUserData', {
        SessionTicket: sessionTicket,
        Data: data
      });

      console.log('✅ User data updated:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to update user data:', error);
      throw error;
    }
  }, [sessionTicket]);

  const value = {
    // State
    isAuthenticated,
    user,
    sessionTicket,
    loading,
    error,
    titleId: PLAYFAB_TITLE_ID,
    
    // Authentication methods
    registerUser,
    loginWithEmail,
    loginWithCustomId,
    checkUserExists,
    logout,
    
    // PlayFab API methods
    executeCloudScript,
    getUserData,
    updateUserData,
    makePlayFabRequest,
    
    // Utility
    clearError: () => setError(null)
  };

  return (
    <PlayFabContext.Provider value={value}>
      {children}
    </PlayFabContext.Provider>
  );
};

export const usePlayFab = () => {
  const context = useContext(PlayFabContext);
  if (!context) {
    throw new Error('usePlayFab must be used within a PlayFabProvider');
  }
  return context;
};
