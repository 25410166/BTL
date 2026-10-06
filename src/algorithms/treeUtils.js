// Tree utility functions: parsing, layout calculation, and testcase generation

/**
 * Parse input string formatted as:
 * n q
 * next n-1 lines: u v
 * next q lines: a b
 */
export function parseInput(inputStr) {
  if (!inputStr || typeof inputStr !== 'string') {
    return { success: false, error: 'Dữ liệu đầu vào trống' };
  }

  const lines = inputStr
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (lines.length === 0) {
    return { success: false, error: 'Không tìm thấy dữ liệu hợp lệ' };
  }

  // Parse n, q
  const firstTokens = lines[0].split(/\s+/).map(Number);
  if (firstTokens.length < 2 || isNaN(firstTokens[0]) || isNaN(firstTokens[1])) {
    return { success: false, error: 'Dòng đầu tiên phải chứa 2 số nguyên n và q' };
  }

  const n = firstTokens[0];
  const q = firstTokens[1];

  if (n < 1) {
    return { success: false, error: 'Số căn hộ n phải >= 1' };
  }
  if (q < 0) {
    return { success: false, error: 'Số truy vấn q phải >= 0' };
  }

  const expectedEdges = n - 1;
  const expectedTotal = 1 + expectedEdges + q;

  if (lines.length < 1 + expectedEdges) {
    return {
      success: false,
      error: `Thiếu dữ liệu cạnh: Cần ${expectedEdges} cạnh cho ${n} căn hộ, nhưng chỉ có ${lines.length - 1} dòng`,
    };
  }

  const edges = [];
  const adj = Array.from({ length: n + 1 }, () => []);

  for (let i = 1; i <= expectedEdges; i++) {
    const tokens = lines[i].split(/\s+/).map(Number);
    if (tokens.length < 2 || isNaN(tokens[0]) || isNaN(tokens[1])) {
      return { success: false, error: `Dòng cạnh ${i + 1} không hợp lệ: "${lines[i]}"` };
    }
    const u = tokens[0];
    const v = tokens[1];

    if (u < 1 || u > n || v < 1 || v > n) {
      return {
        success: false,
        error: `Cạnh thứ ${i} (${u}, ${v}) vượt quá phạm vi căn hộ [1, ${n}]`,
      };
    }
    if (u === v) {
      return { success: false, error: `Cạnh thứ ${i} nối chính nó (${u}, ${v}) - Không phải cây!` };
    }

    edges.push([u, v]);
    adj[u].push(v);
    adj[v].push(u);
  }

  // Validate connectivity & acyclic (tree check)
  if (n > 1) {
    const visited = new Array(n + 1).fill(false);
    let visitedCount = 0;
    const queue = [1];
    visited[1] = true;

    while (queue.length > 0) {
      const curr = queue.shift();
      visitedCount++;
      for (const nxt of adj[curr]) {
        if (!visited[nxt]) {
          visited[nxt] = true;
          queue.push(nxt);
        }
      }
    }

    if (visitedCount !== n) {
      return {
        success: false,
        error: `Đồ thị không liên thông! Chỉ thăm được ${visitedCount}/${n} căn hộ. Đồ thị phải là CÂY.`,
      };
    }
  }

  // Parse queries
  const queries = [];
  const queryStartIdx = 1 + expectedEdges;
  for (let i = queryStartIdx; i < queryStartIdx + q; i++) {
    if (i >= lines.length) break;
    const tokens = lines[i].split(/\s+/).map(Number);
    if (tokens.length >= 2 && !isNaN(tokens[0]) && !isNaN(tokens[1])) {
      const a = tokens[0];
      const b = tokens[1];
      if (a < 1 || a > n || b < 1 || b > n) {
        return {
          success: false,
          error: `Truy vấn "${lines[i]}" chứa căn hộ ngoài khoảng [1, ${n}]`,
        };
      }
      queries.push([a, b]);
    }
  }

  return {
    success: true,
    n,
    q: queries.length,
    edges,
    queries,
    adj,
  };
}

/**
 * Format data back to input string format
 */
export function formatToInputString(n, q, edges, queries) {
  let res = `${n} ${q}\n`;
  for (const [u, v] of edges) {
    res += `${u} ${v}\n`;
  }
  for (const [a, b] of queries) {
    res += `${a} ${b}\n`;
  }
  return res.trim();
}

/**
 * Generate Tree topologies
 */
export function generateTreeTopology(type, n = 5, q = 3) {
  n = Math.max(1, parseInt(n) || 5);
  q = Math.max(1, parseInt(q) || 3);
  const edges = [];

  if (n === 1) {
    // Single node tree
    const queries = [];
    for (let i = 0; i < q; i++) queries.push([1, 1]);
    return { n, q, edges, queries, inputStr: formatToInputString(n, q, edges, queries) };
  }

  if (type === 'sample') {
    return {
      n: 5,
      q: 3,
      edges: [
        [1, 2],
        [1, 3],
        [3, 4],
        [3, 5],
      ],
      queries: [
        [1, 3],
        [2, 5],
        [1, 4],
      ],
      inputStr: `5 3\n1 2\n1 3\n3 4\n3 5\n1 3\n2 5\n1 4`,
    };
  }

  if (type === 'line') {
    // 1 - 2 - 3 - ... - n
    for (let i = 1; i < n; i++) {
      edges.push([i, i + 1]);
    }
  } else if (type === 'star') {
    // 1 connects to 2, 3, ..., n
    for (let i = 2; i <= n; i++) {
      edges.push([1, i]);
    }
  } else if (type === 'binary') {
    // Complete binary tree
    for (let i = 1; i <= n; i++) {
      const left = 2 * i;
      const right = 2 * i + 1;
      if (left <= n) edges.push([i, left]);
      if (right <= n) edges.push([i, right]);
    }
  } else if (type === 'caterpillar') {
    // Central spine + leaves attached
    const spineLen = Math.max(2, Math.floor(n / 2));
    for (let i = 1; i < spineLen; i++) {
      edges.push([i, i + 1]);
    }
    for (let i = spineLen + 1; i <= n; i++) {
      const parent = 1 + Math.floor(Math.random() * spineLen);
      edges.push([parent, i]);
    }
  } else {
    // Random tree using random attachment
    for (let i = 2; i <= n; i++) {
      const parent = 1 + Math.floor(Math.random() * (i - 1));
      edges.push([parent, i]);
    }
  }

  // Generate diverse queries
  const queries = [];
  // Ensure some edge cases
  if (q >= 1) queries.push([1, n]); // Root to deepest/last
  if (q >= 2) queries.push([Math.min(2, n), Math.min(2, n)]); // Same node dist 0
  if (q >= 3 && edges.length > 0) queries.push([edges[0][0], edges[0][1]]); // Direct edge dist 1

  while (queries.length < q) {
    const a = 1 + Math.floor(Math.random() * n);
    const b = 1 + Math.floor(Math.random() * n);
    queries.push([a, b]);
  }

  return {
    n,
    q,
    edges,
    queries,
    inputStr: formatToInputString(n, q, edges, queries),
  };
}

/**
 * Calculate hierarchical coordinates (x, y) for tree visualization
 * Returns map of node -> { x, y, depth }
 */
export function computeTreeLayout(n, adj, root = 1, width = 800, height = 500) {
  if (n <= 0) return {};
  if (n === 1) {
    return {
      1: { x: width / 2, y: height / 2, depth: 0 },
    };
  }

  // BFS / DFS to build tree hierarchy
  const children = Array.from({ length: n + 1 }, () => []);
  const depths = new Array(n + 1).fill(-1);
  const queue = [root];
  depths[root] = 0;

  while (queue.length > 0) {
    const u = queue.shift();
    for (const v of adj[u]) {
      if (depths[v] === -1) {
        depths[v] = depths[u] + 1;
        children[u].push(v);
        queue.push(v);
      }
    }
  }

  const maxDepth = Math.max(...depths.slice(1));
  const paddingX = 60;
  const paddingY = 60;
  const availableWidth = Math.max(400, width - paddingX * 2);
  const availableHeight = Math.max(300, height - paddingY * 2);

  const levelYGap = maxDepth > 0 ? availableHeight / maxDepth : 0;

  // Bottom-up leaf indexing to assign balanced X positions
  let leafCounter = 0;
  const nodeX = {};

  function assignX(node) {
    if (children[node].length === 0) {
      nodeX[node] = leafCounter++;
      return;
    }
    for (const c of children[node]) {
      assignX(c);
    }
    const firstChildX = nodeX[children[node][0]];
    const lastChildX = nodeX[children[node][children[node].length - 1]];
    nodeX[node] = (firstChildX + lastChildX) / 2;
  }

  assignX(root);

  const totalLeaves = Math.max(1, leafCounter);
  const xStep = totalLeaves > 1 ? availableWidth / (totalLeaves - 1) : availableWidth / 2;

  const positions = {};
  for (let u = 1; u <= n; u++) {
    const x = paddingX + (nodeX[u] !== undefined ? nodeX[u] * xStep : availableWidth / 2);
    const y = paddingY + depths[u] * levelYGap;
    positions[u] = {
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1)),
      depth: depths[u],
    };
  }

  return positions;
}
