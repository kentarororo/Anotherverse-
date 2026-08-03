import { useAppStore } from './app/store';
import { CommandScreen } from './ui/screens/CommandScreen';
import { TitleScreen } from './ui/screens/TitleScreen';
import { CampaignCreationScreen } from './ui/screens/CampaignCreationScreen';
import { CorpusReviewScreen } from './ui/screens/CorpusReviewScreen';

export function App() {
  if (new URLSearchParams(globalThis.location.search).get('review') === 'corpus') {
    return <CorpusReviewScreen />;
  }
  const screen = useAppStore((state) => state.appScreen);
  if (screen === 'creation') return <CampaignCreationScreen />;
  return screen === 'title' ? <TitleScreen /> : <CommandScreen />;
}
