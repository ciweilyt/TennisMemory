import React from 'react';
import { View, Text } from '@tarojs/components';
import StatCard from '@/components/StatCard';
import { mockOverallStats, mockCourtStats, mockMatchTypeStats, mockAIInsights, mockEloInfo } from '@/data/stats';
import classnames from 'classnames';
import styles from './index.module.scss';

const StatsPage: React.FC = () => {
  const eloProgress = Math.min(((mockEloInfo.current - 1000) / 800) * 100, 100);

  return (
    <View className={styles.container}>
      <View className={styles.eloSection}>
        <View className={styles.eloCard}>
          <View className={styles.eloHeader}>
            <Text className={styles.eloLabel}>Elo 等级分</Text>
            <Text className={styles.eloTrend}>
              {mockEloInfo.trend === 'up' ? '↑ 上升中' : mockEloInfo.trend === 'down' ? '↓ 下降中' : '→ 稳定'}
            </Text>
          </View>
          <Text className={styles.eloValue}>{mockEloInfo.current}</Text>
          <Text className={styles.eloLevel}>
            NTRP {mockEloInfo.level} · {mockEloInfo.levelName}
          </Text>
          <View className={styles.eloBar}>
            <View className={styles.eloBarFill} style={{ width: `${eloProgress}%` }} />
          </View>
        </View>
      </View>

      <Text className={styles.sectionTitle}>总体战绩</Text>
      <View className={styles.statsGrid}>
        <View className={styles.statsGridItem}>
          <StatCard label="总胜率" value={mockOverallStats.winRate} unit="%" trend="up" accent />
        </View>
        <View className={styles.statsGridItem}>
          <StatCard label="总场次" value={mockOverallStats.totalMatches} unit="场" />
        </View>
        <View className={styles.statsGridItem}>
          <StatCard label="近10场胜率" value={mockOverallStats.recentTenWinRate} unit="%" trend="up" />
        </View>
        <View className={styles.statsGridItem}>
          <StatCard
            label="连胜/连败"
            value={mockOverallStats.currentStreak}
            unit={mockOverallStats.streakType === 'win' ? '连胜' : '连败'}
            trend={mockOverallStats.streakType === 'win' ? 'up' : 'down'}
          />
        </View>
      </View>

      <Text className={styles.sectionTitle}>场地胜率</Text>
      <View className={styles.courtSection}>
        {mockCourtStats.map((cs) => {
          const barStyle = cs.courtType === '硬地' ? styles.courtBarHard
            : cs.courtType === '红土' ? styles.courtBarClay
            : styles.courtBarGrass;
          return (
            <View className={styles.courtCard} key={cs.courtType}>
              <View className={styles.courtRow}>
                <Text className={styles.courtName}>{cs.courtType} ({cs.totalMatches}场)</Text>
                <Text className={styles.courtWinRate}>{cs.winRate}%</Text>
              </View>
              <View className={styles.courtBar}>
                <View className={classnames(styles.courtBarFill, barStyle)} style={{ width: `${cs.winRate}%` }} />
              </View>
            </View>
          );
        })}
      </View>

      <Text className={styles.sectionTitle}>单打 vs 双打</Text>
      <View className={styles.typeSection}>
        <View className={styles.typeCard}>
          <View className={styles.typeItem}>
            <Text className={styles.typeLabel}>单打胜率</Text>
            <Text className={styles.typeValue}>{mockMatchTypeStats.singlesWinRate}%</Text>
            <Text className={styles.typeSub}>{mockMatchTypeStats.singlesTotal}场</Text>
          </View>
          <View className={styles.typeItem}>
            <Text className={styles.typeLabel}>双打胜率</Text>
            <Text className={styles.typeValue}>{mockMatchTypeStats.doublesWinRate}%</Text>
            <Text className={styles.typeSub}>{mockMatchTypeStats.doublesTotal}场</Text>
          </View>
        </View>
      </View>

      <Text className={styles.sectionTitle}>🧠 AI 趋势分析</Text>
      <View className={styles.insightSection}>
        {mockAIInsights.map((insight) => {
          const cardStyle = insight.type === 'warning' ? styles.insightWarning
            : insight.type === 'trend' ? styles.insightTrend
            : insight.type === 'praise' ? styles.insightPraise
            : styles.insightSuggestion;
          return (
            <View className={classnames(styles.insightCard, cardStyle)} key={insight.id}>
              <Text className={styles.insightTitle}>{insight.title}</Text>
              <Text className={styles.insightDesc}>{insight.description}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default StatsPage;
