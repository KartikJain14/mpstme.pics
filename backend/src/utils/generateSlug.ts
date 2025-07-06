export function generateSlug(input: string) {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with -
        .replace(/^-+|-+$/g, "") // Trim -
        .slice(0, 50); // Limit length
}
