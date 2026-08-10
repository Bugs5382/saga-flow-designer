/*
MIT License

Copyright (c) 2026 Shane

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/
import React, { useState } from "react";
import TOC from "@theme-original/TOC";
import type TOCType from "@theme/TOC";
import type { WrapperProps } from "@docusaurus/types";

type Props = WrapperProps<typeof TOCType>;

/**
 * Wraps the right-side table of contents with a collapse toggle so the
 * secondary nav can be hidden, mirroring the hideable left sidebar. The toggle
 * styles (`.tocCollapsibleToggle` / `.tocChevron`) live in the brand CSS the
 * consumer loads via `theme.customCss`.
 */
export default function TOCWrapper(props: Props): React.JSX.Element {
  const [open, setOpen] = useState(true);

  // No headings on this page: render the original (which is empty) untouched.
  if (!props.toc || props.toc.length === 0) {
    return <TOC {...props} />;
  }

  return (
    <div className="tocCollapsible">
      <button
        type="button"
        className="tocCollapsibleToggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={open ? "tocChevron tocChevronOpen" : "tocChevron"} aria-hidden="true" />
        On this page
      </button>
      {open && <TOC {...props} />}
    </div>
  );
}
