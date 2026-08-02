import { useAppStore } from './app/store';
import { CommandScreen } from './ui/screens/CommandScreen';
import { TitleScreen } from './ui/screens/TitleScreen';

export function App() {
  const phase = useAppStore((state) => state.game.phase);
  return phase === 'title' ? <TitleScreen /> : <CommandScreen />;
}
