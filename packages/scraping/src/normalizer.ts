// A simple version of diacritics removal
const diacriticsMap: { [key: string]: string } = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ñ': 'n',
    'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U', 'Ü': 'U', 'Ñ': 'N'
    // Add more mappings as needed
};

export function normalizeRiderName(name: string): string {
    let normalized = name.toLowerCase();
    
    // Remove diacritics
    normalized = normalized.replace(/[áéíóúüñÁÉÍÓÚÜÑ]/g, char => diacriticsMap[char] || char);

    // Remove anything in parentheses (like nicknames)
    normalized = normalized.replace(/\(.*\)/g, '');

    // Standardize spacing
    normalized = normalized.replace(/\s+/g, ' ').trim();

    // Handle initials, e.g., "J. Vingegaard" -> "jonas vingegaard" (this is tricky)
    // A simple approach might just remove dots.
    normalized = normalized.replace(/\./g, '');

    return normalized;
}

// Levenshtein distance for fuzzy matching
export function levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}
