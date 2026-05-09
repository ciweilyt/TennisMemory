import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';

interface PlayerAvatarProps {
  name: string;
  avatar?: string;
  elo?: number;
  size?: 'small' | 'medium' | 'large';
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ name, avatar, elo, size = 'medium' }) => {
  return (
    <View className={styles.container}>
      {avatar ? (
        <Image className={styles[`${size}Avatar`]} src={avatar} mode="aspectFill" />
      ) : (
        <View className={styles[`${size}Avatar`]}>
          <Text className={styles[`${size}Initial`]}>{name.charAt(0)}</Text>
        </View>
      )}
      <Text className={styles[`${size}Name`]}>{name}</Text>
      {elo !== undefined && <Text className={styles.elo}>{elo}</Text>}
    </View>
  );
};

export default PlayerAvatar;
