# Users Management Cloud Function

This Cloud Function provides server-side access to the Appwrite Users API for the admin dashboard.

## Setup Instructions

### 1. Create the Function in Appwrite Console

1. Go to your Appwrite Console → Functions
2. Click "Create Function"
3. Set the following:
   - **Function ID**: `users-management`
   - **Name**: Users Management
   - **Runtime**: Node.js 18.0 or later

### 2. Deploy the Function Code

1. In the function settings, go to the "Settings" tab
2. Upload the `index.js` file (or copy-paste its contents)
3. Set the following environment variables:
   - `APPWRITE_ENDPOINT`: `https://fra.cloud.appwrite.io/v1`
   - `APPWRITE_PROJECT_ID`: `696b5bee001fe3af955a`
   - `APPWRITE_API_KEY`: Your Appwrite API Key (from Settings → API Keys)

### 3. Set Function Permissions

1. Go to the "Settings" tab of the function
2. Under "Permissions", ensure the function has access to:
   - Users API (read, write, delete)

### 4. Deploy and Activate

1. Click "Deploy" to deploy the function
2. Once deployed, click "Activate" to make it live
3. The function will be accessible via the Functions SDK

## Testing

You can test the function using the Appwrite Console:
1. Go to Functions → users-management → Executions
2. Create a test execution with payload:
```json
{
  "action": "list"
}
```

## Function Actions

The function supports the following actions:

- `list` - List all users
- `get` - Get a single user by ID
- `create` - Create a new user (with optional role)
- `updateName` - Update user name
- `updateEmail` - Update user email
- `updateStatus` - Update user status (active/blocked)
- `updateLabels` - Update user labels (for roles)
- `updatePrefs` - Update user preferences
- `delete` - Delete a user

## Security Note

This function uses your Appwrite API Key, which should be kept secure. Never expose the API key in client-side code.
