import { writeFile } from "node:fs/promises";
import proj4 from "proj4";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const OUTPUT_FILE = new URL("../src/data/vietnam-archipelagos.geo.json", import.meta.url);
const USER_AGENT = "hoclieu-map-data-generator/1.0";

const highchartsTransform = {
  crs: "+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs",
  jsonmarginX: -999,
  jsonmarginY: 9851,
  jsonres: 15.5,
  scale: 0.000427553248096,
  xoffset: 203331.8992,
  yoffset: 2584050.23556,
};

const archipelagos = [
  {
    bounds: [15.45, 110.8, 17.45, 113.1],
    key: "vn-hoang-sa",
    name: "Đặc khu Hoàng Sa",
  },
  {
    bounds: [7.75, 111.5, 11.5, 114.8],
    key: "vn-truong-sa",
    name: "Đặc khu Trường Sa",
  },
];

proj4.defs("EPSG:32648", highchartsTransform.crs);

function buildOverpassQuery(bounds) {
  const area = `(${bounds.join(",")})`;

  return `[out:json][timeout:60];(
    way["natural"="coastline"]${area};
    way["natural"="reef"]${area};
    way["place"~"island|islet"]${area};
  );out tags geom;`;
}

async function loadArchipelagoWays(bounds) {
  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: `data=${encodeURIComponent(buildOverpassQuery(bounds))}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass request failed (${response.status}).`);
  }

  const payload = await response.json();
  const uniqueWays = new Map();

  for (const element of payload.elements || []) {
    if (element.type === "way" && element.geometry?.length >= 4) {
      uniqueWays.set(element.id, element);
    }
  }

  return [...uniqueWays.values()];
}

function toHighchartsPoint({ lon, lat }) {
  const [projectedX, projectedY] = proj4("EPSG:4326", "EPSG:32648", [lon, lat]);
  const {
    jsonmarginX,
    jsonmarginY,
    jsonres,
    scale,
    xoffset,
    yoffset,
  } = highchartsTransform;

  return [
    (projectedX - xoffset) * scale * jsonres + jsonmarginX,
    -((yoffset - projectedY) * scale * jsonres - jsonmarginY),
  ];
}

function squaredDistance(pointA, pointB) {
  const deltaX = pointA[0] - pointB[0];
  const deltaY = pointA[1] - pointB[1];
  return deltaX * deltaX + deltaY * deltaY;
}

function squaredSegmentDistance(point, start, end) {
  let x = start[0];
  let y = start[1];
  let deltaX = end[0] - x;
  let deltaY = end[1] - y;

  if (deltaX !== 0 || deltaY !== 0) {
    const ratio = ((point[0] - x) * deltaX + (point[1] - y) * deltaY) /
      (deltaX * deltaX + deltaY * deltaY);

    if (ratio > 1) {
      x = end[0];
      y = end[1];
    } else if (ratio > 0) {
      x += deltaX * ratio;
      y += deltaY * ratio;
    }
  }

  deltaX = point[0] - x;
  deltaY = point[1] - y;
  return deltaX * deltaX + deltaY * deltaY;
}

function simplifySection(points, firstIndex, lastIndex, toleranceSquared, output) {
  let maxDistance = toleranceSquared;
  let splitIndex = 0;

  for (let index = firstIndex + 1; index < lastIndex; index += 1) {
    const distance = squaredSegmentDistance(points[index], points[firstIndex], points[lastIndex]);

    if (distance > maxDistance) {
      splitIndex = index;
      maxDistance = distance;
    }
  }

  if (maxDistance > toleranceSquared) {
    if (splitIndex - firstIndex > 1) {
      simplifySection(points, firstIndex, splitIndex, toleranceSquared, output);
    }

    output.push(points[splitIndex]);

    if (lastIndex - splitIndex > 1) {
      simplifySection(points, splitIndex, lastIndex, toleranceSquared, output);
    }
  }
}

function simplifyRing(points, tolerance = 1.5) {
  const openRing = points.slice(0, -1);

  if (openRing.length <= 4) {
    return points;
  }

  let lastIndex = openRing.length - 1;

  while (lastIndex > 0 && squaredDistance(openRing[0], openRing[lastIndex]) < 0.000001) {
    lastIndex -= 1;
  }

  const simplified = [openRing[0]];
  simplifySection(openRing, 0, lastIndex, tolerance * tolerance, simplified);
  simplified.push(openRing[lastIndex], openRing[0]);
  return simplified;
}

function ensureVisibleSize(points, minimumSize = 12) {
  const bounds = points.reduce(
    (current, point) => ({
      maxX: Math.max(current.maxX, point[0]),
      maxY: Math.max(current.maxY, point[1]),
      minX: Math.min(current.minX, point[0]),
      minY: Math.min(current.minY, point[1]),
    }),
    {
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
    },
  );
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const largestSize = Math.max(width, height);

  if (largestSize >= minimumSize || largestSize === 0) {
    return points;
  }

  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const scale = minimumSize / largestSize;

  return points.map(([x, y]) => [
    centerX + (x - centerX) * scale,
    centerY + (y - centerY) * scale,
  ]);
}

function closeRing(points) {
  const firstPoint = points[0];
  const lastPoint = points.at(-1);

  if (squaredDistance(firstPoint, lastPoint) < 0.000001) {
    return points;
  }

  return [...points, firstPoint];
}

function isClosedGeometry(geometry) {
  const firstPoint = geometry[0];
  const lastPoint = geometry.at(-1);

  return Math.abs(firstPoint.lon - lastPoint.lon) < 0.0000001 &&
    Math.abs(firstPoint.lat - lastPoint.lat) < 0.0000001;
}

function wayToPolygon(way) {
  if (!isClosedGeometry(way.geometry)) {
    return null;
  }

  const projectedRing = closeRing(way.geometry.map(toHighchartsPoint));
  const visibleRing = ensureVisibleSize(projectedRing);
  const simplifiedRing = simplifyRing(visibleRing);

  return simplifiedRing.length >= 4 ? [simplifiedRing] : null;
}

const features = [];

for (const archipelago of archipelagos) {
  const ways = await loadArchipelagoWays(archipelago.bounds);
  const polygons = ways.map(wayToPolygon).filter(Boolean);

  features.push({
    type: "Feature",
    geometry: {
      type: "MultiPolygon",
      coordinates: polygons,
    },
    properties: {
      "hc-key": archipelago.key,
      name: archipelago.name,
      sourceFeatureCount: polygons.length,
    },
  });

  console.log(`${archipelago.name}: ${polygons.length} polygon SVG.`);
}

const output = {
  type: "FeatureCollection",
  copyright: "Data © OpenStreetMap contributors, ODbL 1.0",
  copyrightUrl: "https://www.openstreetmap.org/copyright",
  generatedAt: new Date().toISOString(),
  features,
};

await writeFile(OUTPUT_FILE, `${JSON.stringify(output)}\n`, "utf8");
console.log(`Wrote ${OUTPUT_FILE.pathname}.`);
