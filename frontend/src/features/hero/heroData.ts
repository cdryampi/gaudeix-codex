export type HeroVideoData = {
  src: string;
  poster?: string;
};

const publicAsset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const HERO_VIDEO: HeroVideoData = {
  src: publicAsset("media/video/gaudeix.mp4"),
};
