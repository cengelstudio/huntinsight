export function formatName(name: string): string {
  if (!name) return name;

  return name
    .trim() // Remove leading/trailing spaces first
    .toLowerCase()
    .split(/\s+/) // Split by one or more whitespace characters
    .filter(word => word.length > 0) // Remove empty strings
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
