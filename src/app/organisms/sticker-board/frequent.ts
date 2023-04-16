interface StickerData {
  mxc: string;
  body: string;
  httpUrl: string;
}

const KEY = 'cinny_frequent_stickers';
const HISTORY_ENTRIES = 50;
const FREQUENT_STICKER_COUNT = 6;

interface groupCallback {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (element: any, index: number, array: any[]): string | symbol;
}

/**
 * Implementation of `Array.prototype.group()`
 */
function group(arr: unknown[], callback: groupCallback): Record<string | symbol, unknown[]> {
  const groups = Object.create(null);
  arr.forEach((elem, i) => {
    const key = callback(elem, i, arr);
    if (!Array.isArray(groups[key])) {
      groups[key] = [];
    }
    groups[key].push(elem);
  });
  return groups;
}

function _getStickerHistory(): StickerData[] | null {
  const stickers = localStorage.getItem(KEY);
  return stickers ? JSON.parse(stickers) : null;
}

function _setStickerHistory(stickers: StickerData[]): void {
  localStorage.setItem(KEY, JSON.stringify(stickers));
}

export function getFrequentStickers(): StickerData[] | null {
  const stickerHistory = _getStickerHistory();
  if (!stickerHistory) return null;

  const grouped = group(stickerHistory, ({ mxc }) => mxc);
  const sorted = Object.values(grouped)
    .sort((a, b) => b.length - a.length)
    .map((sticker) => sticker[0]);
  return sorted.slice(0, FREQUENT_STICKER_COUNT) as StickerData[];
}

export function addToStickerHistory(sticker: StickerData): void {
  const stickerHistory = _getStickerHistory() || [];
  while (stickerHistory.length >= HISTORY_ENTRIES) {
    stickerHistory.pop();
  }
  stickerHistory.unshift(sticker);
  _setStickerHistory(stickerHistory);
}
