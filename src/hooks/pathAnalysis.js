/**
 * Extracts typographic properties from a drawn silhouette path.
 * Returns values between 0-1 (or small ranges) for each property.
 */

export function analysePath(points) {
  if (!points || points.length < 4) return null;

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const width  = maxX - minX || 1;
  const height = maxY - minY || 1;

  // ── Drape: vertical centre of mass (0 = top-heavy, 1 = bottom-heavy)
  const avgY = ys.reduce((a, b) => a + b, 0) / ys.length;
  const drape = (avgY - minY) / height;

  // ── Curvature: how much the path turns on average
  let totalTurn = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const dx1 = points[i].x - points[i-1].x;
    const dy1 = points[i].y - points[i-1].y;
    const dx2 = points[i+1].x - points[i].x;
    const dy2 = points[i+1].y - points[i].y;
    const a1 = Math.atan2(dy1, dx1);
    const a2 = Math.atan2(dy2, dx2);
    let diff = Math.abs(a2 - a1);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    totalTurn += diff;
  }
  const curvature = Math.min(totalTurn / points.length / 0.5, 1);

  // ── Tension: how vertically stretched the shape is
  const tension = Math.min(height / (width + 1) / 2, 1);

  // ── Width ratio: aspect ratio mapped to condensed vs extended
  const aspect = Math.min(Math.max(width / (height + 1), 0.2), 3);
  const widthRatio = Math.min(aspect / 1.5, 1); // 0=condensed, 1=extended

  // ── Symmetry: how symmetric the path is around its vertical midpoint
  const midX = (minX + maxX) / 2;
  let asymmetry = 0;
  points.forEach(p => { asymmetry += Math.abs(p.x - midX) / width; });
  asymmetry = Math.min(asymmetry / points.length * 2, 1);

  return { drape, curvature, tension, widthRatio, asymmetry };
}

/**
 * Maps analysed path metrics to CSS/canvas font properties.
 */
export function metricsToType(metrics) {
  if (!metrics) return { weight: 400, stretch: 100, slant: 0, size: 1, spacing: 0 };

  // Weight: curvature → bold (curves = body, straight = thin)
  const weight = Math.round(100 + metrics.curvature * 700);

  // Horizontal stretch: widthRatio → condensed/extended
  const stretch = Math.round(60 + metrics.widthRatio * 80); // 60%–140%

  // Slant: drape + asymmetry → italic angle
  const slant = (metrics.drape - 0.5) * 16 + (metrics.asymmetry - 0.5) * 8;

  // Size variation: tension → taller/shorter
  const size = 0.8 + metrics.tension * 0.5;

  // Letter spacing: low curvature = wide spacing (like a geometric sans)
  const spacing = (1 - metrics.curvature) * 0.12 - 0.02;

  return { weight, stretch, slant, size, spacing };
}
