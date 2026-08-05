import MainWorldV3 from './features/main-v3/MainWorldV3';
import JourneyPrototypeRefined from './features/journey/JourneyPrototypeRefined';

const isLocalJourneyPreview = () => {
  if (typeof window === 'undefined') return false;
  const localHost = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
  return localHost && new URLSearchParams(window.location.search).get('preview') === 'journey';
};

export default function App() {
  if (isLocalJourneyPreview()) return <JourneyPrototypeRefined />;
  return <MainWorldV3 />;
}
