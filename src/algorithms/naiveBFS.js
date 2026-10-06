// Naive BFS traversal per query
// Time complexity: O(Q * (V + E)) = O(Q * N)
// Great baseline for comparing with LCA algorithms

/**
 * Single BFS query to find shortest distance between u and v
 */
export function naiveBFSDistance(u, v, adj, n) {
  if (u === v) return { distance: 0, path: [u] };

  const dist = new Int32Array(n + 1).fill(-1);
  const parent = new Int32Array(n + 1).fill(0);
  const queue = [u];
  dist[u] = 0;

  while (queue.length > 0) {
    const curr = queue.shift();
    if (curr === v) break;

    for (const nxt of adj[curr]) {
      if (dist[nxt] === -1) {
        dist[nxt] = dist[curr] + 1;
        parent[nxt] = curr;
        queue.push(nxt);
      }
    }
  }

  // Reconstruct path
  const path = [];
  let curr = v;
  while (curr !== 0) {
    path.push(curr);
    curr = parent[curr];
  }
  path.reverse();

  return {
    distance: dist[v],
    path,
  };
}

/**
 * Solve all queries with BFS (Naive approach)
 */
export function solveAllQueriesBFS(n, adj, queries) {
  const results = [];
  for (const [u, v] of queries) {
    results.push(naiveBFSDistance(u, v, adj, n).distance);
  }
  return results;
}
