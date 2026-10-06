// Binary Lifting Algorithm (Nhị phân nâng) for LCA and Tree Distance

/**
 * Preprocess tree using Binary Lifting
 * Complexity: O(N log N) time, O(N log N) space
 */
export function preprocessBinaryLifting(n, adj, root = 1) {
  if (n <= 0) return { LOGN: 1, up: [], depth: [] };

  const LOGN = Math.max(1, Math.floor(Math.log2(Math.max(1, n))) + 2);
  const up = Array.from({ length: n + 1 }, () => new Array(LOGN).fill(0));
  const depth = new Array(n + 1).fill(0);
  const visited = new Array(n + 1).fill(false);

  // BFS / DFS to initialize depth and up[u][0] (direct parent)
  const queue = [root];
  visited[root] = true;
  up[root][0] = root; // Root's parent is itself
  depth[root] = 0;

  while (queue.length > 0) {
    const u = queue.shift();
    for (const v of adj[u]) {
      if (!visited[v]) {
        visited[v] = true;
        depth[v] = depth[u] + 1;
        up[v][0] = u;
        queue.push(v);
      }
    }
  }

  // DP table: up[u][k] = up[up[u][k-1]][k-1]
  for (let k = 1; k < LOGN; k++) {
    for (let u = 1; u <= n; u++) {
      const mid = up[u][k - 1];
      up[u][k] = up[mid][k - 1];
    }
  }

  return { LOGN, up, depth, root };
}

/**
 * Fast LCA Query using Binary Lifting
 * Time: O(log N)
 */
export function queryLCA(u, v, up, depth, LOGN) {
  if (u === v) return u;

  if (depth[u] < depth[v]) {
    const tmp = u;
    u = v;
    v = tmp;
  }

  // Lift u to same depth as v
  const diff = depth[u] - depth[v];
  for (let k = LOGN - 1; k >= 0; k--) {
    if ((diff >> k) & 1) {
      u = up[u][k];
    }
  }

  if (u === v) return u;

  // Lift both u and v simultaneously
  for (let k = LOGN - 1; k >= 0; k--) {
    if (up[u][k] !== up[v][k]) {
      u = up[u][k];
      v = up[v][k];
    }
  }

  return up[u][0];
}

/**
 * Fast Distance Query using LCA
 * Distance = depth[u] + depth[v] - 2 * depth[LCA(u, v)]
 */
export function queryDistance(u, v, up, depth, LOGN) {
  const lca = queryLCA(u, v, up, depth, LOGN);
  return depth[u] + depth[v] - 2 * depth[lca];
}

/**
 * Reconstruct tree path from u to v via LCA
 */
export function reconstructPath(u, v, lca, up) {
  if (u === v) return [u];

  const pathToLCA = [];
  let curr = u;
  while (curr !== lca) {
    pathToLCA.push(curr);
    curr = up[curr][0];
  }
  pathToLCA.push(lca);

  const pathFromLCA = [];
  curr = v;
  while (curr !== lca) {
    pathFromLCA.push(curr);
    curr = up[curr][0];
  }

  pathFromLCA.reverse();
  return [...pathToLCA, ...pathFromLCA];
}

/**
 * Generate Step-by-Step Visualization Execution Trace for a Query (u, v)
 */
export function getLCAWithVisualizationSteps(origU, origV, up, depth, LOGN) {
  const steps = [];
  let u = origU;
  let v = origV;

  steps.push({
    type: 'START',
    title: 'Khởi tạo truy vấn khoảng cách',
    description: `Tìm khoảng cách giữa căn hộ ${origU} (độ sâu ${depth[origU]}) và ${origV} (độ sâu ${depth[origV]}).`,
    currU: u,
    currV: v,
    activeNodes: [u, v],
    highlightEdges: [],
    lcaCandidate: null,
    formula: `dist(${origU}, ${origV}) = depth[${origU}] + depth[${origV}] - 2 × depth[LCA]`,
    jumpInfo: null,
  });

  if (origU === origV) {
    steps.push({
      type: 'SAME_NODE',
      title: 'Hai căn hộ trùng nhau',
      description: `Hai căn hộ trùng nhau (${origU} ≡ ${origV}). LCA chính là ${origU}, khoảng cách bằng 0.`,
      currU: u,
      currV: v,
      activeNodes: [u],
      highlightEdges: [],
      lcaCandidate: u,
      formula: `dist = ${depth[u]} + ${depth[v]} - 2 × ${depth[u]} = 0`,
      jumpInfo: null,
      finalPath: [u],
      distance: 0,
      lca: u,
    });
    return steps;
  }

  let swapped = false;
  if (depth[u] < depth[v]) {
    const tmp = u;
    u = v;
    v = tmp;
    swapped = true;
    steps.push({
      type: 'SWAP',
      title: 'Hoán đổi hai đỉnh',
      description: `Độ sâu(${u}) > Độ sâu(${v}). Ta chọn đỉnh sâu hơn là ${u} để thực hiện nâng nhị phân lên cùng mức với ${v}.`,
      currU: u,
      currV: v,
      activeNodes: [u, v],
      highlightEdges: [],
      lcaCandidate: null,
      formula: `Chênh lệch độ sâu: Δ = depth[${u}] - depth[${v}] = ${depth[u] - depth[v]}`,
      jumpInfo: null,
    });
  }

  // Lift u to same depth as v
  const diff = depth[u] - depth[v];
  if (diff > 0) {
    for (let k = LOGN - 1; k >= 0; k--) {
      if ((diff >> k) & 1) {
        const nextU = up[u][k];
        steps.push({
          type: 'LIFT_EQUAL',
          title: `Cân bằng độ sâu (Nhảy 2^${k} = ${1 << k} tầng)`,
          description: `Vì bit ${k} của chênh lệch (${diff}) bằng 1, đỉnh ${u} nhảy lên tổ tiên thứ ${1 << k} là đỉnh ${nextU}.`,
          currU: nextU,
          currV: v,
          activeNodes: [nextU, v],
          highlightEdges: [[u, nextU]],
          lcaCandidate: null,
          formula: `u mới = up[${u}][${k}] = ${nextU} (độ sâu: ${depth[nextU]})`,
          jumpInfo: { from: u, to: nextU, power: k, span: 1 << k },
        });
        u = nextU;
      }
    }
  }

  if (u === v) {
    const lca = u;
    const finalDistance = depth[origU] + depth[origV] - 2 * depth[lca];
    const finalPath = reconstructPath(origU, origV, lca, up);
    steps.push({
      type: 'FOUND_DIRECT',
      title: `Đã tìm thấy LCA trực tiếp: Đỉnh ${lca}`,
      description: `Sau khi nâng lên cùng độ sâu, hai đỉnh trùng nhau. Do đó căn hộ ${lca} chính là tổ tiên chung gần nhất (LCA).`,
      currU: u,
      currV: v,
      activeNodes: [lca],
      highlightEdges: [],
      lcaCandidate: lca,
      formula: `dist = depth[${origU}] + depth[${origV}] - 2 × depth[${lca}] = ${depth[origU]} + ${depth[origV]} - 2 × ${depth[lca]} = ${finalDistance}`,
      jumpInfo: null,
      finalPath,
      distance: finalDistance,
      lca,
    });
    return steps;
  }

  // Lift both simultaneously
  steps.push({
    type: 'SIMULTANEOUS_START',
    title: 'Nâng đồng thời cả hai đỉnh',
    description: `Hai đỉnh ${u} và ${v} hiện cùng độ sâu ${depth[u]}. Ta duyệt k từ ${LOGN - 1} xuống 0 để cùng nhảy lên nếu up[u][k] ≠ up[v][k].`,
    currU: u,
    currV: v,
    activeNodes: [u, v],
    highlightEdges: [],
    lcaCandidate: null,
    formula: `Tìm tổ tiên xa nhất chưa trùng nhau`,
    jumpInfo: null,
  });

  for (let k = LOGN - 1; k >= 0; k--) {
    const ancU = up[u][k];
    const ancV = up[v][k];
    if (ancU !== ancV) {
      steps.push({
        type: 'SIMULTANEOUS_LIFT',
        title: `Nhảy đồng thời 2^${k} = ${1 << k} tầng`,
        description: `Vì up[${u}][${k}] = ${ancU} ≠ up[${v}][${k}] = ${ancV}, cả hai đỉnh cùng nhảy lên tổ tiên thứ ${1 << k}.`,
        currU: ancU,
        currV: ancV,
        activeNodes: [ancU, ancV],
        highlightEdges: [
          [u, ancU],
          [v, ancV],
        ],
        lcaCandidate: null,
        formula: `u: ${u} ➔ ${ancU} | v: ${v} ➔ ${ancV}`,
        jumpInfo: { uFrom: u, uTo: ancU, vFrom: v, vTo: ancV, power: k },
      });
      u = ancU;
      v = ancV;
    }
  }

  const lca = up[u][0];
  const finalDistance = depth[origU] + depth[origV] - 2 * depth[lca];
  const finalPath = reconstructPath(origU, origV, lca, up);

  steps.push({
    type: 'FINAL_LCA',
    title: `Tìm thấy LCA: Đỉnh ${lca}`,
    description: `LCA của ${origU} và ${origV} là cha trực tiếp: up[${u}][0] = ${lca}.`,
    currU: u,
    currV: v,
    activeNodes: [lca],
    highlightEdges: [],
    lcaCandidate: lca,
    formula: `LCA = up[${u}][0] = ${lca}`,
    jumpInfo: null,
  });

  steps.push({
    type: 'RESULT',
    title: `Kết quả khoảng cách: ${finalDistance} con đường`,
    description: `Khoảng cách giữa căn hộ ${origU} và ${origV} là ${finalDistance}. Lộ trình giao cơm: ${finalPath.join(' ➔ ')}.`,
    currU: origU,
    currV: origV,
    activeNodes: finalPath,
    highlightEdges: [],
    lcaCandidate: lca,
    formula: `dist(${origU}, ${origV}) = depth[${origU}] + depth[${origV}] - 2 × depth[${lca}] = ${depth[origU]} + ${depth[origV]} - 2 × ${depth[lca]} = ${finalDistance}`,
    jumpInfo: null,
    finalPath,
    distance: finalDistance,
    lca,
  });

  return steps;
}
