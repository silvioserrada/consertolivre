function toRad(v: number) {
  return (v * Math.PI) / 180;
}

/** Distância aproximada em km entre duas coordenadas (fórmula de Haversine). */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const GUARULHOS_FALLBACK = { lat: -23.4543, lng: -46.5337, label: "Guarulhos, SP" };

/** Pede a localização do navegador; cai num fallback fixo se negado/indisponível. */
export function getUserLocation(): Promise<{ lat: number; lng: number; label: string }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(GUARULHOS_FALLBACK);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: "sua localização" }),
      () => resolve(GUARULHOS_FALLBACK),
      { timeout: 5000 }
    );
  });
}
