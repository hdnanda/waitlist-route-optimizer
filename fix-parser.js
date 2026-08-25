const fs = require('fs');
let file = fs.readFileSync('src/lib/parser.ts', 'utf8');

const oldStep25 = `// -- Step 2.5: User-Suggested Gazetteer Fallback (Dictionary Scan) --
  // If the Codex regex grabbed conversational filler (like "papa ko bihar"),
  // it won't cleanly match our master list of cities. We detect this and override it
  // by scanning the entire text for known Indian locations.

  const isCleanLocation = (loc: string | null) => {
    if (!loc) return false;
    const l = loc.toLowerCase().trim();
    return INDIAN_LOCATIONS.includes(l) || Object.values(CITY_ALIASES).some(c => c.toLowerCase() === l) || Object.keys(CITY_ALIASES).includes(l);
  };

  if (!isCleanLocation(origin) || !isCleanLocation(destination)) {
    // Regex failed or grabbed garbage. Scan the cleaned text for actual locations!
    const locationRegex = new RegExp(\`\\\\b(\${INDIAN_LOCATIONS.join('|')})\\\\b\`, 'gi');
    const matches = Array.from(cleaned.matchAll(locationRegex)).map(m => m[1].toLowerCase());
    
    // Deduplicate while preserving order found in sentence
    const uniqueLocations = [...new Set(matches)];
    
    if (uniqueLocations.length >= 2) {
      // First found location is usually origin, second is dest
      origin = matchCity(uniqueLocations[0]) || uniqueLocations[0];
      destination = matchCity(uniqueLocations[1]) || uniqueLocations[1];
    } else if (uniqueLocations.length === 1) {
      // We found one valid location, keep whatever clean location the regex might have found
      if (!isCleanLocation(origin)) origin = matchCity(uniqueLocations[0]) || uniqueLocations[0];
      else if (!isCleanLocation(destination)) destination = matchCity(uniqueLocations[0]) || uniqueLocations[0];
    }
  }
  
  // Format the outputs nicely (Capitalize if not in alias map)
  if (origin && !CITY_ALIASES[origin.toLowerCase()]) origin = origin.charAt(0).toUpperCase() + origin.slice(1);
  if (destination && !CITY_ALIASES[destination.toLowerCase()]) destination = destination.charAt(0).toUpperCase() + destination.slice(1);`;

const newStep25 = `// -- Step 2.5: Dictionary Scan (Using Unified CITIES list) --
  const isCleanLocation = (loc: string | null) => {
    if (!loc) return false;
    const l = loc.toLowerCase().trim();
    return CITIES.some(c => c.name.toLowerCase() === l || c.aliases.some(a => a.toLowerCase() === l));
  };

  if (!isCleanLocation(origin) || !isCleanLocation(destination)) {
    const allNames = CITIES.flatMap(c => [c.name, ...c.aliases]).map(n => n.toLowerCase());
    const locationRegex = new RegExp(\`\\\\b(\${allNames.join('|')})\\\\b\`, 'gi');
    const matches = Array.from(cleaned.matchAll(locationRegex)).map(m => m[1].toLowerCase());
    const uniqueLocations = [...new Set(matches)];
    
    if (uniqueLocations.length >= 2) {
      origin = matchCity(uniqueLocations[0]) || uniqueLocations[0];
      destination = matchCity(uniqueLocations[1]) || uniqueLocations[1];
    } else if (uniqueLocations.length === 1) {
      if (!isCleanLocation(origin)) origin = matchCity(uniqueLocations[0]) || uniqueLocations[0];
      else if (!isCleanLocation(destination)) destination = matchCity(uniqueLocations[0]) || uniqueLocations[0];
    }
  }

  if (origin && !isCleanLocation(origin)) origin = origin.charAt(0).toUpperCase() + origin.slice(1);
  if (destination && !isCleanLocation(destination)) destination = destination.charAt(0).toUpperCase() + destination.slice(1);`;

file = file.replace(oldStep25, newStep25);
fs.writeFileSync('src/lib/parser.ts', file);
