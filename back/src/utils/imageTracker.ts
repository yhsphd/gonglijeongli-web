import { prisma } from "../prisma";

/**
 * HTML 문자열에서 우리가 관리하는(직접 업로드된) 로컬 이미지 URL만 추출합니다.
 * 외부 URL(http://...)이나 고정 에셋(/assets/...)은 가비지 컬렉터 관리 대상이 아니므로 제외합니다.
 */
export function extractLocalImageUrls(content: string | null | undefined): string[] {
  if (!content) return [];

  // Tiptap 에디터의 JSON 문자열인 경우 대비를 위해 정규식을 넓게 잡거나
  // src="URL" 형태를 모두 매칭합니다. 여기서는 텍스트 내에서 /uploads/로 시작하는
  // 이미지 경로를 찾는 데 집중합니다.
  const regex = /\/uploads\/[a-f0-9]{64}\.[a-z0-9]+/gi;
  const matches = content.match(regex);

  if (!matches) return [];

  // 중복된 URL 제거 후 반환
  return Array.from(new Set(matches));
}

/**
 * 특정 엔티티(News, Work, Event)의 이미지 참조 정보를 DB와 동기화합니다.
 *
 * @param targetType 참조 주체의 타입 (예: "news", "works", "events")
 * @param targetId 참조 주체의 PK (예: news.id)
 * @param urls 현재 파싱된 사용중인 이미지 URL 목록
 */
export async function syncImageReferences(
  targetType: string,
  targetId: number,
  urls: string[]
): Promise<void> {
  // 1. 기존 참조 제거
  await prisma.imageReference.deleteMany({
    where: {
      targetType,
      targetId,
    },
  });

  if (urls.length === 0) return;

  // 2. 입력된 URL에 해당하는 Image.id들을 조회
  const images = await prisma.image.findMany({
    where: {
      url: {
        in: urls,
      },
    },
    select: { id: true },
  });

  if (images.length === 0) return;

  // 3. 새로운 참조 생성
  const referenceData = images.map((img) => ({
    imageId: img.id,
    targetType,
    targetId,
  }));

  await prisma.imageReference.createMany({
    data: referenceData,
  });
}
