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
import { createESLintConfig } from "@the-rabbit-hole/eslint-config";

export default [
  { ignores: ["dist/**", "coverage/**", "docs/**", "node_modules/**"] },
  ...createESLintConfig({
    rules: {
      // Component files are PascalCase; utilities/logic stay camel/kebab.
      "unicorn/filename-case": [
        "warn",
        {
          cases: { camelCase: true, kebabCase: true, pascalCase: true },
          ignore: [/^__\w+__$/u],
        },
      ],
      // `null` is a legitimate React idiom (a component renders `null` to draw
      // nothing; a nullable prop union). The estate's React packages allow it.
      "unicorn/no-null": "off",
      // The canonical Apache-2.0 license header carried by every source file
      // uses http://www.apache.org/licenses/LICENSE-2.0 verbatim (Apache's
      // official text). prefer-https must not rewrite that URL.
      "unicorn/prefer-https": "off",
      // The React layer uses Props/Ref/Ctx/Def and similar as intentional
      // domain vocabulary, matching the estate's React convention.
      "unicorn/prevent-abbreviations": "off",
    },
  }),
];
