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

// Install smoke test: pack the package, install the tarball into a throwaway
// project outside the repo, and import every entry point the way a consumer
// would, as ESM and as CJS. Run it after `npm run build`:
//
//   npm run build && npm run check:install
//
// Adapted from the hub's check:install. For each subpath in package.json
// `exports` it:
//   - imports it with `import()` when the subpath has an ESM target, and
//     requires it with `require()` when it has a CJS target;
//   - fails when a module loads with no exports, or when the ESM and CJS
//     builds export different names;
//   - only resolves non-JavaScript subpaths such as `./theme.css`, which a
//     bundler handles and Node cannot load.
//
// Unlike the hub version, this one does NOT stub stylesheet imports. The
// library must load in plain Node (SSR, tests, scripts), so a bundle that
// imports a .css file, as it once did with `@xyflow/react/dist/style.css`,
// fails here. Hosts import the stylesheets themselves (see the README).
//
// Nothing is left behind: the temp folder is removed at the end unless
// KEEP_INSTALL_DIR=true.
import { execFileSync } from "node:child_process";
import console from "node:console";
import {
  appendFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const STYLE = /\.(css|scss|sass|less)$/;
const JAVASCRIPT = /\.(js|mjs|cjs)$/;

const manifest = JSON.parse(readFileSync("package.json", "utf8"));
const name = manifest.name;

// Walk one export target and collect the files each condition points at.
const targetsOf = (value, conditions = []) => {
  if (typeof value === "string") {
    return [{ conditions, file: value }];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => targetsOf(item, conditions));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => targetsOf(item, [...conditions, key]));
  }
  return [];
};

// A `.js` file is ESM or CJS by the package `type`.
const isCjsFile = (file) =>
  file.endsWith(".cjs") || (file.endsWith(".js") && manifest.type !== "module");
const isEsmFile = (file) =>
  file.endsWith(".mjs") || (file.endsWith(".js") && manifest.type === "module");

// Every consumer-facing subpath, with whether it has an ESM and a CJS target.
const subpaths = () => {
  const exportsMap = manifest.exports;
  let entries;
  if (exportsMap === undefined) {
    entries = [[".", { import: manifest.module ?? manifest.main, require: manifest.main }]];
  } else if (
    typeof exportsMap === "string" ||
    Array.isArray(exportsMap) ||
    !Object.keys(exportsMap).some((key) => key.startsWith("."))
  ) {
    entries = [[".", exportsMap]];
  } else {
    entries = Object.entries(exportsMap).filter(([key]) => !key.includes("*"));
  }
  return entries.map(([subpath, value]) => {
    const targets = targetsOf(value).filter(
      ({ conditions, file }) => file && !conditions.includes("types"),
    );
    const files = targets.map(({ file }) => file);
    const style = files.length > 0 && files.every((file) => STYLE.test(file));
    const esm = targets.some(
      ({ conditions, file }) =>
        JAVASCRIPT.test(file) &&
        (conditions.includes("import") || (!conditions.includes("require") && isEsmFile(file))),
    );
    const cjs = targets.some(
      ({ conditions, file }) =>
        JAVASCRIPT.test(file) &&
        (conditions.includes("require") || (!conditions.includes("import") && isCjsFile(file))),
    );
    const specifier = subpath === "." ? name : `${name}/${subpath.slice(2)}`;
    return { cjs, esm, files, specifier, style, subpath };
  });
};

const run = (command, commandArguments, cwd) => {
  const started = Date.now();
  console.log(`check:install: ${command} ${commandArguments.join(" ")} (in ${cwd})`);
  const out = execFileSync(command, commandArguments, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  console.log(
    `check:install: ${command} ${commandArguments[0]} done in ${Date.now() - started} ms`,
  );
  return out;
};

const consumerScript = (entries) => `import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const entries = ${JSON.stringify(entries)};
const report = [];
let failed = false;
const fail = (message) => {
  failed = true;
  console.error("check:install: FAIL " + message);
};
const names = (moduleValue, kind) => {
  if (moduleValue === null || typeof moduleValue !== "object" && typeof moduleValue !== "function") {
    return [];
  }
  const skip = kind === "esm" ? ["default", "module.exports"] : ["__esModule", "default"];
  return Object.keys(moduleValue).filter((key) => !skip.includes(key)).sort();
};
for (const entry of entries) {
  if (entry.style) {
    try {
      const resolved = import.meta.resolve(entry.specifier);
      console.log("check:install: resolved " + entry.specifier + " -> " + resolved);
      report.push({ specifier: entry.specifier, kind: "resolve", result: "ok" });
    } catch (error) {
      fail("resolve " + entry.specifier + ": " + error.message);
      report.push({ specifier: entry.specifier, kind: "resolve", result: error.message });
    }
    continue;
  }
  let esmNames = null;
  let esmDefaultType = null;
  let cjsNames = null;
  let cjsType = null;
  if (entry.esm) {
    try {
      const loaded = await import(entry.specifier);
      esmNames = names(loaded, "esm");
      esmDefaultType = typeof loaded.default;
      const hasDefault = loaded.default !== undefined;
      console.log("check:install: import " + entry.specifier + ": " + esmNames.length + " named exports" + (hasDefault ? " plus default" : ""));
      if (esmNames.length === 0 && !hasDefault) {
        fail("import " + entry.specifier + " loaded with no exports");
      }
      report.push({ specifier: entry.specifier, kind: "ESM import", result: esmNames.join(", ") || "(default only)" });
    } catch (error) {
      fail("import " + entry.specifier + ": " + (error.stack || error.message));
      report.push({ specifier: entry.specifier, kind: "ESM import", result: error.message });
    }
  }
  if (entry.cjs) {
    try {
      const loaded = require(entry.specifier);
      cjsNames = names(loaded, "cjs");
      cjsType = typeof loaded;
      console.log("check:install: require " + entry.specifier + ": " + cjsNames.length + " exports");
      if (loaded === undefined || loaded === null || (typeof loaded === "object" && Object.keys(loaded).length === 0)) {
        fail("require " + entry.specifier + " loaded with no exports");
      }
      report.push({ specifier: entry.specifier, kind: "CJS require", result: cjsNames.join(", ") || "(single export)" });
    } catch (error) {
      fail("require " + entry.specifier + ": " + (error.stack || error.message));
      report.push({ specifier: entry.specifier, kind: "CJS require", result: error.message });
    }
  }
  // Named exports must match. A default-only ESM build (a Fastify plugin, say)
  // pairs with module.exports = value in CJS, so there the types must match.
  if (esmNames && cjsNames && esmNames.length > 0 && cjsType === "object" && esmNames.join() !== cjsNames.join()) {
    fail(entry.specifier + ": ESM exports [" + esmNames.join(", ") + "] differ from CJS exports [" + cjsNames.join(", ") + "]");
  } else if (esmNames && cjsType && esmNames.length === 0 && esmDefaultType !== cjsType) {
    fail(entry.specifier + ": ESM default export has type " + esmDefaultType + " but the CJS export has type " + cjsType);
  }
}
console.log("REPORT " + JSON.stringify(report));
process.exitCode = failed ? 1 : 0;
`;

const entries = subpaths();
console.log(`check:install: ${name}: ${entries.length} entry points`);
for (const entry of entries) {
  console.log(
    `check:install:   ${entry.specifier}: ` +
      (entry.style
        ? "stylesheet (resolve only)"
        : `${entry.esm ? "ESM" : ""}${entry.esm && entry.cjs ? " + " : ""}${entry.cjs ? "CJS" : ""}`),
  );
}
if (entries.length === 0) {
  throw new Error("check:install: package.json has no exports, main or module to import");
}

const work = mkdtempSync(path.join(tmpdir(), "check-install-"));
const consumer = path.join(work, "consumer");
console.log(`check:install: throwaway folder ${work}`);
let status;
let report;
try {
  const [pack] = JSON.parse(
    run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", work], process.cwd()),
  );
  const tarball = path.resolve(work, pack.filename);
  console.log(`check:install: packed ${pack.filename} (${pack.size} bytes)`);

  mkdirSync(consumer, { recursive: true });
  writeFileSync(
    path.join(consumer, "package.json"),
    `${JSON.stringify({ name: "check-install-consumer", private: true, version: "0.0.0" }, undefined, 2)}\n`,
  );
  // A consumer installs the required peers (react, react-dom and
  // @xyflow/react) next to the package, so name them explicitly rather than
  // relying on npm's peer auto-install.
  const optional = manifest.peerDependenciesMeta ?? {};
  const peers = Object.entries(manifest.peerDependencies ?? {})
    .filter(([peer]) => !optional[peer]?.optional)
    .map(([peer, range]) => `${peer}@${range}`);
  console.log(`check:install: required peers: ${peers.join(", ") || "none"}`);
  run(
    "npm",
    [
      "install",
      tarball,
      ...peers,
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--no-package-lock",
    ],
    consumer,
  );

  writeFileSync(path.join(consumer, "smoke.mjs"), consumerScript(entries));
  console.log("check:install: running the consumer script");
  try {
    const out = execFileSync(process.execPath, ["smoke.mjs"], {
      cwd: consumer,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
    });
    process.stdout.write(out.replace(/^REPORT .*$/m, ""));
    report = JSON.parse(out.match(/^REPORT (.*)$/m)?.[1] ?? "[]");
    status = 0;
  } catch (error) {
    const out = `${error.stdout ?? ""}`;
    process.stdout.write(out.replace(/^REPORT .*$/m, ""));
    report = JSON.parse(out.match(/^REPORT (.*)$/m)?.[1] ?? "[]");
    status = 1;
  }
} finally {
  if (process.env.KEEP_INSTALL_DIR === "true") {
    console.log(`check:install: kept ${work}`);
  } else {
    rmSync(work, { force: true, recursive: true });
    console.log(`check:install: removed ${work}`);
  }
}

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    [
      `### Install smoke test: ${name} on Node ${process.version}`,
      "",
      status === 0
        ? "Every entry point loaded."
        : "**At least one entry point failed; see the job log.**",
      "",
      "| Specifier | Check | Result |",
      "| --- | --- | --- |",
      ...report.map((row) => `| \`${row.specifier}\` | ${row.kind} | ${row.result} |`),
      "",
    ].join("\n"),
  );
}

if (status === 0) {
  console.log("check:install: every entry point loaded as ESM and CJS");
} else {
  console.error("check:install: failed");
  process.exitCode = 1;
}
