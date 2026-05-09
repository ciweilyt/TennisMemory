import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import MatchCard from '@/components/MatchCard';
import RatingBadge from '@/components/RatingBadge';
import { useMatchStore } from '@/store/useMatchStore';
import { mockEloInfo, mockAIInsights } from '@/data/stats';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const matches = useMatchStore((state) => state.matches);
  const recentMatches = useMatchStore((state) => state.getRecentMatches(5));
  const deleteMatch = useMatchStore((state) => state.deleteMatch);
  const latestInsight = mockAIInsights[0];

  const handleMatchClick = (match: { id: string }) => {
    Taro.navigateTo({ url: `/pages/match-detail/index?id=${match.id}` });
  };

  const handleDeleteMatch = (id: string) => {
    Taro.showModal({
      title: '删除比赛',
      content: '确定要删除这条比赛记录吗？删除后不可恢复。',
      confirmColor: '#F53F3F',
      confirmText: '删除',
      cancelText: '取消',
    }).then((res) => {
      if (res.confirm) {
        deleteMatch(id);
        Taro.showToast({ title: '已删除', icon: 'success' });
      }
    }).catch((err) => {
      console.error('[Home] delete match error:', err);
    });
  };

  const handleRecord = () => {
    Taro.switchTab({ url: '/pages/record/index' });
  };

  const handleLiveMatch = () => {
    Taro.navigateTo({ url: '/pages/live-match/index' });
  };

  const handleStats = () => {
    Taro.switchTab({ url: '/pages/stats/index' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.greeting}>🎾 网球日记</Text>
        <Text className={styles.subGreeting}>记录每一场比赛，见证你的成长</Text>
      </View>

      <View className={styles.ratingSection}>
        <RatingBadge
          level={mockEloInfo.level}
          levelName={mockEloInfo.levelName}
          elo={mockEloInfo.current}
          trend={mockEloInfo.trend}
        />
      </View>

      <View className={styles.quickActions}>
        <View className={classnames(styles.actionBtn, styles.actionPrimary)} onClick={handleRecord}>
          <Text className={styles.actionText}>📝 快速记录</Text>
        </View>
        <View className={classnames(styles.actionBtn, styles.actionLive)} onClick={handleLiveMatch}>
          <Text className={styles.actionText}>🎾 实时记分</Text>
        </View>
        <View className={classnames(styles.actionBtn, styles.actionSecondary)} onClick={handleStats}>
          <Text className={styles.actionTextSecondary}>📊 数据统计</Text>
        </View>
      </View>

      <View className={styles.insightCard}>
        <Text className={styles.insightTitle}>💡 AI 洞察</Text>
        <Text className={styles.insightDesc}>{latestInsight.description}</Text>
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>最近比赛</Text>
        <Text className={styles.sectionMore}>共 {matches.length} 场 · ← 左滑删除</Text>
      </View>

      <View className={styles.matchList}>
        {recentMatches.length > 0 ? (
          recentMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onClick={handleMatchClick}
              onDelete={handleDeleteMatch}
              showDelete
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🎾</Text>
            <Text className={styles.emptyText}>还没有比赛记录，快去记录吧</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default HomePage;
