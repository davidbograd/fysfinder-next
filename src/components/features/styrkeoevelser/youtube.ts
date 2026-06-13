export const getYoutubeEmbedId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    if (
      u.hostname === "www.youtube.com" ||
      u.hostname === "youtube.com" ||
      u.hostname === "m.youtube.com"
    ) {
      const v = u.searchParams.get("v");
      if (v) {
        return v;
      }
      const pathMatch = u.pathname.match(/\/embed\/([^/]+)/);
      if (pathMatch) {
        return pathMatch[1];
      }
    }
  } catch {
    return null;
  }
  return null;
};

export const getYoutubeEmbedUrl = (url: string): string | null => {
  const id = getYoutubeEmbedId(url);
  if (!id) {
    return null;
  }
  return `https://www.youtube.com/embed/${id}`;
};

/** Poster image for schema / previews when no custom thumbnail is set. */
export const getYoutubePosterImageUrl = (url: string): string | null => {
  const id = getYoutubeEmbedId(url);
  if (!id) {
    return null;
  }
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
};
