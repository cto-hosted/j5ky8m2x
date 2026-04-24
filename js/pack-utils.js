// ============================================
// MCTools — Pack detection & path mapping
// ============================================

export async function readZipEntries(file) {
  const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
  const zip = await JSZip.loadAsync(file);
  const entries = [];
  zip.forEach((relativePath, entry) => {
    entries.push({ path: relativePath, entry });
  });
  return { zip, entries };
}

export function detectPackType(entries) {
  const names = entries.map(e => e.path.toLowerCase());
  if (names.some(n => n === 'manifest.json')) return 'bedrock';
  if (names.some(n => n === 'pack.mcmeta')) return 'java';
  // heuristic
  if (names.some(n => n.startsWith('assets/minecraft/'))) return 'java';
  if (names.some(n => n.startsWith('textures/'))) return 'bedrock';
  return 'unknown';
}

const JAVA_TO_BEDROCK = {
  'assets/minecraft/textures/block/': 'textures/blocks/',
  'assets/minecraft/textures/item/': 'textures/items/',
  'assets/minecraft/textures/entity/': 'textures/entity/',
  'assets/minecraft/textures/gui/': 'textures/gui/',
  'assets/minecraft/textures/environment/': 'textures/environment/',
  'assets/minecraft/textures/particle/': 'textures/particle/',
  'assets/minecraft/textures/painting/': 'textures/painting/',
  'assets/minecraft/textures/models/armor/': 'textures/models/armor/',
  'assets/minecraft/textures/misc/': 'textures/misc/',
  'assets/minecraft/textures/colormap/': 'textures/colormap/',
  'assets/minecraft/textures/font/': 'textures/font/',
  'assets/minecraft/textures/mob_effect/': 'textures/mob_effect/',
  'assets/minecraft/textures/trims/': 'textures/trims/',
  'assets/minecraft/sounds/': 'sounds/',
  'assets/minecraft/lang/': 'texts/',
  'assets/minecraft/shaders/': 'shaders/',
  'assets/minecraft/optifine/': 'optifine/',
};

const BEDROCK_TO_JAVA = Object.fromEntries(
  Object.entries(JAVA_TO_BEDROCK).map(([k, v]) => [v, k])
);

export function javaToBedrockPath(javaPath) {
  for (const [prefix, replacement] of Object.entries(JAVA_TO_BEDROCK)) {
    if (javaPath.startsWith(prefix)) {
      return javaPath.replace(prefix, replacement);
    }
  }
  return javaPath;
}

export function bedrockToJavaPath(bedrockPath) {
  for (const [prefix, replacement] of Object.entries(BEDROCK_TO_JAVA)) {
    if (bedrockPath.startsWith(prefix)) {
      return bedrockPath.replace(prefix, replacement);
    }
  }
  return bedrockPath;
}
