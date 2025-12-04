export interface Game {
  id: string; // (수정됨) number -> string으로 변경하여 Home.tsx와 통일
  title: string;
  description: string;
  thumbnailUrl: string;
  tags: string[];
  path: string; // (추가됨) 클릭 시 이동할 경로
}