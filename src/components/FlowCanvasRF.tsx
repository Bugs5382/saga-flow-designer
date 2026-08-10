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
// FlowCanvasRF — the Flow Designer canvas on React Flow (@xyflow/react).
//
// The canvas (pan / zoom / fit / minimap) is React Flow's; the NODES are our
// EXISTING elements rendered verbatim — StageBand, Lane, TriggerCard, EndCap —
// so the look is identical to the DOM canvas. The workflow is flattened into a
// TREE of stage / sub-stage nodes:
//
//   trigger -> pre-stage -> Stage 1 -> Stage 2 ...
//
// where a step that FANS OUT (decision/switch branches, or parallel/foreach/
// while/try_catch children) at ANY depth spawns a CHILD sub-stage node per lane
// (rendered via Lane) instead of nesting the lanes inline. Recurse: a lane whose
// own trailing step fans out spawns ITS lanes as grandchild nodes, etc. The next
// top-level work stage attaches under the CONTINUING lane(s) of a fan-out (a lane
// whose laneIsTerminal(...) is false); terminal lanes end on their own End cap.
//
// TARGET positions come from a tidy-tree layout (top-down: depth = rank/row,
// post-order leaf-packing = x) with siblings TOP-ALIGNED (shared top edge, never
// centred vertically). Those targets are not applied directly — a SPRING engine
// (STIFF 0.055 / DAMP 0.8) drives each node's live position toward its target
// per rAF frame, so the tree GLIDES with momentum when it reflows (insert/remove/
// resize). React Flow recomputes edge paths from the live node positions each
// frame, so connectors flex as nodes move. New nodes + first flow-load initialize
// AT their target (no fly-in; the load settle is hidden by the loading overlay),
// so the spring only animates real movement. prefers-reduced-motion snaps.
import "@xyflow/react/dist/style.css";
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  type Edge,
  type EdgeProps,
  Handle,
  MarkerType,
  MiniMap,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  type Branch,
  laneIsTerminal,
  type LaneRole,
  laneRoleFor,
  LOOP_VERBS,
  type Stage,
  type Step,
  type Trigger,
  type VerbName,
} from "../workflowData";
import {
  type CanvasCallbacks,
  collectEntryNames,
  EndCap,
  Lane,
  laneNumberPrefix,
  type RunOverlay,
  StageBand,
  TriggerCard,
} from "./FlowCanvas";
import { Loader2 } from "./primitives/icons";

interface StageNodeData extends Record<string, unknown> {
  cb: CanvasCallbacks;
  entryNames: Record<string, string>;
  hoistStepId?: string;
  runOverlay?: RunOverlay;
  selectedId: string | undefined;
  stage: Stage;
  stageNumber: number | undefined;
}
interface SubStageNodeData extends Record<string, unknown> {
  branch: Branch;
  cb: CanvasCallbacks;
  entryNames: Record<string, string>;
  // When set, the lane's OWN trailing fan-out step renders its card only — its
  // lanes are emitted as grandchild nodes below this one (recursive tree).
  hoistStepId?: string;
  loopBody: boolean;
  numberPrefix: string;
  ownerJoin?: string;
  ownerType: VerbName;
  role: LaneRole;
  runOverlay?: RunOverlay;
  selectedId: string | undefined;
  tone: "catch" | "false" | "neutral" | "true" | "try";
}
// --- node data shapes (React Flow requires an index signature) --------------
interface TriggerNodeData extends Record<string, unknown> {
  trigger: Trigger;
}

// --- custom node components (render the EXACT existing elements) ------------
const targetHandle = (
  <Handle className="!size-1.5 !border-0 !bg-slate-400" position={Position.Top} type="target" />
);
const sourceHandle = (
  <Handle className="!size-1.5 !border-0 !bg-slate-400" position={Position.Bottom} type="source" />
);

const TriggerNode = ({ data }: NodeProps<Node<TriggerNodeData>>) => (
  <div className="w-[300px]">
    <TriggerCard trigger={data.trigger} />
    {sourceHandle}
  </div>
);

// The pre-stage as its OWN selectable/configurable node — reuses the StageBand
// for the pre-stage kind, so it reads identically to the classic canvas'
// Pre-Stage band (not a bare TriggerCard). The Trigger keeps its own node above
// it (the classic canvas shows TriggerCard + the Pre-Stage band).
const PreStageNode = ({ data }: NodeProps<Node<StageNodeData>>) => (
  <div className="nopan w-[340px]" onContextMenu={(e) => e.stopPropagation()}>
    {targetHandle}
    <StageBand
      cb={data.cb}
      entryNames={data.entryNames}
      runOverlay={data.runOverlay}
      selectedId={data.selectedId}
      stage={data.stage}
      stageNumber={data.stageNumber}
    />
    {sourceHandle}
  </div>
);

const StageNode = ({ data }: NodeProps<Node<StageNodeData>>) => (
  <div className="nopan w-[340px]" onContextMenu={(e) => e.stopPropagation()}>
    {targetHandle}
    <StageBand
      cb={data.cb}
      entryNames={data.entryNames}
      hoistStepId={data.hoistStepId}
      runOverlay={data.runOverlay}
      selectedId={data.selectedId}
      stage={data.stage}
      stageNumber={data.stageNumber}
    />
    {sourceHandle}
  </div>
);

const SubStageNode = ({ data }: NodeProps<Node<SubStageNodeData>>) => (
  <div className="nopan" onContextMenu={(e) => e.stopPropagation()}>
    {targetHandle}
    <Lane
      branch={data.branch}
      cb={data.cb}
      entryNames={data.entryNames}
      hoistStepId={data.hoistStepId}
      numberPrefix={data.numberPrefix}
      ownerJoin={data.ownerJoin}
      ownerType={data.ownerType}
      role={data.role}
      runOverlay={data.runOverlay}
      selectedId={data.selectedId}
      showLoopEntry={data.loopBody}
      tone={data.tone}
    />
    {sourceHandle}
  </div>
);

const EndNode = () => (
  <div>
    {targetHandle}
    <EndCap />
  </div>
);

// Stable, module-level so React Flow doesn't re-register node types each render.
const nodeTypes = {
  end: EndNode,
  prestage: PreStageNode,
  stage: StageNode,
  substage: SubStageNode,
  trigger: TriggerNode,
};

// --- merge (rejoin) edge routing -------------------------------------------
// A convergence target (a stage/entry reached by more than one lane) is CENTERED
// under the centroid of its merging parents by the layout (see layoutTree), so
// the rejoins converge on it symmetrically. Each rejoin then only has to drop
// straight down its OWN column — which is clear, because a merging lane is a
// leaf in the tree (nothing below it) — to the node-free channel just above the
// target, then step straight in. No global gutter, no crossing: the vertical run
// stays in the source's empty column and the one horizontal leg sits in the
// inter-rank Y-gap above the target (clear across the whole width). Teal so a
// rejoin reads as a rejoin, not another sequential hop.
const MERGE_STROKE = "#0d9488"; // teal-600
const MERGE_STUB = 20; // channel height above the target (< Y_GAP)
const MERGE_STACK = 7; // per-edge channel stagger so buses don't overlap
const CORNER_R = 8;

// Orthogonal polyline through `pts` with rounded corners. Degenerate (zero-
// length) segments skip their rounding so a collapsed corner never emits NaN.
const roundedPath = (pts: Array<[number, number]>, r: number): string => {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let index = 1; index < pts.length - 1; index += 1) {
    const [x0, y0] = pts[index - 1];
    const [x1, y1] = pts[index];
    const [x2, y2] = pts[index + 1];
    const l1 = Math.hypot(x1 - x0, y1 - y0);
    const l2 = Math.hypot(x2 - x1, y2 - y1);
    if (l1 < 0.5 || l2 < 0.5) {
      d += ` L ${x1},${y1}`;
      continue;
    }
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const ax = x1 - ((x1 - x0) / l1) * rr;
    const ay = y1 - ((y1 - y0) / l1) * rr;
    const bx = x1 + ((x2 - x1) / l2) * rr;
    const by = y1 + ((y2 - y1) / l2) * rr;
    d += ` L ${ax},${ay} Q ${x1},${y1} ${bx},${by}`;
  }
  const last = pts.at(-1);
  if (last) d += ` L ${last[0]},${last[1]}`;
  return d;
};

const MergeEdge = ({
  data,
  id,
  markerEnd,
  sourceX,
  sourceY,
  style,
  targetX,
  targetY,
}: EdgeProps) => {
  const mergeIndex = (data?.mergeIndex as number | undefined) ?? 0;
  // The shared channel just above the target; stagger per rejoin so several
  // buses into one target don't sit on the same line.
  const busY = targetY - MERGE_STUB - mergeIndex * MERGE_STACK;
  // Straight down the source's (clear) column, across the channel, straight in.
  const path = roundedPath(
    [
      [sourceX, sourceY],
      [sourceX, busY],
      [targetX, busY],
      [targetX, targetY],
    ],
    CORNER_R,
  );
  return <BaseEdge id={id} markerEnd={markerEnd} path={path} style={style} />;
};

// Stable, module-level (mirrors nodeTypes) — one custom edge for rejoins.
const edgeTypes = { merge: MergeEdge };

// A rough tone for a sub-stage header chip (mirrors FlowCanvas.laneTone).
const toneFor = (
  ownerType: VerbName,
  role: LaneRole,
  caseLabel: string,
): SubStageNodeData["tone"] => {
  if (ownerType === "try_catch") return role === "try" ? "try" : "catch";
  const label = caseLabel.toUpperCase();
  if (label === "APPROVED" || label === "SUBMITTED") return "true";
  if (label === "REJECTED") return "false";
  const u = caseLabel.toUpperCase();
  if (u === "TRUE") return "true";
  if (u === "FALSE") return "false";
  return "neutral";
};

// The fan-out step of a steps array: its LAST step, when that step branches or
// has children. Only the TRAILING step is hoisted into sub-stage nodes — a
// mid-sequence fan-out still renders inline within its band/lane (mirrors the
// classic FlowCanvas, which hoists a stage's trailing fan-out).
const trailingFanout = (steps: Step[] | undefined): Step | undefined => {
  const last = steps?.at(-1);
  if (!last) return undefined;
  return (last.branches?.length ?? 0) > 0 || (last.children?.length ?? 0) > 0 ? last : undefined;
};

// A signature of the tree STRUCTURE only — stage/step/lane ids + kinds/types +
// branch/child nesting + terminal flags. NOT names/config/labels. `build` keys
// off this so data-only edits (rename, config) don't rebuild or reflow the tree
// (which flickered on every keystroke); a data-patch effect keeps the live data.
const structuralSignature = (stages: Stage[]): string => {
  const lane = (b: Branch): string =>
    `${b.id}:${b.terminal ?? ""}[${b.steps.map((s) => step(s)).join(",")}]`;
  const step = (s: Step): string =>
    `${s.id}(${s.type})<${(s.branches ?? []).map((b) => lane(b)).join("|")};${(s.children ?? []).map((b) => lane(b)).join("|")}>`;
  return stages
    .map((st) => `${st.id}:${st.kind}[${st.steps.map((s) => step(s)).join(",")}]`)
    .join(";");
};

// --- build the node/edge TREE ----------------------------------------------
const build = (
  stages: Stage[],
  trigger: Trigger,
  callback: CanvasCallbacks,
  selectedId: string | undefined,
  runOverlay: RunOverlay | undefined,
): { edges: Edge[]; multiContinue: boolean; nodes: Node[] } => {
  const entryNames = collectEntryNames(stages);
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let multiContinue = false;

  // 90-degree orthogonal ("step") edges, subtle slate stroke.
  const edge = (source: string, target: string): void => {
    edges.push({
      id: `e-${source}-${target}`,
      source,
      style: { stroke: "#94a3b8", strokeWidth: 1.5 },
      target,
      type: "step",
    });
  };

  // Only WORK stages are numbered 1..N (pre/end excluded), matching the classic
  // canvas. Number them up-front so the number is stable regardless of how the
  // tree threads them through continuing branches.
  const workStages = stages.filter((s) => s.kind === "stage");
  const numberByStageId = new Map<string, number>();
  for (const [index, s] of workStages.entries()) numberByStageId.set(s.id, index + 1);
  const endStage = stages.find((s) => s.kind === "end-stage");

  // Emit a lane (branch/child) as a sub-stage node, connected from `parentId`.
  // If the lane's OWN trailing step fans out, recurse: its lanes become
  // grandchild nodes and the lane renders that step's fan-out suppressed
  // (hoistStepId). Returns the CONTINUATION ids: node ids under which downstream
  // work should attach when this lane continues (empty when the lane truly
  // terminates per laneIsTerminal).
  const emitLane = (
    lane: Branch,
    ownerType: VerbName,
    ownerJoin: string | undefined,
    role: LaneRole,
    numberPrefix: string,
    parentId: string,
  ): string[] => {
    const fanout = trailingFanout(lane.steps);
    nodes.push({
      data: {
        branch: lane,
        cb: callback,
        entryNames,
        hoistStepId: fanout?.id,
        loopBody: LOOP_VERBS.has(ownerType),
        numberPrefix,
        ownerJoin,
        ownerType,
        role,
        runOverlay,
        selectedId,
        tone: toneFor(ownerType, role, lane.caseLabel),
      } satisfies SubStageNodeData,
      id: lane.id,
      position: { x: 0, y: 0 },
      type: "substage",
    });
    edge(parentId, lane.id);

    // A terminal lane ends here (its downstream is an End, handled by the caller
    // via the empty continuation set); a continuing lane propagates its
    // continuation point(s).
    const laneTerminal = laneIsTerminal(ownerType, role, lane);

    if (!fanout) return laneTerminal ? [] : [lane.id];

    // The lane's trailing step fans out into grandchild lanes.
    const subLanes = fanout.branches?.length ? fanout.branches : (fanout.children ?? []);
    const stepNumber = `${numberPrefix}.${lane.steps.length}`;
    const conts: string[] = [];
    for (const [index, sub] of subLanes.entries()) {
      const subRole = laneRoleFor(fanout.type, index);
      conts.push(
        ...emitLane(
          sub,
          fanout.type,
          fanout.config.join,
          subRole,
          laneNumberPrefix(stepNumber, index),
          lane.id,
        ),
      );
    }
    // The lane's own terminal flag gates continuation: a terminal lane ends even
    // if its inner fan-out had continuing sub-lanes.
    return laneTerminal ? [] : conts;
  };

  // Emit a work STAGE node, connected from `parentId`. If its trailing step fans
  // out, emit that step's lanes as child sub-stage nodes (recursively) and return
  // the continuation ids (the continuing lanes). Otherwise the stage itself is
  // the continuation.
  const emitStage = (stage: Stage, parentIds: string[]): string[] => {
    const fanout = trailingFanout(stage.steps);
    const stageNumber = numberByStageId.get(stage.id);
    // Push the stage node ONCE, then edge from every parent — so a stage that
    // several continuing lanes converge on is a single node with multiple
    // in-edges (never duplicated).
    nodes.push({
      data: {
        cb: callback,
        entryNames,
        hoistStepId: fanout?.id,
        runOverlay,
        selectedId,
        stage,
        stageNumber,
      } satisfies StageNodeData,
      id: stage.id,
      position: { x: 0, y: 0 },
      type: "stage",
    });
    for (const parentId of parentIds) edge(parentId, stage.id);

    if (!fanout) return [stage.id];

    const lanes = fanout.branches?.length ? fanout.branches : (fanout.children ?? []);
    const stepNumber = `${stageNumber}.${stage.steps.length}`;
    const conts: string[] = [];
    for (const [index, lane] of lanes.entries()) {
      const role = laneRoleFor(fanout.type, index);
      conts.push(
        ...emitLane(
          lane,
          fanout.type,
          fanout.config.join,
          role,
          laneNumberPrefix(stepNumber, index),
          stage.id,
        ),
      );
    }
    return conts;
  };

  // The trigger node (always present). The pre-stage attaches below it.
  nodes.push({
    data: { trigger },
    id: "trigger",
    position: { x: 0, y: 0 },
    type: "trigger",
  });

  const preStage = stages.find((s) => s.kind === "pre-stage");
  let conts: string[] = ["trigger"];
  if (preStage) {
    nodes.push({
      data: {
        cb: callback,
        entryNames,
        runOverlay,
        selectedId,
        stage: preStage,
        stageNumber: undefined,
      } satisfies StageNodeData,
      id: preStage.id,
      position: { x: 0, y: 0 },
      type: "prestage",
    });
    edge("trigger", preStage.id);
    conts = [preStage.id];
  }

  // Thread the flat work-stage list through the tree. `conts` is the set of
  // current continuation attachment points. Each work stage is attached under
  // all of them (usually one), and the union of the continuations it produces
  // becomes the next attachment set.
  //   * exactly one continues -> chain the next stage there.
  //   * none continue -> the flow ends; remaining stages are unreachable and are
  //     dropped from the tree (they cannot attach anywhere).
  //   * multiple continue -> attach the next stage under EACH (flagged, since the
  //     tree cannot express the re-convergence as a single node).
  for (const stage of workStages) {
    if (conts.length === 0) break; // nowhere to attach — unreachable tail.
    if (conts.length > 1) multiContinue = true;
    conts = emitStage(stage, conts);
  }

  // The End cap attaches under every remaining continuation.
  if (conts.length > 0) {
    if (conts.length > 1) multiContinue = true;
    const endId = endStage ? endStage.id : "__end";
    // Render the end stage as an End cap node (its trailing nodes live inside the
    // classic End Stage band; here we keep the simple terminal cap).
    nodes.push({ data: {}, id: endId, position: { x: 0, y: 0 }, type: "end" });
    for (const parentId of conts) edge(parentId, endId);
  }

  // Classify convergence in-edges. A target reached by ONE parent keeps its plain
  // "step" spine. A target reached by MORE THAN ONE parent is a rejoin point:
  // the layout centres it under its parents' centroid, and EVERY in-edge becomes
  // a symmetric `merge` edge (each drops straight down its own clear column into
  // the channel above the centred target). mergeIndex staggers their channels.
  const inDegree = new Map<string, number>();
  for (const e of edges) inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  const mergeOrdinal = new Map<string, number>();
  for (const e of edges) {
    if ((inDegree.get(e.target) ?? 0) < 2) continue;
    const index = mergeOrdinal.get(e.target) ?? 0;
    mergeOrdinal.set(e.target, index + 1);
    e.type = "merge";
    e.data = { mergeIndex: index };
    e.style = {
      stroke: MERGE_STROKE,
      strokeDasharray: "5 4",
      strokeWidth: 1.75,
    };
    e.markerEnd = {
      color: MERGE_STROKE,
      height: 16,
      type: MarkerType.ArrowClosed,
      width: 16,
    };
    e.zIndex = 5;
  }

  return { edges, multiContinue, nodes };
};

// --- static tidy-tree layout (top-down; top-aligned siblings) ---------------
// A tidy-tree layout (post-order leaf packing so siblings never overlap),
// rotated TOP-DOWN and made variable-size:
//   * depth (tree distance from a root) sets the RANK/row.
//   * post-order leaf packing sets X (siblings never overlap).
//   * each rank's row-TOP is placed below the tallest node of the rank above,
//     and every node in a rank shares that top-y -> siblings TOP-ALIGN, never
//     centre-align vertically.
// Uses MEASURED node sizes when React Flow has measured them (after first
// render); falls back to an estimate so the first paint is close.
const EST_W = 340;
const EST_H = 200;
const X_GAP = 48;
const Y_GAP = 72;

// Spring engine tuning — the "2D space" feel. Per frame, for each axis:
//   a = (target - pos) * STIFF - vel * DAMP;  vel += a;  pos += vel;
// settles with momentum and no ringing. Below SETTLE (px / px-per-frame) on all
// nodes, the loop snaps to target and stops.
const STIFF = 0.055;
const DAMP = 0.8;
const SETTLE = 0.5;

const layoutTree = (nodes: Node[], edges: Edge[]): Node[] => {
  if (nodes.length === 0) return nodes;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const width = (id: string): number => byId.get(id)?.measured?.width ?? EST_W;
  const height = (id: string): number => byId.get(id)?.measured?.height ?? EST_H;

  // parent -> children (insertion order = author order) and the set of children.
  const children = new Map<string, string[]>();
  const hasParent = new Set<string>();
  for (const n of nodes) children.set(n.id, []);
  for (const e of edges) {
    if (children.has(e.source) && byId.has(e.target)) {
      children.get(e.source)!.push(e.target);
      hasParent.add(e.target);
    }
  }
  const roots = nodes.filter((n) => !hasParent.has(n.id)).map((n) => n.id);

  // A node reachable from more than one parent (a convergence, e.g. the End cap
  // under a multi-continue fan-out) is walked once (under its FIRST parent), so
  // the walk stays acyclic and terminates. Convergence nodes are attributed to
  // their FIRST parent, so the walk is acyclic and each node is placed once.
  const firstParent = new Map<string, string>();
  for (const e of edges) {
    if (byId.has(e.target) && byId.has(e.source) && !firstParent.has(e.target)) {
      firstParent.set(e.target, e.source);
    }
  }
  const ownedKids = (id: string): string[] =>
    (children.get(id) ?? []).filter((k) => firstParent.get(k) === id);

  // A subtree's horizontal SPAN reserves at least the node's OWN width (+gap),
  // so a wide parent never overlaps a sibling subtree — consistent spacing at
  // every depth when the tree branches out.
  const spanOf = new Map<string, number>();
  const computeSpan = (id: string): number => {
    const cached = spanOf.get(id);
    if (cached !== undefined) return cached;
    const kids = ownedKids(id);
    const own = width(id) + X_GAP;
    const kidsSpan = kids.reduce((a, k) => a + computeSpan(k), 0);
    const s = kids.length === 0 ? own : Math.max(own, kidsSpan);
    spanOf.set(id, s);
    return s;
  };

  const depth = new Map<string, number>();
  const xCenter = new Map<string, number>();
  // Place a subtree into its allocated horizontal band [left, left+span]: the
  // node centres in its own band; its children (their combined span) are centred
  // under it. Guarantees no overlap between sibling subtrees.
  const place = (id: string, left: number, d: number): void => {
    depth.set(id, d);
    const span = computeSpan(id);
    const kids = ownedKids(id);
    if (kids.length > 0) {
      const kidsSpan = kids.reduce((a, k) => a + computeSpan(k), 0);
      let cursor = left + (span - kidsSpan) / 2;
      for (const k of kids) {
        place(k, cursor, d + 1);
        cursor += computeSpan(k);
      }
    }
    xCenter.set(id, left + span / 2);
  };
  let rootLeft = 0;
  for (const r of roots) {
    place(r, rootLeft, 0);
    rootLeft += computeSpan(r);
  }

  // Park any node not reached from a root (shouldn't happen for a clean tree).
  for (const n of nodes) {
    if (!xCenter.has(n.id)) {
      depth.set(n.id, depth.get(n.id) ?? 0);
      xCenter.set(n.id, rootLeft + width(n.id) / 2);
      rootLeft += width(n.id) + X_GAP;
    }
  }

  // Centre convergence nodes. A node reached by MORE THAN one parent (an explicit
  // rejoin) was placed under its FIRST parent only, forcing the other rejoins to
  // detour across the tree. Re-centre each on the centroid of ALL its parents and
  // shift its owned subtree with it, so the rejoins converge symmetrically and
  // each drops straight down its own clear column. Shallow->deep so a parent's
  // centred x is final before a child reads it.
  const parentsOf = new Map<string, string[]>();
  for (const e of edges) {
    if (byId.has(e.source) && byId.has(e.target)) {
      const list = parentsOf.get(e.target);
      if (list) list.push(e.source);
      else parentsOf.set(e.target, [e.source]);
    }
  }
  const shiftSubtree = (id: string, dx: number): void => {
    xCenter.set(id, (xCenter.get(id) ?? 0) + dx);
    for (const k of ownedKids(id)) shiftSubtree(k, dx);
  };
  const byDepthAsc = nodes.toSorted((a, b) => (depth.get(a.id) ?? 0) - (depth.get(b.id) ?? 0));
  for (const n of byDepthAsc) {
    const ps = parentsOf.get(n.id);
    if (!ps || ps.length < 2) continue;
    const avg = ps.reduce((sum, p) => sum + (xCenter.get(p) ?? 0), 0) / ps.length;
    const dx = avg - (xCenter.get(n.id) ?? 0);
    if (Math.abs(dx) > 0.5) shiftSubtree(n.id, dx);
  }

  // Rank tops: rank 0 top = 0; each next rank top = prev top + prev rank's
  // tallest node + Y_GAP. Ranks never overlap, and same-depth siblings share a
  // top-y (top-alignment).
  const maxDepth = Math.max(0, ...depth.values());
  const rankHeight: number[] = Array.from({ length: maxDepth + 1 }, () => 0);
  for (const n of nodes) {
    const d = depth.get(n.id) ?? 0;
    rankHeight[d] = Math.max(rankHeight[d], height(n.id));
  }
  const rankTop: number[] = Array.from({ length: maxDepth + 1 }, () => 0);
  for (let d = 1; d <= maxDepth; d += 1) {
    rankTop[d] = rankTop[d - 1] + rankHeight[d - 1] + Y_GAP;
  }

  return nodes.map((n) => {
    const d = depth.get(n.id) ?? 0;
    const cx = xCenter.get(n.id) ?? 0;
    return { ...n, position: { x: cx - width(n.id) / 2, y: rankTop[d] } };
  });
};

/**
 * Props for {@link FlowCanvasRF}.
 *
 * @since 1.0.0
 */
export interface FlowCanvasRFProps extends CanvasCallbacks {
  // The workflow id — fit-to-view fires only when this changes (flow load/switch),
  // so edits (add node/stage) reflow in place without zooming out.
  flowId: string;
  runOverlay?: RunOverlay;
  selectedId: string | undefined;
  stages: Stage[];
  trigger: Trigger;
}

const Inner = ({
  flowId,
  runOverlay,
  selectedId,
  stages,
  trigger,
  ...callback
}: FlowCanvasRFProps) => {
  // Rebuild the TREE only when structure/run-overlay changes — NOT on selection
  // (selecting a node must not re-layout/re-fit the whole tree). Selection is
  // applied as a light data patch below.
  const structKey = useMemo(() => structuralSignature(stages), [stages]);
  // The caller deep-clones the workflow, so `trigger`/`stages` are NEW references
  // on every keystroke. Key `built` off VALUE signatures (not references), so a
  // data edit (rename/config) never rebuilds or reflows the tree (the flicker).
  const triggerKey = useMemo(() => JSON.stringify(trigger), [trigger]);
  const built = useMemo(
    () => build(stages, trigger, callback as CanvasCallbacks, selectedId, runOverlay),
    [structKey, triggerKey, runOverlay],
  );
  const initialNodes = useMemo(() => layoutTree(built.nodes, built.edges), [built]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(built.edges);
  const nodesInitialized = useNodesInitialized();
  const { fitView, setCenter } = useReactFlow();
  // Loading gate: hide the canvas behind a spinner until the first measured
  // layout + fit has settled (large flows take a beat to measure/lay out — no
  // mid-layout jank shown).
  const [ready, setReady] = useState(false);

  // --- SPRING PHYSICS -------------------------------------------------------
  // targetsRef: where each node WANTS to be (from layoutTree). physicsRef: each
  // node's live {x,y,vx,vy}. The rAF loop eases physics -> targets each frame and
  // writes the result into the RF node positions. Refs (not state) so the loop
  // never re-triggers React effects. `nodesRef` gives the loop + layout the
  // latest nodes without adding `nodes` to effect deps (which would re-run the
  // reflow every frame).
  const nodesReference = useRef<Node[]>(nodes);
  nodesReference.current = nodes;
  const targetsReference = useRef<Map<string, { x: number; y: number }>>(new Map());
  const physicsReference = useRef<Map<string, { vx: number; vy: number; x: number; y: number }>>(
    new Map(),
  );
  const rafReference = useRef<null | number>(null);
  const reduceMotion = useRef(false);

  useEffect(() => {
    const mql = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)");
    reduceMotion.current = mql?.matches ?? false;
    const onChange = (e: MediaQueryListEvent): void => {
      reduceMotion.current = e.matches;
    };
    mql?.addEventListener?.("change", onChange);
    return () => mql?.removeEventListener?.("change", onChange);
  }, []);

  // Kick the rAF spring loop (idempotent — no-op if already running).
  const startSpring = useCallback(() => {
    if (rafReference.current !== null) return;
    const step = (): void => {
      const targets = targetsReference.current;
      const phys = physicsReference.current;
      let moving = false;
      for (const [id, t] of targets) {
        let p = phys.get(id);
        if (!p) {
          p = { vx: 0, vy: 0, x: t.x, y: t.y };
          phys.set(id, p);
        }
        const ax = (t.x - p.x) * STIFF - p.vx * DAMP;
        const ay = (t.y - p.y) * STIFF - p.vy * DAMP;
        p.vx += ax;
        p.vy += ay;
        p.x += p.vx;
        p.y += p.vy;
        if (
          Math.abs(t.x - p.x) > SETTLE ||
          Math.abs(t.y - p.y) > SETTLE ||
          Math.abs(p.vx) > SETTLE ||
          Math.abs(p.vy) > SETTLE
        ) {
          moving = true;
        } else {
          p.x = t.x;
          p.y = t.y;
          p.vx = 0;
          p.vy = 0;
        }
      }
      setNodes((current) =>
        current.map((n) => {
          const p = phys.get(n.id);
          return p ? { ...n, position: { x: p.x, y: p.y } } : n;
        }),
      );
      rafReference.current = moving ? requestAnimationFrame(step) : null;
    };
    rafReference.current = requestAnimationFrame(step);
  }, [setNodes]);

  // Set fresh targets from a laid-out tree and spring toward them. New nodes
  // (never tracked) initialize AT their target so they appear in place; existing
  // nodes glide from where they are. reduced-motion snaps.
  const applyTargets = useCallback(
    (laid: Node[]) => {
      const targets = new Map<string, { x: number; y: number }>();
      for (const n of laid) targets.set(n.id, { x: n.position.x, y: n.position.y });
      targetsReference.current = targets;
      // Drop physics for nodes no longer in the tree.
      for (const id of physicsReference.current.keys()) {
        if (!targets.has(id)) physicsReference.current.delete(id);
      }
      // Seed untracked (new) nodes at their target — no fly-in from origin.
      for (const [id, t] of targets) {
        if (!physicsReference.current.has(id)) {
          physicsReference.current.set(id, { vx: 0, vy: 0, x: t.x, y: t.y });
        }
      }
      if (reduceMotion.current) {
        for (const [id, t] of targets) {
          physicsReference.current.set(id, { vx: 0, vy: 0, x: t.x, y: t.y });
        }
        setNodes((current) =>
          current.map((n) => {
            const t = targets.get(n.id);
            return t ? { ...n, position: { x: t.x, y: t.y } } : n;
          }),
        );
        return;
      }
      startSpring();
    },
    [setNodes, startSpring],
  );

  // Stop the loop on unmount.
  useEffect(
    () => () => {
      if (rafReference.current !== null) cancelAnimationFrame(rafReference.current);
    },
    [],
  );

  // Loading screen only on FLOW LOAD/switch — not on every edit.
  useEffect(() => {
    setReady(false);
  }, [flowId]);

  // Rebuild the node/edge SET when the workflow changes, but PRESERVE existing
  // node positions (only the freshly-built data/structure is taken). So a data
  // edit — e.g. renaming a stage — updates in place instead of snapping every
  // node to estimated positions (which flickered on each keystroke). New nodes
  // take their computed position; the reflow effect settles any real change.
  useEffect(() => {
    setNodes((current) => {
      const previousById = new Map(current.map((n) => [n.id, n]));
      return initialNodes.map((n) => {
        const previous = previousById.get(n.id);
        // Carry over BOTH position AND measured size for nodes that already
        // exist. Preserving `measured` keeps them "initialized" in React Flow,
        // so a structural edit (e.g. toggling a parallel lane between end and
        // merge) never triggers a re-measure -> no estimated-then-measured
        // two-phase relayout -> no flicker. New nodes get measured normally.
        return previous
          ? {
              ...n,
              height: previous.height,
              measured: previous.measured,
              position: previous.position,
              width: previous.width,
            }
          : n;
      });
    });
    setEdges(built.edges);
  }, [built, initialNodes, setNodes, setEdges]);

  // Re-run the tidy-tree layout whenever the structure OR any node's MEASURED
  // size changes — e.g. inserting a step makes a stage TALLER (same node, no
  // add/remove), so the whole tree must reflow LIVE to keep spacing/top-align
  // and never overlap. Re-FIT only on a structural change; a resize reflows in
  // place without yanking the camera.
  const sizeSig = nodes
    .map(
      (n) => `${n.id}:${Math.round(n.measured?.width ?? 0)}x${Math.round(n.measured?.height ?? 0)}`,
    )
    .join("|");
  const lastFlowId = useRef<null | string>(null);
  useEffect(() => {
    if (!nodesInitialized) return;
    // Compute fresh TARGET positions from the latest measured nodes, then let
    // the spring ease toward them (see applyTargets). nodesRef avoids adding
    // `nodes` to the deps — the spring mutates positions every frame, and we
    // must not recompute the layout on each of those frames.
    applyTargets(layoutTree(nodesReference.current, edges));
    if (lastFlowId.current === flowId) {
      // Same flow, structure/size changed (an edit) -> the spring glides nodes
      // in place; KEEP the camera where it is (don't zoom out / re-fit).
      setReady(true);
    } else {
      // First layout of THIS flow -> frame it and reveal.
      lastFlowId.current = flowId;
      requestAnimationFrame(() => {
        fitView({ duration: 200, padding: 0.2 });
        setReady(true);
      });
    }
  }, [nodesInitialized, sizeSig, built, edges, fitView, applyTargets, flowId]);

  // Selection only RE-HIGHLIGHTS — patch node data in place (positions kept), so
  // clicking a step inside a stage never re-lays-out / re-fits the tree.
  useEffect(() => {
    setNodes((current) => current.map((n) => ({ ...n, data: { ...n.data, selectedId } })));
  }, [selectedId, setNodes]);

  // Patch fresh workflow DATA (stage/branch objects) into nodes WITHOUT relayout
  // whenever the workflow changes — so edits (rename, config) update live and in
  // place. Structure changes go through `built`/structKey; this is data only.
  useEffect(() => {
    const stageById = new Map<string, Stage>();
    const branchById = new Map<string, Branch>();
    const walk = (steps: Step[]): void => {
      for (const st of steps)
        for (const b of [...(st.branches ?? []), ...(st.children ?? [])]) {
          branchById.set(b.id, b);
          walk(b.steps);
        }
    };
    for (const s of stages) {
      stageById.set(s.id, s);
      walk(s.steps);
    }
    setNodes((current) =>
      current.map((n) => {
        if (n.type === "stage" || n.type === "prestage") {
          const s = stageById.get(n.id);
          return s ? { ...n, data: { ...n.data, stage: s } } : n;
        }
        if (n.type === "substage") {
          const b = branchById.get(n.id);
          return b ? { ...n, data: { ...n.data, branch: b } } : n;
        }
        return n;
      }),
    );
  }, [stages, setNodes]);

  // FOCUS: click a node -> centre the camera on it and zoom in. Selection still
  // fires through the node's own cb.onSelect (inside StageBand / Lane), so the
  // config panel keeps tracking selection independently.
  const onNodeClick = useCallback(
    (_event: ReactMouseEvent, node: Node) => {
      const w = node.measured?.width ?? EST_W;
      const h = node.measured?.height ?? EST_H;
      setCenter(node.position.x + w / 2, node.position.y + h / 2, {
        duration: 300,
        zoom: 1,
      });
    },
    [setCenter],
  );

  return (
    <>
      <ReactFlow
        className="bg-[radial-gradient(circle,#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]"
        edges={edges}
        edgeTypes={edgeTypes}
        fitView
        maxZoom={1.5}
        minZoom={0.2}
        nodes={nodes}
        nodesConnectable={false}
        nodesDraggable={false}
        nodeTypes={nodeTypes}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodesChange={onNodesChange}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={0} variant={BackgroundVariant.Dots} />
        <Controls showInteractive={false} />
        <MiniMap className="!bg-white/80" pannable zoomable />
      </ReactFlow>
      {ready ? null : (
        <div className="absolute inset-0 z-20 grid place-items-center bg-[#eef4f4]">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Loader2 className="size-4 animate-spin" /> Loading flow…
          </div>
        </div>
      )}
    </>
  );
};

/**
 * A workflow rendered as a pannable/zoomable React Flow tree. The insert/select
 * interactions inside nodes still fire through the same {@link CanvasCallbacks}.
 *
 * @since 1.0.0
 */
export const FlowCanvasRF = (properties: FlowCanvasRFProps) => (
  <ReactFlowProvider>
    <Inner {...properties} />
  </ReactFlowProvider>
);
