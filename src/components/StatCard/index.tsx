import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  accent?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, trend, accent }) => {
  return (
    <View className={styles.card}>
      <Text className={styles.label}>{label}</Text>
      <View className={styles.valueRow}>
        <Text className={styles.value}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
        {trend === 'up' && <Text className={styles.trendUp}>↑</Text>}
        {trend === 'down' && <Text className={styles.trendDown}>↓</Text>}
      </View>
      {accent && <View className={styles.accentBar} />}
    </View>
  );
};

export default StatCard;
