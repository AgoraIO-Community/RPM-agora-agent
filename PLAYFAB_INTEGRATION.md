# PlayFab Integration Guide

## Overview

The Agora Agent application now includes PlayFab authentication and CloudScript integration. This allows users to:

- Authenticate with PlayFab using email/password or custom ID
- Execute CloudScript functions from the client
- Store and retrieve user data
- Integrate with PlayFab's backend services

## Features

### 1. Authentication Methods

#### Quick Login (Custom ID)
- Uses device-specific unique ID for anonymous authentication
- Automatically generates and stores a custom ID in localStorage
- Perfect for guest users or quick access

#### Email/Password Authentication
- **First-time users**: Enter email → Create account with username and password
- **Returning users**: Enter email → Login with password
- Supports both registration and login flows

### 2. PlayFab Configuration

- **Title ID**: `139EEA` (pre-configured)
- **API Endpoint**: `https://139EEA.playfabapi.com/Client/`
- **SDK Version**: `WebSDK-2.180.250815`

### 3. CloudScript Integration

Once authenticated, users can:
- Execute CloudScript functions by name
- Pass JSON parameters to functions
- View function results in real-time
- Test backend functionality directly from the UI

### 4. User Data Management

- Get user data from PlayFab
- Update user data
- Persistent storage across sessions

## Usage Instructions

### Getting Started

1. **Open Settings**: Click the settings button in the application
2. **Navigate to PlayFab Tab**: Click on the "🎮 PlayFab" tab
3. **Choose Authentication Method**:
   - For quick access: Click "Quick Login (Custom ID)"
   - For persistent account: Enter email and follow the flow

### First-Time User Registration

1. Enter your email address
2. Click "Continue"
3. If no account exists, you'll see the registration form
4. Enter username, password, and confirm password
5. Click "Create Account"
6. You'll be automatically logged in

### Returning User Login

1. Enter your email address
2. Click "Continue"
3. If account exists, you'll see the login form
4. Enter your password
5. Click "Login"

### CloudScript Testing

1. After authentication, you'll see the CloudScript section
2. Enter the function name (e.g., "HelloWorld")
3. Enter parameters in JSON format (e.g., `{"message": "test"}`)
4. Click "Execute CloudScript"
5. View the results below

## Technical Implementation

### File Structure

```
src/
├── hooks/
│   └── usePlayFab.jsx          # PlayFab context and API integration
├── components/
│   ├── PlayFabAuth.jsx         # Authentication UI component
│   └── Settings.jsx            # Updated settings with tabs
└── main.jsx                    # Provider integration
```

### Key Components

#### usePlayFab Hook
- Manages authentication state
- Provides API methods for PlayFab interaction
- Handles session persistence
- Includes error handling

#### PlayFabAuth Component
- User-friendly authentication UI
- Support for multiple auth flows
- CloudScript testing interface
- Real-time status updates

### API Methods Available

```javascript
const {
  // Authentication
  registerUser,
  loginWithEmail,
  loginWithCustomId,
  logout,
  
  // CloudScript
  executeCloudScript,
  
  // User Data
  getUserData,
  updateUserData,
  
  // Utilities
  checkUserExists,
  makePlayFabRequest
} = usePlayFab();
```

## Development Notes

### Environment Variables
No additional environment variables needed. The Title ID is hardcoded for this specific application.

### Error Handling
- Network errors are caught and displayed in the UI
- Invalid credentials show user-friendly error messages
- Session restoration on page reload

### Local Storage
- Custom ID is stored for device identification
- Session ticket is stored for authentication persistence
- User data is cached locally

## CloudScript Development

To create CloudScript functions for this application:

1. Go to PlayFab Developer Portal
2. Navigate to your title (139EEA)
3. Go to Automation > CloudScript
4. Write your functions in JavaScript
5. Test them using the UI component

Example CloudScript function:
```javascript
handlers.HelloWorld = function(args, context) {
    return {
        message: "Hello from CloudScript!",
        input: args,
        timestamp: new Date().toISOString()
    };
};
```

## Security Considerations

- Passwords are never stored locally
- Session tickets have PlayFab-managed expiration
- Custom IDs are unique per device
- All API calls use HTTPS
- Client-side validation with server-side enforcement

## Troubleshooting

### Common Issues

1. **"PlayFab API error"**: Check network connection and PlayFab service status
2. **"Not authenticated"**: Session may have expired, try logging in again
3. **"User does not exist"**: Email might be incorrect or account not created
4. **CloudScript errors**: Check function name and parameters format

### Debug Information

The browser console shows detailed logs for:
- Authentication attempts
- API requests and responses
- Session management
- Error details

## Future Enhancements

Potential additions:
- Social authentication (Facebook, Google)
- Leaderboards integration
- Virtual currency management
- Multiplayer matchmaking
- Push notifications
- Analytics integration
