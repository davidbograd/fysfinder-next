-- Online is now the ?online=true search filter, not a location. The "Online" pseudo-city
-- held only SEO text, which moved to src/content/find-seo-text/online.md. No clinics or
-- premium listings reference it; old URLs redirect in next.config.js.

DELETE FROM public.cities WHERE bynavn_slug = 'online';
