// Real photos for destinations we have on file. Keys are matched as a
// SUBSTRING of the package's destination string (not an exact match) — so
// a key of "bali" correctly matches a destination of "Bali, Indonesia",
// and adding a new destination later (e.g. "Istanbul, Turkey") just needs
// a "turkey" key here, regardless of exactly how it's phrased in seed.js
const destinationImages = {
  thailand:
    "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  bali:
    "https://plus.unsplash.com/premium_photo-1677829177642-30def98b0963?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  morocco:
    "https://plus.unsplash.com/premium_photo-1673415819362-c2ca640bfafe?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  italy:
    "https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?q=80&w=1167&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  switzerland:
    "https://plus.unsplash.com/premium_photo-1689084892324-fd8822cb97c1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  france:
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1120&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
};

// Looks up a real photo by checking whether any known key appears anywhere
// inside the destination string. Falls back to a consistent Picsum photo
// (keyed by the full destination name) if nothing matches, so an unknown
// destination still shows something, not a broken image
export function getDestinationImage(destination) {
  const normalized = destination.toLowerCase();

  const matchedKey = Object.keys(destinationImages).find((key) =>
    normalized.includes(key),
  );

  if (matchedKey) {
    return destinationImages[matchedKey];
  }

  const seed = `safetravel-${normalized.replace(/[^a-z0-9]+/g, "-")}`;
  return `https://picsum.photos/seed/${seed}/800/600`;
}