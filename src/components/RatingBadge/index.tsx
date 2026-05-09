import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface RatingBadgeProps {
  level: string;
  levelName: string;
  elo: number;
  trend: 'up' | 'down' | 'stable';
}

const RatingBadge: React.FC<RatingBadgeProps> = ({ level, levelName, elo, trend }) => {
  return (
    <View className={styles.badge}>
      <View className={styles.levelCircle}>
        <Text className={styles.levelText}>{level}</Text>
      </View>
      <View className={styles.info}>
        <Text className={styles.levelName}>{levelName}</Text>
        <View className={styles.eloRow}>
          <Text className={styles.elo}>{elo}</Text>
          {trend === 'up' && <Text className={styles.trendUp}>↑</Text>}
          {trend === 'down' && <Text className={styles.trendDown}>↓</Text>}
          {trend === 'stable' && <Text className={styles.trendStable}>→</Text>}
        </View>
      </View>
    </View>
  );
};

export default RatingBadge;
