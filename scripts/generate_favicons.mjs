import fs from 'node:fs';
import path from 'node:path';

const srcLogo = path.resolve('public/images/navswar_logo.png');
const distDir = path.resolve('public');

if (!fs.existsSync(srcLogo)) {
  console.error('Source logo does not exist:', srcLogo);
  process.exit(1);
}

const logoBuffer = fs.readFileSync(srcLogo);

// 1. Write public/favicon.png
fs.writeFileSync(path.join(distDir, 'favicon.png'), logoBuffer);
console.log('Created public/favicon.png');

// 2. Write public/favicon.ico
fs.writeFileSync(path.join(distDir, 'favicon.ico'), logoBuffer);
console.log('Created public/favicon.ico');

// 3. Write public/favicon.svg embedding the PNG base64
const b64 = logoBuffer.toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <image width="256" height="256" href="data:image/png;base64,${b64}" />
</svg>
`;
fs.writeFileSync(path.join(distDir, 'favicon.svg'), svg);
console.log('Created public/favicon.svg');
