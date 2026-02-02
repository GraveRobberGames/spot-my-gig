export function truncateText(text, maxLength = 18) {
    if (!text) return "";
    if (text.length <= maxLength) return text;

    return text.slice(0, maxLength - 1) + "…";
}