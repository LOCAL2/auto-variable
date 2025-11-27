// GitHub Gist Service for URL shortening
// ฟรี 100% ไม่จำกัด

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';

interface GistData {
    code: string;
    variables: { name: string; color: string }[];
    filename?: string;
}

export const createGist = async (data: GistData): Promise<string> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
        const response = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` })
            },
            body: JSON.stringify({
                description: 'Variable Replacer Code Share',
                public: true, // public gist (works without auth)
                files: {
                    'code.json': {
                        content: JSON.stringify(data)
                    }
                }
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('GitHub API Error:', response.status, errorData);
            throw new Error(`Failed to create gist: ${response.status}`);
        }

        const gist = await response.json();
        return gist.id; // Short ID like "abc123def456"
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            console.error('Gist creation timeout');
            throw new Error('Gist creation timeout');
        }
        console.error('Gist creation error:', error);
        throw error;
    }
};

export const getGist = async (gistId: string): Promise<GistData | null> => {
    try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: {
                ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` })
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch gist');
        }

        const gist = await response.json();
        const content = gist.files['code.json']?.content;
        
        if (!content) {
            throw new Error('Invalid gist format');
        }

        return JSON.parse(content);
    } catch (error) {
        console.error('Gist fetch error:', error);
        return null;
    }
};
