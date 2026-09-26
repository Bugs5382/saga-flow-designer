/*
 * Copyright 2026 Shane
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Fails when the npm tarball would ship files it should not, or grows past a
// size ceiling (#31). It runs `npm pack --dry-run`, so it checks exactly what
// `files` and the build produce. Run it after `npm run build`.
import { execFileSync } from "node:child_process";

// The build without maps unpacks to about 780 kB, nearly all of it the two
// library bundles. The ceiling leaves room for real growth and still catches
// maps (1.59 MB on their own) or a stray folder coming back.
const MAX_UNPACKED_BYTES = 1_200_000;

const REQUIRED = ["dist/index.js", "dist/index.cjs", "dist/index.d.ts", "dist/theme.css"];

const FORBIDDEN = [
  { pattern: /\.map$/u, reason: "source map" },
  {
    pattern: /^(?:src|tests|stories|examples|website|docs|scripts|coverage)\//u,
    reason: "non-runtime folder",
  },
];

const out = execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
});
const [pack] = JSON.parse(out);

console.log(
  `${pack.name}@${pack.version}: ${pack.entryCount} files, ` +
    `${pack.unpackedSize} bytes unpacked, ${pack.size} bytes packed`,
);
for (const file of pack.files) {
  console.log(`  ${file.size}\t${file.path}`);
}

const problems = [];
const paths = new Set(pack.files.map((file) => file.path));
for (const required of REQUIRED) {
  if (!paths.has(required)) {
    problems.push(`${required} missing (run \`npm run build\` first)`);
  }
}
for (const file of pack.files) {
  for (const { pattern, reason } of FORBIDDEN) {
    if (pattern.test(file.path)) {
      problems.push(`${file.path} (${reason})`);
    }
  }
}
if (pack.unpackedSize > MAX_UNPACKED_BYTES) {
  problems.push(
    `unpacked size ${pack.unpackedSize} bytes is over the ${MAX_UNPACKED_BYTES} byte ceiling`,
  );
}

if (problems.length > 0) {
  console.error("Package check failed:");
  for (const problem of problems) {
    console.error(`  ${problem}`);
  }
  process.exitCode = 1;
} else {
  console.log("Package contents OK.");
}
