/**
 * Lightweight QR Code Generator for PDF certificates.
 * Generates a QR code matrix (2D boolean array) from a string.
 * 
 * This is a minimal implementation supporting alphanumeric mode
 * with error correction level L, suitable for short URLs.
 * 
 * Based on QR Code specification ISO/IEC 18004.
 */

// ── GF(256) field arithmetic for Reed-Solomon ──
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_LOG[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) {
    GF256_EXP[i] = GF256_EXP[i - 255];
  }
})();

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return GF256_EXP[GF256_LOG[a] + GF256_LOG[b]];
}

// ── Reed-Solomon error correction ──
function rsGenPoly(nsym) {
  let g = [1];
  for (let i = 0; i < nsym; i++) {
    const ng = new Array(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) {
      ng[j] ^= g[j];
      ng[j + 1] ^= gfMul(g[j], GF256_EXP[i]);
    }
    g = ng;
  }
  return g;
}

function rsEncode(data, nsym) {
  const gen = rsGenPoly(nsym);
  const res = new Uint8Array(data.length + nsym);
  res.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return res.slice(data.length);
}

// ── QR Code Version/EC parameters (versions 1-10, EC level L) ──
const QR_PARAMS = [
  null, // index 0 unused
  { totalCW: 26, ecCW: 7, dataGroups: [[1, 19]] },     // v1
  { totalCW: 44, ecCW: 10, dataGroups: [[1, 34]] },    // v2
  { totalCW: 70, ecCW: 15, dataGroups: [[1, 55]] },    // v3
  { totalCW: 100, ecCW: 20, dataGroups: [[1, 80]] },   // v4
  { totalCW: 134, ecCW: 26, dataGroups: [[1, 108]] },  // v5
  { totalCW: 172, ecCW: 18, dataGroups: [[2, 68]] },   // v6
  { totalCW: 196, ecCW: 20, dataGroups: [[2, 78]] },   // v7
  { totalCW: 242, ecCW: 24, dataGroups: [[2, 97]] },   // v8
  { totalCW: 292, ecCW: 30, dataGroups: [[2, 116]] },  // v9
  { totalCW: 346, ecCW: 18, dataGroups: [[2, 68], [2, 69]] }, // v10
];

// Alignment pattern locations per version
const ALIGN_POSITIONS = [
  null, [], [6, 18], [6, 22], [6, 26], [6, 30],
  [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]
];

const BYTE_MODE = 4; // Mode indicator for byte mode

/**
 * Encode data as byte mode QR code data codewords.
 */
function encodeData(text, version) {
  const params = QR_PARAMS[version];
  const dataCap = params.dataGroups.reduce((s, g) => s + g[0] * g[1], 0);

  const textBytes = new TextEncoder().encode(text);
  const bits = [];

  // Mode indicator (4 bits): byte mode = 0100
  bits.push(0, 1, 0, 0);

  // Character count indicator (8 bits for versions 1-9, 16 bits for 10+)
  const ccBits = version <= 9 ? 8 : 16;
  for (let i = ccBits - 1; i >= 0; i--) {
    bits.push((textBytes.length >> i) & 1);
  }

  // Data
  for (const byte of textBytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }

  // Terminator (up to 4 zeros)
  const maxBits = dataCap * 8;
  for (let i = 0; i < 4 && bits.length < maxBits; i++) {
    bits.push(0);
  }

  // Pad to byte boundary
  while (bits.length % 8 !== 0 && bits.length < maxBits) {
    bits.push(0);
  }

  // Pad bytes
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    for (let i = 7; i >= 0; i--) {
      bits.push((padBytes[padIdx] >> i) & 1);
    }
    padIdx = (padIdx + 1) % 2;
  }

  // Convert to bytes
  const dataBytes = new Uint8Array(dataCap);
  for (let i = 0; i < dataCap; i++) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | (bits[i * 8 + j] || 0);
    }
    dataBytes[i] = byte;
  }

  return dataBytes;
}

/**
 * Compute error correction and interleave codewords.
 */
function computeEC(dataBytes, version) {
  const params = QR_PARAMS[version];
  const ecPerBlock = params.ecCW;

  const dataBlocks = [];
  const ecBlocks = [];
  let offset = 0;

  for (const [count, size] of params.dataGroups) {
    for (let i = 0; i < count; i++) {
      const block = dataBytes.slice(offset, offset + size);
      dataBlocks.push(block);
      ecBlocks.push(rsEncode(block, ecPerBlock));
      offset += size;
    }
  }

  // Interleave data codewords
  const result = [];
  const maxDataLen = Math.max(...dataBlocks.map(b => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }

  // Interleave EC codewords
  for (let i = 0; i < ecPerBlock; i++) {
    for (const block of ecBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }

  return result;
}

/**
 * Create the QR matrix and place modules.
 */
function createMatrix(version) {
  const size = version * 4 + 17;
  // 0 = white, 1 = black, -1 = unset
  const matrix = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
  const reserved = Array.from({ length: size }, () => new Uint8Array(size));

  // Place finder patterns
  function placeFinder(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = row + r, cc = col + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        const isBlack = (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        matrix[rr][cc] = isBlack ? 1 : 0;
        reserved[rr][cc] = 1;
      }
    }
  }

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Place alignment patterns
  const alignPos = ALIGN_POSITIONS[version] || [];
  for (const row of alignPos) {
    for (const col of alignPos) {
      // Skip if overlapping finder patterns
      if (reserved[row]?.[col]) continue;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const rr = row + r, cc = col + c;
          if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
          const isBlack = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
          matrix[rr][cc] = isBlack ? 1 : 0;
          reserved[rr][cc] = 1;
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const val = i % 2 === 0 ? 1 : 0;
    if (matrix[6][i] === -1) {
      matrix[6][i] = val;
      reserved[6][i] = 1;
    }
    if (matrix[i][6] === -1) {
      matrix[i][6] = val;
      reserved[i][6] = 1;
    }
  }

  // Dark module
  matrix[size - 8][8] = 1;
  reserved[size - 8][8] = 1;

  // Reserve format info areas
  for (let i = 0; i < 8; i++) {
    reserved[8][i] = 1;
    reserved[8][size - 1 - i] = 1;
    reserved[i][8] = 1;
    reserved[size - 1 - i][8] = 1;
  }
  reserved[8][8] = 1;

  // Reserve version info areas (v7+)
  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        reserved[i][size - 11 + j] = 1;
        reserved[size - 11 + j][i] = 1;
      }
    }
  }

  return { matrix, reserved, size };
}

/**
 * Place data bits in the matrix.
 */
function placeData(matrix, reserved, size, codewords) {
  const bits = [];
  for (const cw of codewords) {
    for (let i = 7; i >= 0; i--) {
      bits.push((cw >> i) & 1);
    }
  }

  let bitIdx = 0;
  let upward = true;

  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col = 5; // Skip timing column

    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const row of rows) {
      for (const c of [col, col - 1]) {
        if (c < 0 || c >= size) continue;
        if (reserved[row][c]) continue;
        matrix[row][c] = bitIdx < bits.length ? bits[bitIdx] : 0;
        bitIdx++;
      }
    }

    upward = !upward;
  }
}

/**
 * Apply mask pattern 0 (checkerboard) and format info.
 */
function applyMaskAndFormat(matrix, reserved, size) {
  // Apply mask pattern 0: (row + col) % 2 == 0
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c] && (r + c) % 2 === 0) {
        matrix[r][c] ^= 1;
      }
    }
  }

  // Format info for EC level L (01) and mask 0 (000)
  // Format bits: 01 000 → error correction bits → XOR with 101010000010010
  const formatBits = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0];

  // Place format info
  // Around top-left finder
  const positions1 = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
  ];

  // Around other finders
  const positions2 = [
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8],
    [size - 5, 8], [size - 6, 8], [size - 7, 8],
    [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5],
    [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1]
  ];

  for (let i = 0; i < 15; i++) {
    const [r1, c1] = positions1[i];
    const [r2, c2] = positions2[i];
    matrix[r1][c1] = formatBits[i];
    matrix[r2][c2] = formatBits[i];
  }
}

/**
 * Determine minimum QR version for a given byte-mode text.
 */
function getMinVersion(text) {
  const byteLen = new TextEncoder().encode(text).length;
  for (let v = 1; v <= 10; v++) {
    const params = QR_PARAMS[v];
    const dataCap = params.dataGroups.reduce((s, g) => s + g[0] * g[1], 0);
    // byte mode: 4 + ccBits + data*8 must fit in dataCap*8 bits
    const ccBits = v <= 9 ? 8 : 16;
    const needed = Math.ceil((4 + ccBits + byteLen * 8) / 8);
    if (needed <= dataCap) return v;
  }
  throw new Error('Text too long for QR code (max version 10)');
}

/**
 * Generate a QR code matrix from a text string.
 * Returns a 2D array of booleans (true = black module).
 * 
 * @param {string} text - The text to encode
 * @returns {{ matrix: boolean[][], size: number }}
 */
export function generateQRMatrix(text) {
  const version = getMinVersion(text);
  const dataBytes = encodeData(text, version);
  const codewords = computeEC(dataBytes, version);
  const { matrix, reserved, size } = createMatrix(version);

  placeData(matrix, reserved, size, codewords);
  applyMaskAndFormat(matrix, reserved, size);

  // Convert to boolean matrix
  const boolMatrix = matrix.map(row =>
    Array.from(row).map(v => v === 1)
  );

  return { matrix: boolMatrix, size };
}
