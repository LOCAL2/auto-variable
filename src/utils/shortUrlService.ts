// Short URL Service using GitHub Gist as database
const GIST_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const SHORT_URL_DB_GIST_ID = import.meta.env.VITE_SHORT_URL_GIST_ID || '';

interface ShortUrlMapping {
  [shortCode: string]: string; // shortCode -> gistId
}

// Generate random short code (4-6 characters)
const generateShortCode = (length: number = 5): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Get current mapping from database gist
const getMapping = async (): Promise<ShortUrlMapping> => {
  if (!SHORT_URL_DB_GIST_ID) {
    throw new Error('SHORT_URL_GIST_ID not configured');
  }

  try {
    const response = await fetch(`https://api.github.com/gists/${SHORT_URL_DB_GIST_ID}`, {
      headers: GIST_TOKEN ? { Authorization: `token ${GIST_TOKEN}` } : {},
    });

    if (!response.ok) throw new Error('Failed to fetch mapping');

    const data = await response.json();
    const content = data.files['shorturl-db.json']?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching mapping:', error);
    return {};
  }
};

// Update mapping in database gist
const updateMapping = async (mapping: ShortUrlMapping): Promise<void> => {
  if (!SHORT_URL_DB_GIST_ID || !GIST_TOKEN) {
    throw new Error('SHORT_URL_GIST_ID or GITHUB_TOKEN not configured');
  }

  const response = await fetch(`https://api.github.com/gists/${SHORT_URL_DB_GIST_ID}`, {
    method: 'PATCH',
    headers: {
      Authorization: `token ${GIST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: {
        'shorturl-db.json': {
          content: JSON.stringify(mapping, null, 2),
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update mapping');
  }
};

// Create short URL
export const createShortUrl = async (gistId: string): Promise<string> => {
  const mapping = await getMapping();
  
  // Check if gistId already has a short code
  for (const [code, id] of Object.entries(mapping)) {
    if (id === gistId) {
      return code;
    }
  }

  // Generate new short code
  let shortCode = generateShortCode();
  let attempts = 0;
  while (mapping[shortCode] && attempts < 10) {
    shortCode = generateShortCode();
    attempts++;
  }

  if (mapping[shortCode]) {
    shortCode = generateShortCode(6); // Use longer code if collision
  }

  // Save mapping
  mapping[shortCode] = gistId;
  await updateMapping(mapping);

  return shortCode;
};

// Resolve short code to gist ID
export const resolveShortUrl = async (shortCode: string): Promise<string | null> => {
  const mapping = await getMapping();
  return mapping[shortCode] || null;
};
