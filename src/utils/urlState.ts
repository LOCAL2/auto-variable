// Helper to convert Blob to Base64URL (URL-safe, shorter)
const blobToBase64URL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            // Convert to URL-safe base64 (remove padding and replace chars)
            const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            resolve(base64url);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Helper to convert Base64URL to Blob
const base64URLToBlob = async (base64url: string): Promise<Blob> => {
    // Convert URL-safe base64 back to standard base64
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
        base64 += '=';
    }
    const response = await fetch(`data:application/octet-stream;base64,${base64}`);
    return response.blob();
};

interface CodeState {
    code: string;
    variables: { name: string; color: string }[];
    targetVar?: string;
    filename?: string;
}

export const compressState = async (state: CodeState | any): Promise<string> => {
    try {
        // Minify JSON by removing unnecessary whitespace
        const jsonString = JSON.stringify(state);

        // Create a stream to compress the data
        const stream = new Blob([jsonString]).stream();
        const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
        const response = await new Response(compressedStream);
        const blob = await response.blob();

        // Convert blob to URL-safe base64 (shorter URLs)
        return await blobToBase64URL(blob);
    } catch (error) {
        console.error("Compression error:", error);
        // Fallback to URL-safe base64 if compression fails
        const base64 = btoa(JSON.stringify(state));
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
};

export const decompressState = async (hash: string): Promise<any> => {
    try {
        const base64url = hash.substring(1); // Remove #

        // Try GZIP decompression first (with URL-safe base64)
        try {
            const blob = await base64URLToBlob(base64url);
            const stream = blob.stream();
            const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
            const response = await new Response(decompressedStream);
            const text = await response.text();
            const state = JSON.parse(text);

            // Normalize legacy state to new format
            if (state.targetVar && !state.variables) {
                state.variables = [{ name: state.targetVar, color: '#6366f1' }];
            }
            return state;
        } catch (gzipError) {
            // If GZIP fails, try legacy base64 decode (backward compatibility)
            console.log("GZIP decompression failed, trying legacy base64...", gzipError);
            // Try URL-safe base64 first
            let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) {
                base64 += '=';
            }
            const text = atob(base64);
            const state = JSON.parse(text);
            // Normalize legacy state
            if (state.targetVar && !state.variables) {
                state.variables = [{ name: state.targetVar, color: '#6366f1' }];
            }
            return state;
        }
    } catch (error) {
        console.error("Decompression error:", error);
        return null;
    }
};

export const encodeStateLegacy = (state: any): string => {
    return btoa(encodeURIComponent(JSON.stringify(state)));
};

export const decodeStateLegacy = (hash: string): any => {
    const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
    return JSON.parse(decodeURIComponent(atob(cleanHash)));
};
