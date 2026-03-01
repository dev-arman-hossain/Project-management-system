/**
 * Converts a Google Drive sharing link to a direct image link.
 * Example: https://drive.google.com/file/d/1_BlW9p-TG4uoj59rgbqSoi8Ift_zUM69/view?usp=sharing
 * to: https://lh3.googleusercontent.com/d/1_BlW9p-TG4uoj59rgbqSoi8Ift_zUM69
 */
export const convertDriveLink = (url: string | undefined): string | null => {
    if (!url) return null;

    // Regular expression to match Google Drive file ID
    const driveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);

    if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }

    // Already in correct format or doesn't match
    if (url.startsWith('https://lh3.googleusercontent.com/d/')) {
        return url;
    }

    return url;
};
