const { Client, Users, ID } = require('node-appwrite');

/**
 * Appwrite Cloud Function for User Management
 * 
 * This function provides server-side access to the Appwrite Users API
 * Required environment variables:
 * - APPWRITE_ENDPOINT
 * - APPWRITE_PROJECT_ID
 * - APPWRITE_API_KEY
 */

module.exports = async (req, res) => {
  // Set CORS headers
  res.headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.json({}, 200);
  }

  try {
    // Initialize Appwrite Server SDK
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '696b5bee001fe3af955a')
      .setKey(process.env.APPWRITE_API_KEY);

    const users = new Users(client);

    // Parse request body
    const payload = JSON.parse(req.payload || '{}');
    const { action } = payload;

    let result;

    switch (action) {
      case 'list':
        result = await users.list();
        return res.json({ data: result }, 200);

      case 'get':
        if (!payload.userId) {
          return res.json({ error: 'userId is required' }, 400);
        }
        result = await users.get(payload.userId);
        return res.json({ data: result }, 200);

      case 'create':
        if (!payload.userId || !payload.email || !payload.password) {
          return res.json({ error: 'userId, email, and password are required' }, 400);
        }
        result = await users.create(
          payload.userId,
          payload.email,
          payload.password,
          payload.name || ''
        );
        
        // Set role via labels if provided
        if (payload.role) {
          await users.updateLabels(payload.userId, [payload.role]);
        }
        
        // Fetch updated user
        result = await users.get(payload.userId);
        return res.json({ data: result }, 201);

      case 'updateName':
        if (!payload.userId || !payload.name) {
          return res.json({ error: 'userId and name are required' }, 400);
        }
        result = await users.updateName(payload.userId, payload.name);
        return res.json({ data: result }, 200);

      case 'updateEmail':
        if (!payload.userId || !payload.email) {
          return res.json({ error: 'userId and email are required' }, 400);
        }
        result = await users.updateEmail(payload.userId, payload.email);
        return res.json({ data: result }, 200);

      case 'updateStatus':
        if (!payload.userId || payload.status === undefined) {
          return res.json({ error: 'userId and status are required' }, 400);
        }
        result = await users.updateStatus(payload.userId, payload.status);
        return res.json({ data: result }, 200);

      case 'updateLabels':
        if (!payload.userId || !payload.labels) {
          return res.json({ error: 'userId and labels are required' }, 400);
        }
        result = await users.updateLabels(payload.userId, payload.labels);
        return res.json({ data: result }, 200);

      case 'updatePrefs':
        if (!payload.userId || !payload.prefs) {
          return res.json({ error: 'userId and prefs are required' }, 400);
        }
        result = await users.updatePrefs(payload.userId, payload.prefs);
        return res.json({ data: result }, 200);

      case 'delete':
        if (!payload.userId) {
          return res.json({ error: 'userId is required' }, 400);
        }
        await users.delete(payload.userId);
        return res.json({ data: { success: true } }, 200);

      default:
        return res.json({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    console.error('Function error:', error);
    return res.json(
      { error: error.message || 'שגיאה בעיבוד הבקשה' },
      500
    );
  }
};
