/**
 * generate-manifest.mjs
 *
 * S3 버킷의 각 테마 폴더를 읽어 manifest JSON을 생성합니다.
 * 실행 전: npm install @aws-sdk/client-s3 (devDependencies에 있으면 생략)
 *
 * 사용법:
 *   node scripts/generate-manifest.mjs
 *
 * 결과:
 *   public/manifests/Museum.json
 *   public/manifests/Food.json
 *   public/manifests/Memory.json
 *   public/manifests/Game.json
 */

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'; // .env 파일 자동 로드

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── 설정 ─────────────────────────────────────────────────────────
const BUCKET  = process.env.S3_BUCKET   || 'photo-web-bucket';
const REGION  = process.env.AWS_REGION  || 'ap-northeast-2';
const CF_URL  = process.env.VITE_CLOUDFRONT_URL?.replace(/\/$/, ''); // trailing slash 제거
const THEMES  = ['Museum', 'Food', 'Memory', 'Game'];               // S3 폴더명과 일치
const IMG_EXT = /\.(jpe?g|png|webp|gif|avif|mp4)$/i;
const OUT_DIR = join(__dirname, '../public/manifests');

// ─── S3 클라이언트 ────────────────────────────────────────────────
const s3 = new S3Client({ region: REGION });

// ─── 유틸: 파일명에서 간단한 제목 추출 ───────────────────────────
function titleFromKey(key) {
  const filename = key.split('/').pop() ?? key;
  return filename
    .replace(/\.[^.]+$/, '')       // 확장자 제거
    .replace(/[-_]+/g, ' ')        // 하이픈/언더스코어 → 공백
    .replace(/\b\w/g, c => c.toUpperCase()); // 첫 글자 대문자
}

// ─── 메인 ─────────────────────────────────────────────────────────
mkdirSync(OUT_DIR, { recursive: true });

for (const theme of THEMES) {
  console.log(`\n📂 [${theme}] 목록 조회 중...`);

  const images = [];
  const prefixes = theme === 'Game'
    ? ['Game/animal_crossing/', 'Game/poketmon/', 'Game/ring_fit/', 'Game/splatoon/', 'Game/tomodachi/', 'Game/video/']
    : [`${theme}/`];

  for (const prefix of prefixes) {
    if (theme === 'Game') {
      console.log(`  └ 📁 [${prefix}] 조회 중...`);
    }
    
    let token;
    do {
      const res = await s3.send(new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken: token,
      }));

      for (const obj of res.Contents ?? []) {
        if (!IMG_EXT.test(obj.Key)) continue;

        const encodedKey = obj.Key.split('/').map(encodeURIComponent).join('/');
        const baseUrl = (CF_URL && CF_URL.length > 10)
          ? `${CF_URL}/${encodedKey}`
          : `https://${BUCKET}.s3.${REGION}.amazonaws.com/${encodedKey}`;

        // Get subfolder (e.g. 'animal_crossing', 'splatoon')
        const folder = obj.Key.split('/')[1] || '';

        images.push({
          url:    baseUrl,
          key:    obj.Key,
          title:  titleFromKey(obj.Key),
          folder: folder,
          artist: '',   // 필요 시 직접 편집
          museum: '',
          year:   null,
        });
      }

      token = res.NextContinuationToken;
    } while (token);
  }

  const manifest = {
    theme,
    total:     images.length,
    updatedAt: new Date().toISOString(),
    images,
  };

  const outPath = join(OUT_DIR, `${theme}.json`);
  writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`✅ ${theme}.json 생성 완료 — ${images.length}장`);
}

console.log('\n🎉 모든 manifest 생성 완료!');
console.log(`📁 저장 위치: public/manifests/`);
