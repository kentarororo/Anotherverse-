import { useAppStore } from './app/store';
import { CommandScreen } from './ui/screens/CommandScreen';
import { TitleScreen } from './ui/screens/TitleScreen';
import { CampaignCreationScreen } from './ui/screens/CampaignCreationScreen';
import { CorpusReviewScreen } from './ui/screens/CorpusReviewScreen';
import { MythicReviewScreen } from './ui/screens/MythicReviewScreen';

export function App() {
  const review = new URLSearchParams(globalThis.location.search).get('review');
  if (review === 'mythic-v2') return <MythicReviewScreen />;
  if (review === 'corpus') {
    return <CorpusReviewScreen />;
  }
  const screen = useAppStore((state) => state.appScreen);
  if (screen === 'creation') return <CampaignCreationScreen />;
  return screen === 'title' ? <TitleScreen /> : <CommandScreen />;
}
