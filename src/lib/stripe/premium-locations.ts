const MAX_PREMIUM_NEIGHBOR_CITIES = 2;

export function buildPremiumLocationCityIds(params: {
  homeCityId: string | null;
  selectedCityIds: string[];
  allowedCityIds: Set<string>;
}): string[] {
  const { homeCityId, selectedCityIds, allowedCityIds } = params;
  const uniqueNeighborCityIds: string[] = [];

  for (const cityId of selectedCityIds) {
    if (!allowedCityIds.has(cityId)) continue;
    if (homeCityId && cityId === homeCityId) continue;
    if (uniqueNeighborCityIds.includes(cityId)) continue;

    uniqueNeighborCityIds.push(cityId);
    if (uniqueNeighborCityIds.length >= MAX_PREMIUM_NEIGHBOR_CITIES) {
      break;
    }
  }

  if (!homeCityId) {
    return uniqueNeighborCityIds;
  }

  return [homeCityId, ...uniqueNeighborCityIds];
}
