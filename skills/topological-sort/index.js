// Adapted from batching-toposort, Copyright (c) 2019 Gabriel Lebec.
// MIT licensed; source: glebec/batching-toposort src/index.js and src/utils.js.
// Uses Kahn's batched root-removal algorithm, with validated edge-list input.
export default async function run(input) {
  const invalid = message => ({ valid: false, error: 'INVALID_INPUT', message });
  if (!input || typeof input !== 'object' || Array.isArray(input)) return invalid('Input must be an object.');
  if (Object.keys(input).some(k => k !== 'nodes' && k !== 'edges')) return invalid('Only nodes and edges are supported.');
  if (!Array.isArray(input.edges) || input.edges.length > 50000) return invalid('edges must be an array of at most 50000 pairs.');
  const nodes = input.nodes === undefined ? [] : input.nodes;
  if (!Array.isArray(nodes) || nodes.length > 10000) return invalid('nodes must be an array of at most 10000 IDs.');
  const isId = x => typeof x === 'string' && x.length > 0 && x.length <= 256;
  if (!nodes.every(isId)) return invalid('Node IDs must be nonempty strings of at most 256 UTF-16 units.');
  for (const edge of input.edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(isId)) return invalid('Each edge must contain exactly two nonempty string IDs of at most 256 UTF-16 units.');
  }
  const dag = new Map();
  const indegrees = new Map();
  const add = id => {
    if (!dag.has(id)) {
      dag.set(id, new Set());
      indegrees.set(id, 0);
    }
  };
  for (const id of nodes) add(id);
  let edgeCount = 0;
  for (const [from, to] of input.edges) {
    add(from);
    add(to);
    if (dag.size > 10000) return invalid('Graph must contain at most 10000 distinct nodes.');
    if (!dag.get(from).has(to)) {
      dag.get(from).add(to);
      indegrees.set(to, indegrees.get(to) + 1);
      edgeCount++;
    }
  }
  let roots = [...indegrees].filter(([, degree]) => degree === 0).map(([id]) => id);
  const batches = [];
  const order = [];
  while (roots.length) {
    batches.push(roots);
    const newRoots = [];
    for (const root of roots) {
      order.push(root);
      for (const dependent of dag.get(root)) {
        const degree = indegrees.get(dependent) - 1;
        indegrees.set(dependent, degree);
        if (degree === 0) newRoots.push(dependent);
      }
    }
    roots = newRoots;
  }
  const blocked = [...indegrees].filter(([, degree]) => degree !== 0).map(([id]) => id);
  if (blocked.length) return {
    valid: false, error: 'CYCLE', message: 'Graph contains a directed cycle; blocked nodes include downstream dependents.',
    partialOrder: order, partialBatches: batches, blocked, nodeCount: dag.size, edgeCount
  };
  return { valid: true, order, batches, nodeCount: dag.size, edgeCount };
}
