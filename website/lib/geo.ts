/** [longitude, latitude], the order MapLibre and GeoJSON use. */
export type LngLat = [number, number];

const RAD = Math.PI / 180;

/** Converts a `[lat, lng]` location into `[lng, lat]`. */
export function toLngLat([lat, lng]: [number, number]): LngLat {
  return [lng, lat];
}

function toVector([lng, lat]: LngLat): [number, number, number] {
  return [
    Math.cos(lat * RAD) * Math.cos(lng * RAD),
    Math.cos(lat * RAD) * Math.sin(lng * RAD),
    Math.sin(lat * RAD),
  ];
}

/**
 * Points along the great circle between two positions, one every `stepDeg`
 * degrees. Longitudes stay continuous (they may go past ±180) so the line
 * doesn't jump across the map at the antimeridian.
 */
export function greatCircle(from: LngLat, to: LngLat, stepDeg = 2): LngLat[] {
  const a = toVector(from);
  const b = toVector(to);
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const angle = Math.acos(dot);
  const steps = Math.max(1, Math.ceil(angle / RAD / stepDeg));
  const points: LngLat[] = [];

  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const sin = Math.sin(angle);
    const wa = angle < 1e-6 ? 1 - t : Math.sin((1 - t) * angle) / sin;
    const wb = angle < 1e-6 ? t : Math.sin(t * angle) / sin;
    const [x, y, z] = a.map((v, i) => wa * v + wb * b[i]);

    let lng = Math.atan2(y, x) / RAD;
    const lat = Math.asin(Math.max(-1, Math.min(1, z))) / RAD;
    const previous = points.at(-1);
    if (previous) {
      while (lng - previous[0] > 180) lng -= 360;
      while (lng - previous[0] < -180) lng += 360;
    }
    points.push([lng, lat]);
  }

  return points;
}
