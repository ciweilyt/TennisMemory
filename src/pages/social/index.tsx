import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import PlayerAvatar from '@/components/PlayerAvatar';
import { mockPlayers } from '@/data/players';
import { useMatchStore } from '@/store/useMatchStore';
import styles from './index.module.scss';

const SocialPage: React.FC = () => {
  const matches = useMatchStore((state) => state.matches);

  const rivals = mockPlayers.filter(p => p.relationship === 'rival');
  const partners = mockPlayers.filter(p => p.relationship === 'partner');
  const frequentPlayers = mockPlayers.filter(p => p.relationship === 'frequent');

  const getPlayerRecord = (playerName: string) => {
    const playerMatches = matches.filter(m => m.opponent === playerName);
    const wins = playerMatches.filter(m => m.result === 'win').length;
    const losses = playerMatches.filter(m => m.result === 'lose').length;
    return { wins, losses };
  };

  const sortedByElo = [...mockPlayers].sort((a, b) => b.elo - a.elo);

  return (
    <View className={styles.container}>
      <Text className={styles.sectionTitle}>🎾 常打球友</Text>
      <ScrollView scrollX className={styles.playerScroll}>
        <View className={styles.playerScrollInner}>
          {mockPlayers.map((player) => (
            <View key={player.id} onClick={() => Taro.navigateTo({ url: `/pages/player-profile/index?id=${player.id}` })}>
              <PlayerAvatar
                name={player.name}
                avatar={player.avatar}
                elo={player.elo}
                size="medium"
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <Text className={styles.sectionTitle}>⚔️ 宿敌</Text>
      <Text className={styles.sectionSub}>和你势均力敌的对手</Text>
      <View className={styles.rivalSection}>
        {rivals.map((rival, index) => {
          const record = getPlayerRecord(rival.name);
          return (
            <View className={styles.rivalCard} key={rival.id}
              onClick={() => Taro.navigateTo({ url: `/pages/player-profile/index?id=${rival.id}` })}>
              <View className={`${styles.rivalRank} ${index === 0 ? styles.rivalRankFirst : ''}`}>
                <Text className={`${styles.rivalRankText} ${index === 0 ? styles.rivalRankFirstText : ''}`}>
                  {index + 1}
                </Text>
              </View>
              <View className={styles.rivalInfo}>
                <Text className={styles.rivalName}>{rival.name} {rival.isLefty ? '🤚左' : ''}</Text>
                <Text className={styles.rivalMeta}>Elo {rival.elo} · {rival.favoriteCourt}</Text>
              </View>
              <View className={styles.rivalRecord}>
                <Text className={styles.rivalWin}>{record.wins}</Text>
                <Text className={styles.rivalDash}>:</Text>
                <Text className={styles.rivalLose}>{record.losses}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text className={styles.sectionTitle}>🤝 最佳搭档</Text>
      <View className={styles.partnerSection}>
        {partners.map((partner) => {
          const record = getPlayerRecord(partner.name);
          return (
            <View className={styles.partnerCard} key={partner.id}
              onClick={() => Taro.navigateTo({ url: `/pages/player-profile/index?id=${partner.id}` })}>
              <View className={styles.partnerHeader}>
                <Text className={styles.partnerName}>{partner.name}</Text>
                <Text className={styles.partnerTag}>双打搭档</Text>
              </View>
              <View className={styles.partnerStats}>
                <View className={styles.partnerStatItem}>
                  <Text className={styles.partnerStatLabel}>搭档场次</Text>
                  <Text className={styles.partnerStatValue}>{partner.totalMatches}</Text>
                </View>
                <View className={styles.partnerStatItem}>
                  <Text className={styles.partnerStatLabel}>搭档胜率</Text>
                  <Text className={styles.partnerStatValue}>{partner.winRate}%</Text>
                </View>
                <View className={styles.partnerStatItem}>
                  <Text className={styles.partnerStatLabel}>对战记录</Text>
                  <Text className={styles.partnerStatValue}>{record.wins}胜{record.losses}负</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <Text className={styles.sectionTitle}>🏆 Elo 排行</Text>
      <View className={styles.rankSection}>
        <View className={styles.rankCard}>
          {sortedByElo.map((player, index) => (
            <View className={styles.rankItem} key={player.id}>
              <Text className={styles.rankNum}>{index + 1}</Text>
              <Text className={styles.rankName}>{player.name}</Text>
              <Text className={styles.rankElo}>{player.elo}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default SocialPage;
