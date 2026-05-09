import React from 'react';
import { useMatchStore } from '@/store/useMatchStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useUserStore } from '@/store/useUserStore';
import './app.scss';

function App(props) {
  const loadMatches = useMatchStore((s) => s.loadMatches);
  const loadPlayers = usePlayerStore((s) => s.loadPlayers);
  const loadProfile = useUserStore((s) => s.loadProfile);

  React.useEffect(() => {
    loadMatches();
    loadPlayers();
    loadProfile();
  }, []);

  return props.children;
}

export default App;
