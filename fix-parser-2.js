const fs = require('fs');
let file = fs.readFileSync('src/lib/parser.ts', 'utf8');

// Use regex to replace Step 2.5 entirely
const step25Regex = /\/\/ -- Step 2\.5: User-Suggested Gazetteer Fallback.*?let date: string \| null = null;/s;

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
  if (destination && !isCleanLocation(destination)) destination = destination.charAt(0).toUpperCase() + destination.slice(1);

  // -- Step 3: Date extraction --
  let date: string | null = null;`;

file = file.replace(step25Regex, newStep25);
fs.writeFileSync('src/lib/parser.ts', file);
