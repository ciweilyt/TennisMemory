import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import ChatBubble from '@/components/ChatBubble';
import { parseMatchInput, generateAISummary } from '@/utils/aiParser';
import { ParsedMatchInput } from '@/types/match';
import { useMatchStore } from '@/store/useMatchStore';
import styles from './index.module.scss';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  time: string;
}

const courtTypeMap: Record<string, string> = { hard: '硬地', clay: '红土', grass: '草地' };
const matchTypeMap: Record<string, string> = { singles: '单打', doubles: '双打' };
const resultMap: Record<string, string> = { win: '胜利', lose: '失败' };

const RecordPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      content: '嗨！告诉我你今天的比赛情况吧 🎾\n\n比如："昨晚和Kevin在基地打了两个小时，6:3输了，发球状态很差"',
      isUser: false,
      time: ''
    }
  ]);
  const [parsedResult, setParsedResult] = useState<ParsedMatchInput | null>(null);
  const addMatch = useMatchStore((state) => state.addMatch);

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
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
    if (parsed.opponent) parts.push(`🏸 对手：${parsed.opponent}`);
    if (parsed.partner) parts.push(`🤝 搭档：${parsed.partner}`);
    if (parsed.matchType) parts.push(`📋 类型：${matchTypeMap[parsed.matchType]}`);
    if (parsed.scores) parts.push(`📊 比分：${parsed.scores.map(s => `${s.mine}:${s.opponent}`).join(' ')}`);
    if (parsed.result) parts.push(`${parsed.result === 'win' ? '✅' : '❌'} 结果：${resultMap[parsed.result]}`);
    if (parsed.courtType) parts.push(`🏟️ 场地：${courtTypeMap[parsed.courtType]}`);
    if (parsed.court) parts.push(`📍 地点：${parsed.court}`);
    if (parsed.duration) parts.push(`⏱️ 时长：${Math.floor(parsed.duration / 60)}小时`);
    if (parsed.mood) parts.push(`😊 状态：${parsed.mood === 'good' ? '良好' : parsed.mood === 'bad' ? '不佳' : '一般'}`);
    if (parsed.techIssue) parts.push(`⚠️ 问题：${parsed.techIssue}`);
    parts.push('\n确认无误后点击保存，或继续补充信息~');
    return parts.join('\n');
  };

  const handleConfirm = () => {
    if (!parsedResult) return;

    const newMatch = {
      id: `m${Date.now()}`,
      date: parsedResult.date || new Date().toISOString().split('T')[0],
      time: getCurrentTime(),
      court: parsedResult.court || '未知',
      courtType: parsedResult.courtType || 'hard' as const,
      matchType: parsedResult.matchType || 'singles' as const,
      opponent: parsedResult.opponent || '未知',
      partner: parsedResult.partner,
      scores: parsedResult.scores || [{ mine: 0, opponent: 0 }],
      result: parsedResult.result || 'lose' as const,
      duration: parsedResult.duration || 60,
      weather: 'sunny' as const,
      eloChange: parsedResult.result === 'win' ? 10 : -8,
      notes: parsedResult.notes || '',
      aiSummary: generateAISummary(parsedResult),
      createdAt: new Date().toISOString()
    };

    addMatch(newMatch);
    setParsedResult(null);

    const confirmMsg: ChatMessage = {
      id: (Date.now() + 2).toString(),
      content: '✅ 比赛已保存！\n\n' + newMatch.aiSummary,
      isUser: false,
      time: getCurrentTime()
    };
    setMessages((prev) => [...prev, confirmMsg]);

    Taro.showToast({ title: '保存成功', icon: 'success' });
  };

  return (
    <View className={styles.container}>
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
            {parsedResult.partner && (
              <View className={styles.parsedRow}>
                <Text className={styles.parsedLabel}>搭档</Text>
                <Text className={styles.parsedValue}>{parsedResult.partner}</Text>
              </View>
            )}
            {parsedResult.matchType && (
              <View className={styles.parsedRow}>
                <Text className={styles.parsedLabel}>类型</Text>
                <Text className={styles.parsedValue}>{matchTypeMap[parsedResult.matchType]}</Text>
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
            {parsedResult.courtType && (
              <View className={styles.parsedRow}>
                <Text className={styles.parsedLabel}>场地</Text>
                <Text className={styles.parsedValue}>{courtTypeMap[parsedResult.courtType]}</Text>
              </View>
            )}
            <View className={styles.confirmBtn} onClick={handleConfirm}>
              <Text className={styles.confirmText}>✓ 确认保存</Text>
            </View>
          </View>
        )}
      </View>

      <View className={styles.inputArea}>
        <View className={styles.inputRow}>
          <View className={styles.voiceBtn}>
            <Text className={styles.voiceText}>🎤</Text>
          </View>
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
    </View>
  );
};

export default RecordPage;
