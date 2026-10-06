// Tarjan's Offline LCA Algorithm with Disjoint Set Union (DSU)

class DisjointSetUnion {
  constructor(n) {
    this.parent = new Int32Array(n + 1);
    this.rank = new Int32Array(n + 1);
    this.ancestor = new Int32Array(n + 1);
    for (let i = 1; i <= n; i++) {
      this.parent[i] = i;
      this.rank[i] = 0;
      this.ancestor[i] = i;
    }
  }

  find(i) {
    if (this.parent[i] === i) return i;
    this.parent[i] = this.find(this.parent[i]);
    return this.parent[i];
  }

  union(i, j) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) {
      if (this.rank[rootI] < this.rank[rootJ]) {
        this.parent[rootI] = rootJ;
      } else if (this.rank[rootI] > this.rank[rootJ]) {
        this.parent[rootJ] = rootI;
      } else {
        this.parent[rootJ] = rootI;
        this.rank[rootI]++;
      }
    }
  }
}

/**
 * Tarjan's Offline LCA Algorithm
 * Time Complexity: O(N + Q * α(N))
 * Space: O(N + Q)
 */
export function solveTarjanOffline(n, adj, queries, root = 1) {
  if (n <= 0) return [];

  const dsu = new DisjointSetUnion(n);
  const visited = new Uint8Array(n + 1);
  const depth = new Int32Array(n + 1);
  const queryBuckets = Array.from({ length: n + 1 }, () => []);
  const answers = new Int32Array(queries.length);

  // Group queries by node
  for (let idx = 0; idx < queries.length; idx++) {
    const [u, v] = queries[idx];
    if (u === v) {
      answers[idx] = 0; // Distance is 0
      continue;
    }
    queryBuckets[u].push({ other: v, queryIdx: idx });
    queryBuckets[v].push({ other: u, queryIdx: idx });
  }

  // Precompute depth in one BFS/DFS
  const queue = [root];
  const depthVisited = new Uint8Array(n + 1);
  depthVisited[root] = 1;
  depth[root] = 0;
  while (queue.length > 0) {
    const curr = queue.shift();
    for (const nxt of adj[curr]) {
      if (!depthVisited[nxt]) {
        depthVisited[nxt] = 1;
        depth[nxt] = depth[curr] + 1;
        queue.push(nxt);
      }
    }
  }

  function dfs(u, p) {
    visited[u] = 1;
    dsu.ancestor[u] = u;

    for (const v of adj[u]) {
      if (v !== p && !visited[v]) {
        dfs(v, u);
        dsu.union(u, v);
        dsu.ancestor[dsu.find(u)] = u;
      }
    }

    // Process all queries involving u
    for (const q of queryBuckets[u]) {
      if (visited[q.other]) {
        const lca = dsu.ancestor[dsu.find(q.other)];
        const dist = depth[u] + depth[q.other] - 2 * depth[lca];
        answers[q.queryIdx] = dist;
      }
    }
  }

  dfs(root, 0);

  return Array.from(answers);
}
