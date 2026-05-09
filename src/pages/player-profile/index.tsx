import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { mockPlayers } from '@/data/players';
import { useMatchStore } from '@/store/useMatchStore';
import { formatScore } from '@/utils/statsCalculator';
import classnames from 'classnames';
import styles from './index.module.scss';

const PlayerProfilePage: React.FC = () => {
  const router = useRouter();
  const matches = useMatchStore((state) => state.matches);
  const player = mockPlayers.find((p) => p.id === router.params.id);

  if (!player) {
    return (
      <View className={styles.container}>
        <Text>球友不存在</Text>
      </View>
    );
  }

  const playerMatches = matches.filter(m => m.opponent === player.name);
  const wins = playerMatches.filter(m => m.result === 'win').length;
  const losses = playerMatches.filter(m => m.result === 'lose').length;

  return (
    <View className={styles.container}>
      <View className={styles.profileHeader}>
        <View className={styles.avatarWrap}>
          <Image className={styles.avatarImg} src={player.avatar} mode="aspectFill" />
        </View>
        <View className={styles.profileInfo}>
          <Text className={styles.playerName}>{player.name}</Text>
          <Text className={styles.playerElo}>Elo {player.elo}</Text>
          <Text className={styles.playerMeta}>
            {player.isLefty ? '左手选手' : '右手选手'} · 偏好{player.favoriteCourt}
          </Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>对战统计</Text>
      <View className={styles.statsCard}>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{playerMatches.length}</Text>
            <Text className={styles.statLabel}>对战次数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{wins}</Text>
            <Text className={styles.statLabel}>胜</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{losses}</Text>
            <Text className={styles.statLabel}>负</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>
              {playerMatches.length > 0 ? Math.round((wins / playerMatches.length) * 100) : 0}%
            </Text>
            <Text className={styles.statLabel}>胜率</Text>
          </View>
        </View>
      </View>

      <Text className={styles.sectionTitle}>标签</Text>
      <View className={styles.tagCard}>
        <Text className={styles.tag}>{player.isLefty ? '左手选手' : '右手选手'}</Text>
        <Text className={styles.tag}>{player.favoriteCourt}偏好</Text>
        <Text className={styles.tag}>
          {player.relationship === 'rival' ? '⚔️ 宿敌' :
           player.relationship === 'partner' ? '🤝 搭档' :
           player.relationship === 'frequent' ? '🎾 常打' : '👋 偶尔'}
        </Text>
        <Text className={styles.tag}>Elo {player.elo}</Text>
      </View>

      <Text className={styles.sectionTitle}>对战记录</Text>
      {playerMatches.length > 0 ? (
        playerMatches.map((match) => (
          <View className={styles.recordCard} key={match.id}>
            <View className={styles.recordHeader}>
              <Text className={styles.recordDate}>{match.date}</Text>
              <Text className={classnames(styles.recordResult, match.result === 'win' ? styles.recordWin : styles.recordLose)}>
                {match.result === 'win' ? '胜' : '负'}
              </Text>
            </View>
            <Text className={styles.recordScore}>{formatScore(match.scores)}</Text>
          </View>
        ))
      ) : (
        <View className={styles.statsCard}>
          <Text style={{ textAlign: 'center', color: '#86909C' }}>暂无对战记录</Text>
        </View>
      )}
    </View>
  );
};

export default PlayerProfilePage;
