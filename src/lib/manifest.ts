/**
 * src/lib/manifest.ts
 *
 * CloudFront를 통해 manifest JSON을 fetch하고
 * 테마별 이미지 목록을 반환하는 유틸리티입니다.
 */

export type Theme = 'Museum' | 'Food' | 'Memory' | 'Game';

export interface ImageMeta {
  url:    string;
  key:    string;
  title:  string;
  artist: string;
  museum: string;
  year:   number | null;
}

export interface Manifest {
  theme:     string;
  total:     number;
  updatedAt: string;
  images:    ImageMeta[];
}

// CloudFront URL (.env에서 주입)
const CF_URL = (import.meta.env.VITE_CLOUDFRONT_URL as string)?.replace(/\/$/, '');

// manifest JSON URL 조립
function manifestUrl(theme: Theme): string {
  // CloudFront 미설정 시 public 폴더 fallback (로컬 개발용)
  if (!CF_URL || CF_URL === 'https://') {
    return `/manifests/${theme}.json`;
  }
  return `${CF_URL}/manifests/${theme}.json`;
}

// 한 번 fetch한 결과를 메모리에 캐시
const cache = new Map<Theme, Manifest>();

export async function loadManifest(theme: Theme): Promise<Manifest> {
  if (cache.has(theme)) return cache.get(theme)!;

  const res = await fetch(manifestUrl(theme));
  if (!res.ok) throw new Error(`manifest fetch failed: ${theme} (${res.status})`);

  const data: Manifest = await res.json();
  cache.set(theme, data);
  return data;
}

/** 셔플된 이미지 배열 반환 (무한 순환에 적합) */
export async function loadShuffled(theme: Theme): Promise<ImageMeta[]> {
  const manifest = await loadManifest(theme);
  return [...manifest.images].sort(() => Math.random() - 0.5);
}
