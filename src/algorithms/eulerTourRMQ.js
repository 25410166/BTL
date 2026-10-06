// Euler Tour + Sparse Table (RMQ) Algorithm for O(1) LCA Queries

/**
 * Preprocess tree using Euler Tour and Sparse Table for Range Minimum Query (RMQ)
 * Preprocessing time: O(N log N)
 * Query time: O(1)
 */
export function preprocessEulerRMQ(n, adj, root = 1) {
  if (n <= 0) return null;

  const euler = [];
  const depthArr = [];
  const first = new Array(n + 1).fill(-1);
  const nodeDepths = new Array(n + 1).fill(0);
  const visited = new Array(n + 1).fill(false);

  function dfs(u, d) {
    visited[u] = true;
    nodeDepths[u] = d;
    first[u] = euler.length;
    euler.push(u);
    depthArr.push(d);

    for (const v of adj[u]) {
      if (!visited[v]) {
        dfs(v, d + 1);
        euler.push(u);
        depthArr.push(d);
      }
    }
  }

  dfs(root, 0);

  const m = euler.length;
  if (m === 0) return null;

  const LOGM = Math.max(1, Math.floor(Math.log2(m)) + 1);
  // st[k][i] stores index in euler array having minimum depth in [i, i + 2^k - 1]
  const st = Array.from({ length: LOGM }, () => new Int32Array(m));

  for (let i = 0; i < m; i++) {
    st[0][i] = i;
  }

  for (let k = 1; k < LOGM; k++) {
    const len = 1 << (k - 1);
    for (let i = 0; i + (1 << k) <= m; i++) {
      const idx1 = st[k - 1][i];
      const idx2 = st[k - 1][i + len];
      st[k][i] = depthArr[idx1] <= depthArr[idx2] ? idx1 : idx2;
    }
  }

  return {
    euler,
    depthArr,
    first,
    nodeDepths,
    st,
    LOGM,
    root,
  };
}

/**
 * Query LCA in O(1) using Sparse Table RMQ
 */
export function queryEulerLCA(u, v, rmqData) {
  if (u === v) return u;
  const { euler, depthArr, first, st } = rmqData;

  let l = first[u];
  let r = first[v];
  if (l > r) {
    const tmp = l;
    l = r;
    r = tmp;
  }

  const length = r - l + 1;
  const k = Math.floor(Math.log2(length));
  const idx1 = st[k][l];
  const idx2 = st[k][r - (1 << k) + 1];

  const minIdx = depthArr[idx1] <= depthArr[idx2] ? idx1 : idx2;
  return euler[minIdx];
}

/**
 * Query Distance in O(1) using Euler RMQ LCA
 */
export function queryEulerDistance(u, v, rmqData) {
  const lca = queryEulerLCA(u, v, rmqData);
  return rmqData.nodeDepths[u] + rmqData.nodeDepths[v] - 2 * rmqData.nodeDepths[lca];
}
