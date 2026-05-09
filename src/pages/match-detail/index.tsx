import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useMatchStore } from '@/store/useMatchStore';
import { formatScore, formatDuration } from '@/utils/statsCalculator';
import classnames from 'classnames';
import styles from './index.module.scss';

const courtTypeMap: Record<string, string> = { hard: '硬地', clay: '红土', grass: '草地' };
const matchTypeMap: Record<string, string> = { singles: '单打', doubles: '双打' };
const weatherMap: Record<string, string> = { sunny: '晴天', cloudy: '多云', rainy: '雨天', windy: '大风', hot: '高温' };

const MatchDetailPage: React.FC = () => {
  const router = useRouter();
  const matches = useMatchStore((state) => state.matches);
  const match = matches.find((m) => m.id === router.params.id);

  if (!match) {
    return (
      <View className={styles.container}>
        <Text>比赛不存在</Text>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <View className={classnames(styles.resultBanner, match.result === 'win' ? styles.resultWin : styles.resultLose)}>
        <Text className={styles.resultEmoji}>{match.result === 'win' ? '🎉' : '💪'}</Text>
        <Text className={styles.resultText}>{match.result === 'win' ? '胜利' : '惜败'}</Text>
        <Text className={styles.resultScore}>{formatScore(match.scores)}</Text>
      </View>

      <View className={styles.detailCard}>
        <Text className={styles.detailTitle}>比赛信息</Text>
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>日期</Text>
          <Text className={styles.detailValue}>{match.date} {match.time}</Text>
        </View>
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>类型</Text>
          <Text className={styles.detailValue}>{matchTypeMap[match.matchType]}</Text>
        </View>
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>对手</Text>
          <Text className={styles.detailValue}>{match.opponent}</Text>
        </View>
        {match.partner && (
          <View className={styles.detailRow}>
            <Text className={styles.detailLabel}>搭档</Text>
            <Text className={styles.detailValue}>{match.partner}</Text>
          </View>
        )}
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>场地</Text>
          <Text className={styles.detailValue}>{match.court} · {courtTypeMap[match.courtType]}</Text>
        </View>
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>时长</Text>
          <Text className={styles.detailValue}>{formatDuration(match.duration)}</Text>
        </View>
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>天气</Text>
          <Text className={styles.detailValue}>{weatherMap[match.weather]}</Text>
        </View>
      </View>

      <View className={styles.aiSummaryCard}>
        <Text className={styles.aiSummaryTitle}>🧠 AI 赛后分析</Text>
        <Text className={styles.aiSummaryText}>{match.aiSummary}</Text>
      </View>

      <View className={styles.eloCard}>
        <Text className={styles.eloLabel}>Elo 变化</Text>
        <Text className={classnames(styles.eloChange, match.eloChange > 0 ? styles.eloUp : styles.eloDown)}>
          {match.eloChange > 0 ? '+' : ''}{match.eloChange}
        </Text>
      </View>

      {match.notes && (
        <View className={styles.detailCard}>
          <Text className={styles.detailTitle}>备注</Text>
          <Text className={styles.aiSummaryText}>{match.notes}</Text>
        </View>
      )}
    </View>
  );
};

export default MatchDetailPage;
