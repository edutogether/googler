import { DESKTOP_BACKGROUND_PATH } from './mainVisualData';

export default function MainBackgroundArtwork() {
  return (
    <>
      <img
        className="vr2-background"
        src={DESKTOP_BACKGROUND_PATH}
        alt=""
        aria-hidden="true"
      />
      <div className="vr2-veil" aria-hidden="true" />
    </>
  );
}
