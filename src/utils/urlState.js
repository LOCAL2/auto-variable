
// Helper to convert Blob to Base64
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Helper to convert Base64 to Blob
const base64ToBlob = async (base64) => {
    const response = await fetch(`data:application/octet-stream;base64,${base64}`);
    return response.blob();
};

export const compressState = async (state) => {
    try {
        const jsonString = JSON.stringify(state);

        // Create a stream to compress the data
        const stream = new Blob([jsonString]).stream();
        const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
        const response = await new Response(compressedStream);
        const blob = await response.blob();

        // Convert blob to base64
        return await blobToBase64(blob);
    } catch (error) {
        console.error("Compression error:", error);
        // Fallback to simple base64 if compression fails
        return btoa(JSON.stringify(state));
    }
};

export const decompressState = async (hash) => {
    try {
        const base64 = hash.substring(1); // Remove #

        // Try GZIP decompression first
        try {
            const blob = await base64ToBlob(base64);
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

export const encodeStateLegacy = (state) => {
    return btoa(encodeURIComponent(JSON.stringify(state)));
};

export const decodeStateLegacy = (hash) => {
    const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
    return JSON.parse(decodeURIComponent(atob(cleanHash)));
};
