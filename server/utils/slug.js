export const slugify = (value = "") =>
  value
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);

export const makeExcerpt = (content = "", maxLength = 250) => {
  const plainText = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return plainText.length > maxLength
    ? `${plainText.slice(0, maxLength - 1).trimEnd()}…`
    : plainText;
};
