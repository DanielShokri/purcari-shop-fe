# Users Management Cloud Function

This Appwrite Cloud Function handles user management operations using the Server SDK with **Dynamic API Keys**.

## Function Configuration (Already Done)

- **Function ID**: `users-management`
- **Runtime**: Node.js 18
- **Scopes**: `users.read`, `users.write` (configured for Dynamic API Key)
- **Execute permissions**: `any` (authenticated users can call)

## Deployment

You only need to deploy the code. No API keys to manage!

### Option 1: Deploy via Appwrite CLI (Recommended)

```bash
# Install CLI if needed
npm install -g appwrite-cli

# Login
appwrite login

# Deploy from project root
appwrite deploy function --functionId=users-management
```

### Option 2: Deploy via Appwrite Console

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Select your project → **Functions** → **users-management**
3. Click **Create deployment**
4. Choose **Manual** and upload a zip of this folder

### Option 3: Zip and Upload

```bash
cd functions/users-management
zip -r users-management.zip .
# Then upload users-management.zip in Appwrite Console
```

## How Dynamic API Keys Work

- Appwrite automatically provides `APPWRITE_FUNCTION_API_KEY` at runtime
- The key is short-lived and scoped to `users.read` and `users.write`
- No manual API key management needed!

## Testing

After deployment:

```bash
appwrite functions createExecution \
  --functionId=users-management \
  --body='{"action":"list"}'
```

## Available Actions

| Action | Parameters | Description |
|--------|------------|-------------|
| `list` | - | List all users |
| `get` | `userId` | Get a single user |
| `create` | `email`, `password`, `userId?`, `name?`, `role?` | Create user |
| `updateName` | `userId`, `name` | Update name |
| `updateEmail` | `userId`, `email` | Update email |
| `updateStatus` | `userId`, `status` (boolean) | Activate/block |
| `updateLabels` | `userId`, `labels` (array) | Update roles |
| `updatePrefs` | `userId`, `prefs` (object) | Update preferences |
| `delete` | `userId` | Delete user |
