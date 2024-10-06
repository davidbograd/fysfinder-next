export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .trim();
}

export function deslugify(slug: string): string {
  return slug
    .split("-")
    .map((word) => {
      word = word.replace(/ae/g, "æ").replace(/oe/g, "ø").replace(/aa/g, "å");
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
