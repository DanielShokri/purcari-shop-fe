import { Client, Users } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  // Use static API key (set in Function Variables) or fallback to Dynamic API Key
  const apiKey = process.env.APPWRITE_USERS_API_KEY || process.env.APPWRITE_FUNCTION_API_KEY;
  
  // Debug logging
  log(`Endpoint: ${process.env.APPWRITE_FUNCTION_API_ENDPOINT}`);
  log(`Project ID: ${process.env.APPWRITE_FUNCTION_PROJECT_ID}`);
  log(`Using static key: ${process.env.APPWRITE_USERS_API_KEY ? 'YES' : 'NO'}`);
  log(`API Key present: ${apiKey ? 'YES' : 'NO'}`);

  if (!apiKey) {
    return res.json({ error: 'No API key available. Please set APPWRITE_USERS_API_KEY in function variables.' }, 500);
  }

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(apiKey);

  const users = new Users(client);

  try {
    // Parse the request body
    const body = req.body ? (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) : {};
    const { action, userId, email, password, name, role, status, labels, prefs } = body;

    log(`Executing action: ${action}`);

    let result;

    switch (action) {
      case 'list':
        // List all users
        const usersList = await users.list();
        result = { users: usersList.users, total: usersList.total };
        break;

      case 'get':
        // Get a single user by ID
        if (!userId) throw new Error('userId is required');
        result = await users.get(userId);
        break;

      case 'create':
        // Create a new user
        if (!email || !password) throw new Error('email and password are required');
        const newUser = await users.create(
          userId || 'unique()',
          email,
          undefined, // phone
          password,
          name || undefined
        );
        // If role is provided, set it as a label
        if (role) {
          await users.updateLabels(newUser.$id, [role]);
          newUser.labels = [role];
        }
        result = newUser;
        break;

      case 'updateName':
        // Update user name
        if (!userId || !name) throw new Error('userId and name are required');
        result = await users.updateName(userId, name);
        break;

      case 'updateEmail':
        // Update user email
        if (!userId || !email) throw new Error('userId and email are required');
        result = await users.updateEmail(userId, email);
        break;

      case 'updateStatus':
        // Update user status (true = active, false = blocked)
        if (!userId || status === undefined) throw new Error('userId and status are required');
        result = await users.updateStatus(userId, status);
        break;

      case 'updateLabels':
        // Update user labels (used for roles)
        if (!userId || !labels) throw new Error('userId and labels are required');
        result = await users.updateLabels(userId, labels);
        break;

      case 'updatePrefs':
        // Update user preferences
        if (!userId || !prefs) throw new Error('userId and prefs are required');
        result = await users.updatePrefs(userId, prefs);
        break;

      case 'delete':
        // Delete a user
        if (!userId) throw new Error('userId is required');
        await users.delete(userId);
        result = { success: true, userId };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return res.json({ data: result });
  } catch (err) {
    error(`Error: ${err.message}`);
    return res.json({ error: err.message }, 400);
  }
};
