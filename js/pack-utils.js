/* ============================================
   MCTools - Pack Detection & Conversion Maps
   ============================================ */

const JAVA_TO_BEDROCK = {
  'assets/minecraft/textures/block/': 'textures/blocks/',
  'assets/minecraft/textures/blocks/': 'textures/blocks/',
  'assets/minecraft/textures/item/': 'textures/items/',
  'assets/minecraft/textures/items/': 'textures/items/',
  'assets/minecraft/textures/entity/': 'textures/entity/',
  'assets/minecraft/textures/gui/': 'textures/ui/',
  'assets/minecraft/textures/painting/': 'textures/painting/',
  'assets/minecraft/textures/environment/': 'textures/environment/',
  'assets/minecraft/textures/particle/': 'textures/particle/',
  'assets/minecraft/textures/models/armor/': 'textures/models/armor/',
  'assets/minecraft/textures/misc/': 'textures/misc/',
  'assets/minecraft/textures/font/': 'textures/font/',
  'assets/minecraft/textures/colormap/': 'textures/colormap/',
  'assets/minecraft/textures/effect/': 'textures/effect/',
  'assets/minecraft/textures/mob_effect/': 'textures/ui/',
  'assets/minecraft/textures/trim/': 'textures/trims/',
  'assets/minecraft/textures/entity/chest/': 'textures/entity/chest/',
  'assets/minecraft/textures/entity/signs/': 'textures/entity/sign/',
  'assets/minecraft/textures/entity/bed/': 'textures/entity/bed/',
  'assets/minecraft/textures/entity/shulker/': 'textures/entity/shulker/',
  'assets/minecraft/textures/entity/conduit/': 'textures/entity/conduit/',
  'assets/minecraft/textures/entity/end_crystal/': 'textures/entity/end_crystal/',
  'assets/minecraft/textures/entity/enderdragon/': 'textures/entity/enderdragon/',
  'assets/minecraft/textures/entity/ghast/': 'textures/entity/ghast/',
  'assets/minecraft/textures/entity/wither/': 'textures/entity/wither/',
  'assets/minecraft/textures/entity/zombie/': 'textures/entity/zombie/',
  'assets/minecraft/textures/entity/skeleton/': 'textures/entity/skeleton/',
  'assets/minecraft/textures/entity/creeper/': 'textures/entity/creeper/',
  'assets/minecraft/textures/entity/spider/': 'textures/entity/spider/',
  'assets/minecraft/textures/entity/slime/': 'textures/entity/slime/',
  'assets/minecraft/textures/entity/cow/': 'textures/entity/cow/',
  'assets/minecraft/textures/entity/pig/': 'textures/entity/pig/',
  'assets/minecraft/textures/entity/sheep/': 'textures/entity/sheep/',
  'assets/minecraft/textures/entity/chicken/': 'textures/entity/chicken/',
  'assets/minecraft/textures/entity/wolf/': 'textures/entity/wolf/',
  'assets/minecraft/textures/entity/ocelot/': 'textures/entity/cat/',
  'assets/minecraft/textures/entity/cat/': 'textures/entity/cat/',
  'assets/minecraft/textures/entity/villager/': 'textures/entity/villager/',
  'assets/minecraft/textures/entity/illager/': 'textures/entity/illager/',
  'assets/minecraft/textures/entity/iron_golem/': 'textures/entity/iron_golem/',
  'assets/minecraft/textures/entity/snow_golem/': 'textures/entity/snow_golem/',
  'assets/minecraft/textures/entity/boat/': 'textures/entity/boat/',
  'assets/minecraft/textures/entity/minecart/': 'textures/entity/minecart/',
  'assets/minecraft/textures/entity/fishing_hook/': 'textures/entity/fishing_hook/',
  'assets/minecraft/textures/entity/lead_knot/': 'textures/entity/lead_knot/',
  'assets/minecraft/textures/entity/beacon_beam/': 'textures/entity/beacon_beam/',
  'assets/minecraft/textures/entity/elytra/': 'textures/entity/elytra/',
  'assets/minecraft/textures/entity/banner/': 'textures/entity/banner/',
  'assets/minecraft/textures/entity/shield/': 'textures/entity/shield/',
  'assets/minecraft/textures/entity/decorated_pot/': 'textures/entity/decorated_pot/',
  'assets/minecraft/textures/entity/armorstand/': 'textures/entity/armor_stand/',
  'assets/minecraft/textures/entity/breeze/': 'textures/entity/breeze/',
  'assets/minecraft/optifine/': 'assets/minecraft/optifine/',
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

export function detectPackType(zipEntries) {
  const hasMcmeta = zipEntries.some(e => e.path === 'pack.mcmeta');
  const hasManifest = zipEntries.some(e => e.path === 'manifest.json');
  if (hasMcmeta) return 'java';
  if (hasManifest) return 'bedrock';
  // Heuristic: Java packs usually start with assets/
  const javaLike = zipEntries.some(e => e.path.startsWith('assets/'));
  const bedrockLike = zipEntries.some(e => e.path.startsWith('textures/'));
  if (javaLike) return 'java';
  if (bedrockLike) return 'bedrock';
  return 'unknown';
}
