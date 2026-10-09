-- One-time copy fix: cities that take "på" (islands, bydele, peninsulas) had
-- SEO text written with "i <bynavn>". Rewrite to "på <bynavn>" / "På <bynavn>"
-- and normalize the brand name in the same rows.
UPDATE public.cities
SET seo_tekst = replace(
  regexp_replace(
    regexp_replace(
      seo_tekst,
      '(^|[^[:alpha:]])i (' || bynavn || ')(?![[:alpha:]])',
      '\1på \2',
      'g'
    ),
    '(^|[^[:alpha:]])I (' || bynavn || ')(?![[:alpha:]])',
    '\1På \2',
    'g'
  ),
  'FysFinder',
  'Fysfinder'
)
WHERE location_preposition = 'på'
  AND seo_tekst IS NOT NULL;
