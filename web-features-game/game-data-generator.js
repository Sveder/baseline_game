const data = require('web-features');

// Generate game data from web-features
const gameFeatures = [];

Object.entries(data.features).forEach(([key, feature]) => {
  // Skip features without proper names or descriptions
  if (!feature.name || !feature.description || feature.description.length < 10) {
    return;
  }

  let status = 'unknown';
  let statusLabel = 'Unknown/Limited Support';

  if (feature.status?.baseline === 'high') {
    status = 'high';
    statusLabel = 'Baseline 2024+ (High)';
  } else if (feature.status?.baseline === 'low') {
    status = 'low';
    statusLabel = 'Baseline 2024 (Low)';
  }

  gameFeatures.push({
    id: key,
    name: feature.name,
    description: feature.description,
    status: status,
    statusLabel: statusLabel,
    group: feature.group?.[0] || 'other',
    // Add some support info for context
    supportInfo: feature.status?.support ? Object.entries(feature.status.support)
      .map(([browser, version]) => `${browser}: ${version}`)
      .join(', ') : null
  });
});

// Shuffle and take a good mix of features
const shuffled = gameFeatures.sort(() => Math.random() - 0.5);
const finalFeatures = [];

// Get a balanced mix
const highFeatures = shuffled.filter(f => f.status === 'high').slice(0, 100);
const lowFeatures = shuffled.filter(f => f.status === 'low').slice(0, 50);
const unknownFeatures = shuffled.filter(f => f.status === 'unknown').slice(0, 50);

finalFeatures.push(...highFeatures, ...lowFeatures, ...unknownFeatures);

console.log(`Generated ${finalFeatures.length} game features`);
console.log(`Distribution: High=${highFeatures.length}, Low=${lowFeatures.length}, Unknown=${unknownFeatures.length}`);

// Write to JSON file
const fs = require('fs');
fs.writeFileSync('game-features.json', JSON.stringify(finalFeatures, null, 2));

console.log('Game features saved to game-features.json');