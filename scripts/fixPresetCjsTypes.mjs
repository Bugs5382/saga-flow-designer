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

// Rewrites the CommonJS type declarations of the Tailwind preset to match its
// runtime shape. tsup emits `module.exports = preset` for the CJS bundle (the
// preset is the only export), so `require(".../tailwind-preset")` returns the
// preset itself, as a Tailwind config expects. The generated `.d.cts` still
// says `export { preset as default }`, which tells TypeScript (node16/nodenext)
// that CJS callers need `.default`, and that fails at runtime. attw flags it
// as "Incorrect default export". `export = preset` is the accurate typing.
//
// Runs after tsup as part of `npm run build`. It fails the build when the
// declaration is missing or tsup's output changes shape, so a silent no-op
// can't ship.
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "dist/tailwind.preset.d.cts";
const FROM = "export { preset as default };";
const TO = "export = preset;";

console.log(`fix-preset-types: reading ${FILE}`);
const source = readFileSync(FILE, "utf8");

if (source.includes(TO)) {
  console.log(`fix-preset-types: ${FILE} already uses \`${TO}\`, nothing to do`);
} else if (source.includes(FROM)) {
  writeFileSync(FILE, source.replace(FROM, TO));
  console.log(`fix-preset-types: rewrote \`${FROM}\` to \`${TO}\` in ${FILE}`);
} else {
  console.error(
    `fix-preset-types: ${FILE} has neither \`${FROM}\` nor \`${TO}\`; ` +
      "the tsup declaration output changed, so check the CJS preset types by hand",
  );
  process.exitCode = 1;
}
