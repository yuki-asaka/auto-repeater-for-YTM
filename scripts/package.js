import zip from 'bestzip';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const version = packageJson.version;
const zipFileName = `auto-repeater-for-ytm-v${version}.zip`;
const outputDir = 'releases';

if (!existsSync(outputDir)) {
  mkdirSync(outputDir);
}

zip({
  source: 'dist/*',
  destination: join(outputDir, zipFileName)
}).then(() => {
  console.log(`Successfully created ZIP: ${join(outputDir, zipFileName)}`);
}).catch((err) => {
  console.error('Error creating ZIP:', err);
  process.exit(1);
});
