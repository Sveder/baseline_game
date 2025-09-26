const data = require('web-features');

console.log('Web Features Analysis:');
console.log('===================');
console.log(`Total features: ${Object.keys(data.features).length}`);

// Analyze status distribution
const statuses = {};
Object.values(data.features).forEach(f => {
  const status = f.status?.baseline || 'no-status';
  statuses[status] = (statuses[status] || 0) + 1;
});

console.log('\nStatus distribution:');
Object.entries(statuses).forEach(([status, count]) => {
  console.log(`  ${status}: ${count}`);
});

// Get examples of each status
console.log('\nExamples of each status:');

// High baseline
const highFeature = Object.values(data.features).find(f => f.status?.baseline === 'high');
if (highFeature) {
  console.log(`\nHIGH BASELINE (${highFeature.name}):`);
  console.log(`  Description: ${highFeature.description}`);
  console.log(`  Dates: low=${highFeature.status.baseline_low_date}, high=${highFeature.status.baseline_high_date}`);
  console.log(`  Support: ${JSON.stringify(highFeature.status.support)}`);
}

// Low baseline
const lowFeature = Object.values(data.features).find(f => f.status?.baseline === 'low');
if (lowFeature) {
  console.log(`\nLOW BASELINE (${lowFeature.name}):`);
  console.log(`  Description: ${lowFeature.description}`);
  console.log(`  Dates: low=${lowFeature.status.baseline_low_date}`);
  console.log(`  Support: ${JSON.stringify(lowFeature.status.support)}`);
}

// No status
const noStatusFeature = Object.values(data.features).find(f => !f.status?.baseline);
if (noStatusFeature) {
  console.log(`\nNO BASELINE STATUS (${noStatusFeature.name}):`);
  console.log(`  Description: ${noStatusFeature.description}`);
  if (noStatusFeature.status) {
    console.log(`  Support: ${JSON.stringify(noStatusFeature.status.support)}`);
  }
}

// Show groups available
console.log('\nAvailable groups:');
Object.entries(data.groups).forEach(([key, group]) => {
  console.log(`  ${key}: ${group.name}`);
});