import React, { useState } from 'react';
import { View, Text, Input, Textarea, Picker, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import ChatBubble from '@/components/ChatBubble';
import { parseMatchInput, generateAISummary } from '@/utils/aiParser';
import { ParsedMatchInput, MatchType, CourtType, MatchResult, SetScore } from '@/types/match';
import { Player } from '@/types/player';
import { useMatchStore } from '@/store/useMatchStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import styles from './index.module.scss';

type InputMode = 'ai' | 'form';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  time: string;
}

const courtTypeMap: Record<string, string> = { hard: '硬地', clay: '红土', grass: '草地' };
const courtTypeOptions = ['硬地', '红土', '草地'];
const courtTypeKeys: CourtType[] = ['hard', 'clay', 'grass'];
const matchTypeMap: Record<string, string> = { singles: '单打', doubles: '双打' };
const matchTypeOptions = ['单打', '双打'];
const matchTypeKeys: MatchType[] = ['singles', 'doubles'];
const resultMap: Record<string, string> = { win: '胜利', lose: '失败' };
const resultOptions = ['胜利', '失败'];
const resultKeys: MatchResult[] = ['win', 'lose'];

const RecordPage: React.FC = () => {
  const [mode, setMode] = useState<InputMode>('form');

  const addMatch = useMatchStore((state) => state.addMatch);
  const findOrCreatePlayer = usePlayerStore((state) => state.findOrCreatePlayer);
  const updatePlayerAfterMatch = usePlayerStore((state) => state.updatePlayerAfterMatch);
  const recalculateRelationships = usePlayerStore((state) => state.recalculateRelationships);
  const getPlayerByName = usePlayerStore((state) => state.getPlayerByName);
  const players = usePlayerStore((state) => state.players);

  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      content: '嗨！告诉我你今天的比赛情况吧 🎾\n\n比如："和Kevin打了两个小时，6:3输了，发球状态很差"',
      isUser: false,
      time: ''
    }
  ]);
  const [parsedResult, setParsedResult] = useState<ParsedMatchInput | null>(null);

  const [formOpponent, setFormOpponent] = useState('');
  const [formPartner, setFormPartner] = useState('');
  const [formMatchType, setFormMatchType] = useState(0);
  const [formCourtType, setFormCourtType] = useState(0);
  const [formCourt, setFormCourt] = useState('');
  const [formResult, setFormResult] = useState(0);
  const [formScore1Mine, setFormScore1Mine] = useState('');
  const [formScore1Opp, setFormScore1Opp] = useState('');
  const [formScore2Mine, setFormScore2Mine] = useState('');
  const [formScore2Opp, setFormScore2Opp] = useState('');
  const [formScore3Mine, setFormScore3Mine] = useState('');
  const [formScore3Opp, setFormScore3Opp] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('');
  const [formIsGolden, setFormIsGolden] = useState(false);
  const [formNotes, setFormNotes] = useState('');

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const saveMatch = (opponentName: string, partnerName: string | undefined, matchType: MatchType, courtType: CourtType, court: string, result: MatchResult, scores: SetScore[], duration: number, notes: string, date?: string, time?: string) => {
    try {
      let opponentPlayer: Player | null = null;
      if (opponentName) {
        opponentPlayer = findOrCreatePlayer(opponentName);
      }

      let partnerPlayer: Player | null = null;
      if (partnerName && matchType === 'doubles') {
        partnerPlayer = findOrCreatePlayer(partnerName);
      }

      const eloChange = result === 'win' ? 12 : -8;

      const newMatch = {
        id: `m${Date.now()}`,
        date: date || new Date().toISOString().split('T')[0],
        time: time || getCurrentTime(),
        court: court || '未知',
        courtType,
        matchType,
        opponentId: opponentPlayer?.id || '',
        opponent: opponentPlayer?.name || opponentName || '未知',
        partnerId: partnerPlayer?.id,
        partner: partnerPlayer?.name,
        scores,
        result,
        duration,
        weather: 'sunny' as const,
        eloChange,
        notes,
        aiSummary: '',
        createdAt: new Date().toISOString()
      };

      const parsedForSummary: ParsedMatchInput = {
        opponent: opponentName,
        partner: partnerName,
        matchType,
        courtType,
        court,
        scores,
        result,
        duration,
        notes
      };
      newMatch.aiSummary = generateAISummary(parsedForSummary);

      addMatch(newMatch);

      if (opponentPlayer) {
        updatePlayerAfterMatch(opponentPlayer.id, result, eloChange);
      }
      if (partnerPlayer) {
        updatePlayerAfterMatch(partnerPlayer.id, result, eloChange > 0 ? 8 : -5);
      }

      recalculateRelationships();
      Taro.showToast({ title: '保存成功', icon: 'success' });
      return true;
    } catch (e) {
      console.error('[Record] save error:', e);
      Taro.showToast({ title: '保存失败，请重试', icon: 'none' });
      return false;
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      time: getCurrentTime()
    };

    const parsed = parseMatchInput(inputValue);
    setParsedResult(parsed);

    const aiContent = buildAIResponse(parsed);
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: aiContent,
      isUser: false,
      time: getCurrentTime()
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputValue('');
  };

  const buildAIResponse = (parsed: ParsedMatchInput): string => {
    const parts: string[] = ['我帮你解析了比赛信息：\n'];
    if (parsed.opponent) {
      const existing = getPlayerByName(parsed.opponent);
      parts.push(`🏸 对手：${parsed.opponent}${existing ? '（已有球友）' : '（新球友，将自动创建）'}`);
    } else {
      parts.push('🏸 对手：未识别（请补充对手姓名）');
    }
    if (parsed.partner) parts.push(`🤝 搭档：${parsed.partner}`);
    if (parsed.matchType) parts.push(`📋 类型：${matchTypeMap[parsed.matchType]}`);
    if (parsed.scores) parts.push(`📊 比分：${parsed.scores.map(s => `${s.mine}:${s.opponent}`).join(' ')}`);
    if (parsed.result) parts.push(`${parsed.result === 'win' ? '✅' : '❌'} 结果：${resultMap[parsed.result]}`);
    if (parsed.courtType) parts.push(`🏟️ 场地：${courtTypeMap[parsed.courtType]}`);
    if (parsed.court) parts.push(`📍 地点：${parsed.court}`);
    if (parsed.duration) parts.push(`⏱️ 时长：${Math.floor(parsed.duration / 60)}小时`);
    if (parsed.techIssue) parts.push(`⚠️ 问题：${parsed.techIssue}`);
    parts.push('\n保存后将自动更新球友档案 ✨');
    return parts.join('\n');
  };

  const handleAIConfirm = () => {
    if (!parsedResult) return;
    const scores = parsedResult.scores || [{ mine: 0, opponent: 0 }];
    const ok = saveMatch(
      parsedResult.opponent || '',
      parsedResult.partner,
      parsedResult.matchType || 'singles',
      parsedResult.courtType || 'hard',
      parsedResult.court || '',
      parsedResult.result || 'lose',
      scores,
      parsedResult.duration || 60,
      parsedResult.notes || ''
    );
    if (ok) {
      setParsedResult(null);
      const confirmMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        content: `✅ 比赛已保存！\n\n${generateAISummary(parsedResult)}`,
        isUser: false,
        time: getCurrentTime()
      };
      setMessages((prev) => [...prev, confirmMsg]);
    }
  };

  const handleFormSave = () => {
    const opponent = formOpponent.trim();
    if (!opponent) {
      Taro.showToast({ title: '请输入对手姓名', icon: 'none' });
      return;
    }

    const scores: SetScore[] = [];
    const s1m = parseInt(formScore1Mine), s1o = parseInt(formScore1Opp);
    const s2m = parseInt(formScore2Mine), s2o = parseInt(formScore2Opp);
    const s3m = parseInt(formScore3Mine), s3o = parseInt(formScore3Opp);

    if (!isNaN(s1m) && !isNaN(s1o)) scores.push({ mine: s1m, opponent: s1o });
    if (!isNaN(s2m) && !isNaN(s2o)) scores.push({ mine: s2m, opponent: s2o });
    if (!isNaN(s3m) && !isNaN(s3o)) scores.push({ mine: s3m, opponent: s3o });

    if (scores.length === 0) {
      Taro.showToast({ title: '请至少填写第一盘比分', icon: 'none' });
      return;
    }

    const matchType = matchTypeKeys[formMatchType];
    const courtType = courtTypeKeys[formCourtType];
    const result = resultKeys[formResult];
    const duration = parseInt(formDuration) || 60;
    const matchDate = formDate || undefined;
    const matchTime = formTime.trim() || undefined;

    const ok = saveMatch(
      opponent,
      matchType === 'doubles' ? formPartner.trim() : undefined,
      matchType,
      courtType,
      formCourt.trim(),
      result,
      scores,
      duration,
      formNotes.trim(),
      matchDate,
      matchTime
    );

    if (ok) {
      setFormOpponent('');
      setFormPartner('');
      setFormMatchType(0);
      setFormCourtType(0);
      setFormCourt('');
      setFormResult(0);
      setFormScore1Mine('');
      setFormScore1Opp('');
      setFormScore2Mine('');
      setFormScore2Opp('');
      setFormScore3Mine('');
      setFormScore3Opp('');
      setFormDuration('');
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormTime('');
      setFormIsGolden(false);
      setFormNotes('');
    }
  };

  const handleOpponentPick = (e) => {
    const idx = e.detail.value;
    if (idx < players.length) {
      setFormOpponent(players[idx].name);
    }
  };

  const handleLiveMatch = () => {
    Taro.navigateTo({ url: '/pages/live-match/index' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.modeTabs}>
        <Text
          className={mode === 'form' ? styles.modeTabActive : styles.modeTab}
          onClick={() => setMode('form')}
        >📋 填表录入</Text>
        <Text
          className={mode === 'ai' ? styles.modeTabActive : styles.modeTab}
          onClick={() => setMode('ai')}
        >🤖 AI录入</Text>
        <Text
          className={styles.modeTab}
          onClick={handleLiveMatch}
        >🎾 实时记分</Text>
      </View>

      {mode === 'ai' ? (
        <>
          <View className={styles.chatArea}>
            {messages.map((msg) => (
              <ChatBubble key={msg.id} content={msg.content} isUser={msg.isUser} time={msg.time} />
            ))}
            {parsedResult && (
              <View className={styles.parsedCard}>
                <Text className={styles.parsedTitle}>📋 解析结果</Text>
                {parsedResult.opponent && (
                  <View className={styles.parsedRow}>
                    <Text className={styles.parsedLabel}>对手</Text>
                    <Text className={styles.parsedValue}>{parsedResult.opponent}</Text>
                  </View>
                )}
                {parsedResult.scores && (
                  <View className={styles.parsedRow}>
                    <Text className={styles.parsedLabel}>比分</Text>
                    <Text className={styles.parsedValue}>
                      {parsedResult.scores.map(s => `${s.mine}:${s.opponent}`).join(' ')}
                    </Text>
                  </View>
                )}
                {parsedResult.result && (
                  <View className={styles.parsedRow}>
                    <Text className={styles.parsedLabel}>结果</Text>
                    <Text className={styles.parsedValue}>{resultMap[parsedResult.result]}</Text>
                  </View>
                )}
                <Button className={styles.confirmBtn} onClick={handleAIConfirm}>✓ 确认保存</Button>
              </View>
            )}
          </View>
          <View className={styles.inputArea}>
            <View className={styles.inputRow}>
              <Input
                className={styles.input}
                placeholder="说说你今天的比赛..."
                value={inputValue}
                onInput={(e) => setInputValue(e.detail.value)}
                onConfirm={handleSend}
                confirmType="send"
              />
              <View className={styles.sendBtn} onClick={handleSend}>
                <Text className={styles.sendText}>↑</Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        <View className={styles.formArea}>
          <View className={styles.formCard}>
            <Text className={styles.formTitle}>🏸 比赛信息</Text>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>对手 *</Text>
              <View className={styles.inputWithAction}>
                <Input className={styles.formInputFlex} value={formOpponent} onInput={(e) => setFormOpponent(e.detail.value)} placeholder="输入对手姓名" maxlength={20} />
                {players.length > 0 && (
                  <Picker mode="selector" range={players.map(p => p.name)} onChange={handleOpponentPick}>
                    <Text className={styles.pickBtn}>选择</Text>
                  </Picker>
                )}
              </View>
            </View>

            {matchTypeKeys[formMatchType] === 'doubles' && (
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>搭档</Text>
                <Input className={styles.formInput} value={formPartner} onInput={(e) => setFormPartner(e.detail.value)} placeholder="输入搭档姓名" maxlength={20} />
              </View>
            )}

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>类型</Text>
              <Picker mode="selector" range={matchTypeOptions} value={formMatchType} onChange={(e) => setFormMatchType(Number(e.detail.value))}>
                <View className={styles.pickerValue}>
                  <Text>{matchTypeOptions[formMatchType]}</Text>
                  <Text className={styles.pickerArrow}>›</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>场地类型</Text>
              <Picker mode="selector" range={courtTypeOptions} value={formCourtType} onChange={(e) => setFormCourtType(Number(e.detail.value))}>
                <View className={styles.pickerValue}>
                  <Text>{courtTypeOptions[formCourtType]}</Text>
                  <Text className={styles.pickerArrow}>›</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>场地名称</Text>
              <Input className={styles.formInput} value={formCourt} onInput={(e) => setFormCourt(e.detail.value)} placeholder="如 奥体中心" maxlength={30} />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>结果</Text>
              <Picker mode="selector" range={resultOptions} value={formResult} onChange={(e) => setFormResult(Number(e.detail.value))}>
                <View className={styles.pickerValue}>
                  <Text>{resultOptions[formResult]}</Text>
                  <Text className={styles.pickerArrow}>›</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>时长(分钟)</Text>
              <Input className={styles.formInput} value={formDuration} onInput={(e) => setFormDuration(e.detail.value)} placeholder="如 90" type="number" maxlength={4} />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>打球日期</Text>
              <Picker mode="date" value={formDate} onChange={(e) => setFormDate(e.detail.value)}>
                <View className={styles.pickerValue}>
                  <Text>{formDate}</Text>
                  <Text className={styles.pickerArrow}>›</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>打球时间</Text>
              <Input className={styles.formInput} value={formTime} onInput={(e) => setFormTime(e.detail.value)} placeholder="如 14:30（默认当前时间）" maxlength={5} />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>金球制（无占先）</Text>
              <View className={styles.toggleRow}>
                <Text
                  className={formIsGolden ? styles.toggleOff : styles.toggleOn}
                  onClick={() => setFormIsGolden(false)}
                >常规</Text>
                <Text
                  className={formIsGolden ? styles.toggleOn : styles.toggleOff}
                  onClick={() => setFormIsGolden(true)}
                >金球</Text>
              </View>
            </View>
          </View>

          <View className={styles.formCard}>
            <Text className={styles.formTitle}>📊 比分</Text>

            <View className={styles.scoreRow}>
              <Text className={styles.scoreLabel}>第一盘</Text>
              <Input className={styles.scoreInput} value={formScore1Mine} onInput={(e) => setFormScore1Mine(e.detail.value)} placeholder="我" type="number" maxlength={2} />
              <Text className={styles.scoreColon}>:</Text>
              <Input className={styles.scoreInput} value={formScore1Opp} onInput={(e) => setFormScore1Opp(e.detail.value)} placeholder="对手" type="number" maxlength={2} />
            </View>

            <View className={styles.scoreRow}>
              <Text className={styles.scoreLabel}>第二盘</Text>
              <Input className={styles.scoreInput} value={formScore2Mine} onInput={(e) => setFormScore2Mine(e.detail.value)} placeholder="我" type="number" maxlength={2} />
              <Text className={styles.scoreColon}>:</Text>
              <Input className={styles.scoreInput} value={formScore2Opp} onInput={(e) => setFormScore2Opp(e.detail.value)} placeholder="对手" type="number" maxlength={2} />
            </View>

            <View className={styles.scoreRow}>
              <Text className={styles.scoreLabel}>第三盘</Text>
              <Input className={styles.scoreInput} value={formScore3Mine} onInput={(e) => setFormScore3Mine(e.detail.value)} placeholder="我" type="number" maxlength={2} />
              <Text className={styles.scoreColon}>:</Text>
              <Input className={styles.scoreInput} value={formScore3Opp} onInput={(e) => setFormScore3Opp(e.detail.value)} placeholder="对手" type="number" maxlength={2} />
            </View>
          </View>

          <View className={styles.formCard}>
            <Text className={styles.formTitle}>📝 备注</Text>
            <Textarea className={styles.formTextarea} value={formNotes} onInput={(e) => setFormNotes(e.detail.value)} placeholder="记录比赛感受、技术问题等..." maxlength={200} />
          </View>

          <Button className={styles.formSaveBtn} onClick={handleFormSave}>保存比赛记录</Button>
        </View>
      )}
    </View>
  );
};

export default RecordPage;
