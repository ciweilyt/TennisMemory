import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useMatchStore } from '@/store/useMatchStore';
import { GENDER_MAP, PLAY_STYLE_MAP } from '@/types/player';
import { formatScore } from '@/utils/statsCalculator';
import classnames from 'classnames';
import styles from './index.module.scss';

const PlayerProfilePage: React.FC = () => {
  const router = useRouter();
  const player = usePlayerStore((state) => state.getPlayerById(router.params.id || ''));
  const matches = useMatchStore((state) => state.matches);

  if (!player) {
    return (
      <View className={styles.container}>
        <Text>球友不存在</Text>
      </View>
    );
  }

  const playerMatches = matches.filter(m => m.opponentId === player.id);
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
            {GENDER_MAP[player.gender]} · {player.isLefty ? '左手' : '右手'} · NTRP {player.ntrpLevel}
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

      <Text className={styles.sectionTitle}>球友档案</Text>
      <View className={styles.tagCard}>
        <Text className={styles.tag}>{GENDER_MAP[player.gender]}</Text>
        <Text className={styles.tag}>{player.isLefty ? '左手选手' : '右手选手'}</Text>
        <Text className={styles.tag}>NTRP {player.ntrpLevel}</Text>
        <Text className={styles.tag}>{PLAY_STYLE_MAP[player.playStyle]}</Text>
        <Text className={styles.tag}>{player.favoriteCourt}偏好</Text>
        <Text className={styles.tag}>Elo {player.elo}</Text>
      </View>

      {player.notes && (
        <>
          <Text className={styles.sectionTitle}>备注</Text>
          <View className={styles.statsCard}>
            <Text style={{ color: '#4E5969', fontSize: '28rpx', lineHeight: '1.6' }}>{player.notes}</Text>
          </View>
        </>
      )}

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
