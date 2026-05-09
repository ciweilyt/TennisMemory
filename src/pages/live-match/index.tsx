import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Input, Textarea, Picker, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { MatchType, CourtType, MatchResult, SetScore } from '@/types/match';
import { useMatchStore } from '@/store/useMatchStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { generateAISummary } from '@/utils/aiParser';
import styles from './index.module.scss';

type Phase = 'setup' | 'playing' | 'ended';

interface PointState {
  mine: number;
  opponent: number;
}

interface GameState {
  mine: number;
  opponent: number;
}

interface SetState {
  mine: number;
  opponent: number;
}

interface HistoryEntry {
  point: PointState;
  game: GameState;
  sets: SetState[];
  isTiebreak: boolean;
  isDeuce: boolean;
  advantage: 'mine' | 'opponent' | null;
}

const POINT_DISPLAY = ['0', '15', '30', '40'];
const courtTypeOptions = ['硬地', '红土', '草地'];
const courtTypeKeys: CourtType[] = ['hard', 'clay', 'grass'];
const matchTypeOptions = ['单打', '双打'];
const matchTypeKeys: MatchType[] = ['singles', 'doubles'];

const LiveMatchPage: React.FC = () => {
  const addMatch = useMatchStore((state) => state.addMatch);
  const findOrCreatePlayer = usePlayerStore((state) => state.findOrCreatePlayer);
  const updatePlayerAfterMatch = usePlayerStore((state) => state.updatePlayerAfterMatch);
  const recalculateRelationships = usePlayerStore((state) => state.recalculateRelationships);
  const players = usePlayerStore((state) => state.players);

  const [phase, setPhase] = useState<Phase>('setup');

  const [setupOpponent, setSetupOpponent] = useState('');
  const [setupPartner, setSetupPartner] = useState('');
  const [setupMatchType, setSetupMatchType] = useState(0);
  const [setupCourtType, setSetupCourtType] = useState(0);
  const [setupCourt, setSetupCourt] = useState('');

  const [point, setPoint] = useState<PointState>({ mine: 0, opponent: 0 });
  const [game, setGame] = useState<GameState>({ mine: 0, opponent: 0 });
  const [sets, setSets] = useState<SetState[]>([{ mine: 0, opponent: 0 }]);
  const [isTiebreak, setIsTiebreak] = useState(false);
  const [isDeuce, setIsDeuce] = useState(false);
  const [advantage, setAdvantage] = useState<'mine' | 'opponent' | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedMin, setElapsedMin] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [endNotes, setEndNotes] = useState('');

  const currentSetIdx = sets.length - 1;
  const setsWonMine = sets.filter(s => s.mine > s.opponent).length;
  const setsWonOpp = sets.filter(s => s.opponent > s.mine).length;
  const matchEnded = setsWonMine >= 2 || setsWonOpp >= 2;

  const getMidEndResult = (): MatchResult => {
    if (setsWonMine > setsWonOpp) return 'win';
    if (setsWonOpp > setsWonMine) return 'lose';
    const currentSet = sets[currentSetIdx];
    if (currentSet.mine > currentSet.opponent) return 'win';
    if (currentSet.opponent > currentSet.mine) return 'lose';
    if (game.mine > game.opponent) return 'win';
    if (game.opponent > game.mine) return 'lose';
    return 'lose';
  };

  const matchResult: MatchResult = matchEnded
    ? (setsWonMine > setsWonOpp ? 'win' : 'lose')
    : getMidEndResult();

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const pushHistory = useCallback(() => {
    setHistory(prev => [...prev, {
      point: { ...point },
      game: { ...game },
      sets: sets.map(s => ({ ...s })),
      isTiebreak,
      isDeuce,
      advantage
    }]);
  }, [point, game, sets, isTiebreak, isDeuce, advantage]);

  const startTimer = () => {
    const now = Date.now();
    setStartTime(now);
    timerRef.current = setInterval(() => {
      setElapsedMin(Math.floor((Date.now() - now) / 60000));
    }, 10000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStart = () => {
    if (!setupOpponent.trim()) {
      Taro.showToast({ title: '请输入对手姓名', icon: 'none' });
      return;
    }
    setPhase('playing');
    startTimer();
  };

  const handleOpponentPick = (e) => {
    const idx = e.detail.value;
    if (idx < players.length) {
      setSetupOpponent(players[idx].name);
    }
  };

  const handlePoint = (side: 'mine' | 'opponent') => {
    if (matchEnded) return;
    pushHistory();

    if (isTiebreak) {
      handleTiebreakPoint(side);
      return;
    }

    const newPoint = { ...point };
    newPoint[side] += 1;

    if (newPoint.mine >= 3 && newPoint.opponent >= 3) {
      if (newPoint.mine === newPoint.opponent) {
        setPoint(newPoint);
        setIsDeuce(true);
        setAdvantage(null);
        return;
      }
      if (advantage === null) {
        setPoint(newPoint);
        setIsDeuce(false);
        setAdvantage(side);
        return;
      }
      if (advantage === side) {
        winGame(side);
        return;
      }
      setPoint({ mine: 3, opponent: 3 });
      setIsDeuce(true);
      setAdvantage(null);
      return;
    }

    if (newPoint[side] >= 4) {
      winGame(side);
      return;
    }

    setPoint(newPoint);
    setIsDeuce(false);
    setAdvantage(null);
  };

  const handleTiebreakPoint = (side: 'mine' | 'opponent') => {
    const newPoint = { ...point };
    newPoint[side] += 1;

    const diff = Math.abs(newPoint.mine - newPoint.opponent);
    if (newPoint[side] >= 7 && diff >= 2) {
      winGame(side);
      return;
    }

    setPoint(newPoint);
  };

  const winGame = (side: 'mine' | 'opponent') => {
    const newGame = { ...game };
    newGame[side] += 1;

    const diff = Math.abs(newGame.mine - newGame.opponent);
    if (newGame[side] >= 6 && diff >= 2) {
      winSet(side);
      return;
    }

    if (newGame.mine === 6 && newGame.opponent === 6) {
      setIsTiebreak(true);
      setPoint({ mine: 0, opponent: 0 });
      setGame(newGame);
      setIsDeuce(false);
      setAdvantage(null);
      return;
    }

    setPoint({ mine: 0, opponent: 0 });
    setGame(newGame);
    setIsDeuce(false);
    setAdvantage(null);
  };

  const winSet = (side: 'mine' | 'opponent') => {
    const newSets = sets.map(s => ({ ...s }));
    newSets[currentSetIdx][side] += 1;

    const wonMine = newSets.filter(s => s.mine > s.opponent).length;
    const wonOpp = newSets.filter(s => s.opponent > s.mine).length;

    if (wonMine >= 2 || wonOpp >= 2) {
      setSets(newSets);
      setPoint({ mine: 0, opponent: 0 });
      setGame({ mine: 0, opponent: 0 });
      setIsTiebreak(false);
      setIsDeuce(false);
      setAdvantage(null);
      stopTimer();
      setElapsedMin(Math.floor((Date.now() - startTime) / 60000));
      setPhase('ended');
      return;
    }

    newSets.push({ mine: 0, opponent: 0 });
    setSets(newSets);
    setPoint({ mine: 0, opponent: 0 });
    setGame({ mine: 0, opponent: 0 });
    setIsTiebreak(false);
    setIsDeuce(false);
    setAdvantage(null);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setPoint(last.point);
    setGame(last.game);
    setSets(last.sets);
    setIsTiebreak(last.isTiebreak);
    setIsDeuce(last.isDeuce);
    setAdvantage(last.advantage);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleEndMatch = () => {
    Taro.showModal({
      title: '结束比赛',
      content: '确定要提前结束比赛吗？将按当前比分记录。',
      confirmColor: '#1A6B4C',
    }).then(res => {
      if (res.confirm) {
        stopTimer();
        setElapsedMin(Math.floor((Date.now() - startTime) / 60000));
        setPhase('ended');
      }
    }).catch(() => {});
  };

  const handleSave = () => {
    try {
      const opponentName = setupOpponent.trim();
      const partnerName = matchTypeKeys[setupMatchType] === 'doubles' ? setupPartner.trim() : undefined;
      const opponentPlayer = findOrCreatePlayer(opponentName);
      const partnerPlayer = partnerName ? findOrCreatePlayer(partnerName) : null;

      const finalSets = sets.filter(s => s.mine > 0 || s.opponent > 0);
      const scores: SetScore[] = finalSets.map(s => ({
        mine: s.mine,
        opponent: s.opponent,
        tiebreak: isTiebreak && finalSets.indexOf(s) === finalSets.length - 1
          ? Math.max(point.mine, point.opponent)
          : undefined
      }));

      const result = matchResult;
      const eloChange = result === 'win' ? 12 : -8;
      const duration = Math.max(elapsedMin, 1);

      const newMatch = {
        id: `m${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        time: getCurrentTime(),
        court: setupCourt.trim() || '未知',
        courtType: courtTypeKeys[setupCourtType],
        matchType: matchTypeKeys[setupMatchType],
        opponentId: opponentPlayer?.id || '',
        opponent: opponentPlayer?.name || opponentName,
        partnerId: partnerPlayer?.id,
        partner: partnerPlayer?.name,
        scores,
        result,
        duration,
        weather: 'sunny' as const,
        eloChange,
        notes: endNotes.trim(),
        aiSummary: '',
        createdAt: new Date().toISOString()
      };

      newMatch.aiSummary = generateAISummary({
        opponent: opponentName,
        partner: partnerName,
        matchType: matchTypeKeys[setupMatchType],
        courtType: courtTypeKeys[setupCourtType],
        court: setupCourt.trim(),
        scores,
        result,
        duration,
        notes: endNotes.trim()
      });

      addMatch(newMatch);

      if (opponentPlayer) {
        updatePlayerAfterMatch(opponentPlayer.id, result, eloChange);
      }
      if (partnerPlayer) {
        updatePlayerAfterMatch(partnerPlayer.id, result, eloChange > 0 ? 8 : -5);
      }

      recalculateRelationships();
      Taro.showToast({ title: '比赛已保存', icon: 'success' });

      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' });
      }, 1500);
    } catch (e) {
      console.error('[LiveMatch] save error:', e);
      Taro.showToast({ title: '保存失败，请重试', icon: 'none' });
    }
  };

  const getPointDisplay = (val: number, side: 'mine' | 'opponent') => {
    if (isTiebreak) return val.toString();
    if (isDeuce) return '40';
    if (advantage === side) return 'AD';
    if (advantage !== null && advantage !== side) return '40';
    return POINT_DISPLAY[val] || '0';
  };

  const renderSetup = () => (
    <View className={styles.setupArea}>
      <View className={styles.setupCard}>
        <Text className={styles.setupTitle}>🏸 比赛设置</Text>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>对手 *</Text>
          <View className={styles.inputWithAction}>
            <Input className={styles.formInput} value={setupOpponent} onInput={(e) => setSetupOpponent(e.detail.value)} placeholder="输入对手姓名" maxlength={20} />
            {players.length > 0 && (
              <Picker mode="selector" range={players.map(p => p.name)} onChange={handleOpponentPick}>
                <Text className={styles.pickBtn}>选择</Text>
              </Picker>
            )}
          </View>
        </View>

        {matchTypeKeys[setupMatchType] === 'doubles' && (
          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>搭档</Text>
            <Input className={styles.formInput} value={setupPartner} onInput={(e) => setSetupPartner(e.detail.value)} placeholder="输入搭档姓名" maxlength={20} />
          </View>
        )}

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>类型</Text>
          <Picker mode="selector" range={matchTypeOptions} value={setupMatchType} onChange={(e) => setSetupMatchType(Number(e.detail.value))}>
            <View className={styles.pickerValue}>
              <Text>{matchTypeOptions[setupMatchType]}</Text>
              <Text className={styles.pickerArrow}>›</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>场地类型</Text>
          <Picker mode="selector" range={courtTypeOptions} value={setupCourtType} onChange={(e) => setSetupCourtType(Number(e.detail.value))}>
            <View className={styles.pickerValue}>
              <Text>{courtTypeOptions[setupCourtType]}</Text>
              <Text className={styles.pickerArrow}>›</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>场地名称</Text>
          <Input className={styles.formInput} value={setupCourt} onInput={(e) => setSetupCourt(e.detail.value)} placeholder="如 奥体中心" maxlength={30} />
        </View>
      </View>

      <Button className={styles.startBtn} onClick={handleStart}>🎾 开始比赛</Button>
    </View>
  );

  const renderPlaying = () => (
    <View className={styles.playArea}>
      <View className={styles.matchInfo}>
        <Text className={styles.matchInfoText}>
          {matchTypeOptions[setupMatchType]} · {courtTypeOptions[setupCourtType]}
          {setupCourt ? ` · ${setupCourt}` : ''}
        </Text>
        <Text className={styles.matchInfoText}>vs {setupOpponent}</Text>
      </View>

      <View className={styles.scoreBoard}>
        <View className={styles.setsRow}>
          <View className={styles.setsLabel} />
          {sets.map((s, i) => (
            <Text key={i} className={styles.setNum}>S{i + 1}</Text>
          ))}
        </View>
        <View className={styles.setsRow}>
          <Text className={styles.setsLabelMe}>我</Text>
          {sets.map((s, i) => (
            <Text key={i} className={i === currentSetIdx ? styles.setScoreActive : styles.setScore}>
              {s.mine}:{s.opponent}
            </Text>
          ))}
        </View>
        <View className={styles.setsRow}>
          <Text className={styles.setsLabelOpp}>{setupOpponent}</Text>
          {sets.map((s, i) => (
            <Text key={i} className={i === currentSetIdx ? styles.setScoreActive : styles.setScore}>
              {s.opponent}:{s.mine}
            </Text>
          ))}
        </View>
      </View>

      <View className={styles.currentGame}>
        <Text className={styles.gameLabel}>
          {isTiebreak ? '抢七' : `第${currentSetIdx + 1}盘 · 第${game.mine + game.opponent + 1}局`}
        </Text>
        <View className={styles.gameScore}>
          <Text className={styles.gameScoreNum}>{game.mine}</Text>
          <Text className={styles.gameScoreDash}>-</Text>
          <Text className={styles.gameScoreNum}>{game.opponent}</Text>
        </View>
      </View>

      <View className={styles.pointBoard}>
        <Text className={styles.pointLabel}>
          {isDeuce ? 'DEUCE' : advantage ? 'ADVANTAGE' : '当前分数'}
        </Text>
        <View className={styles.pointDisplay}>
          <Text className={styles.pointNum}>{getPointDisplay(point.mine, 'mine')}</Text>
          <Text className={styles.pointDash}>:</Text>
          <Text className={styles.pointNum}>{getPointDisplay(point.opponent, 'opponent')}</Text>
        </View>
      </View>

      <View className={styles.scoreButtons}>
        <View className={styles.scoreBtnMine} onClick={() => handlePoint('mine')}>
          <Text className={styles.scoreBtnText}>我得分</Text>
        </View>
        <View className={styles.scoreBtnOpp} onClick={() => handlePoint('opponent')}>
          <Text className={styles.scoreBtnText}>对手得分</Text>
        </View>
      </View>

      <View className={styles.actionRow}>
        <Button className={styles.undoBtn} onClick={handleUndo} disabled={history.length === 0}>
          ↩ 撤销
        </Button>
        <Button className={styles.endBtn} onClick={handleEndMatch}>
          结束比赛
        </Button>
      </View>

      <View className={styles.timerRow}>
        <Text className={styles.timerText}>⏱ {elapsedMin} 分钟</Text>
      </View>
    </View>
  );

  const renderEnded = () => (
    <View className={styles.endArea}>
      <View className={styles.resultCard}>
        <Text className={styles.resultEmoji}>{matchResult === 'win' ? '🏆' : '💪'}</Text>
        <Text className={styles.resultText}>{matchResult === 'win' ? '胜利' : '惜败'}</Text>
        <Text className={styles.resultScore}>
          {sets.filter(s => s.mine > 0 || s.opponent > 0).map(s => `${s.mine}-${s.opponent}`).join('  ')}
        </Text>
      </View>

      <View className={styles.detailCard}>
        <Text className={styles.detailTitle}>📊 比赛详情</Text>
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>对手</Text>
          <Text className={styles.detailValue}>{setupOpponent}</Text>
        </View>
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>类型</Text>
          <Text className={styles.detailValue}>{matchTypeOptions[setupMatchType]}</Text>
        </View>
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>场地</Text>
          <Text className={styles.detailValue}>{courtTypeOptions[setupCourtType]}{setupCourt ? ` · ${setupCourt}` : ''}</Text>
        </View>
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>时长</Text>
          <Text className={styles.detailValue}>{elapsedMin} 分钟</Text>
        </View>
      </View>

      <View className={styles.notesCard}>
        <Text className={styles.detailTitle}>📝 备注</Text>
        <Textarea
          className={styles.notesInput}
          value={endNotes}
          onInput={(e) => setEndNotes(e.detail.value)}
          placeholder="记录比赛感受..."
          maxlength={200}
        />
      </View>

      <Button className={styles.saveBtn} onClick={handleSave}>保存到日记</Button>
    </View>
  );

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>🎾 实时记分</Text>
      </View>
      {phase === 'setup' && renderSetup()}
      {phase === 'playing' && renderPlaying()}
      {phase === 'ended' && renderEnded()}
    </View>
  );
};

export default LiveMatchPage;
