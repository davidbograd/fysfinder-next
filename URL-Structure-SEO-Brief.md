# FysFinder Search URL Structure

## Option 1: Query Parameters (Non-indexable Filters)

Primary URLs (Indexable)

```
/find/fysioterapeut/{location}
/find/fysioterapeut/{location}/{specialty}
```

Filtered URLs (Non-indexable)

```
/find/fysioterapeut/{location}?ydernummer=true&handicap=true
/find/fysioterapeut/{location}/{specialty}?ydernummer=true
```

## Option 2: Path-based Filters (Indexable)

Primary URLs (Indexable)

```
/find/fysioterapeut/{location}
/find/fysioterapeut/{location}/{specialty}
/find/fysioterapeut/{location}/{specialty}/ydernummer
```

Filtered URLs (Non-indexable)

```
/find/fysioterapeut/{location}?parameters-goes-here
/find/fysioterapeut/{location}/{specialty}?parameters-goes-here
/find/fysioterapeut/{location}/{specialty}/ydernummer?parameters-goes-here
```
