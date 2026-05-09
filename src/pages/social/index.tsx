import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import PlayerAvatar from '@/components/PlayerAvatar';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useMatchStore } from '@/store/useMatchStore';
import { GENDER_MAP, PLAY_STYLE_MAP } from '@/types/player';
import styles from './index.module.scss';

const SocialPage: React.FC = () => {
  const players = usePlayerStore((state) => state.players);
  const matches = useMatchStore((state) => state.matches);

  const getPlayerRecord = (playerId: string) => {
    const playerMatches = matches.filter(m => m.opponentId === playerId);
    const wins = playerMatches.filter(m => m.result === 'win').length;
    const losses = playerMatches.filter(m => m.result === 'lose').length;
    return { wins, losses };
  };

  const rivals = players.filter(p => p.relationship === 'rival' && p.totalMatches > 0);
  const partners = players.filter(p => p.relationship === 'partner' && p.totalMatches > 0);
  const sortedByElo = [...players].sort((a, b) => b.elo - a.elo);

  const handleAddPlayer = () => {
    Taro.navigateTo({ url: '/pages/player-add/index' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>🎾 我的球友</Text>
        <Text className={styles.addBtn} onClick={handleAddPlayer}>+ 添加</Text>
      </View>

      {players.length > 0 ? (
        <ScrollView scrollX className={styles.playerScroll}>
          <View className={styles.playerScrollInner}>
            {players.map((player) => (
              <View key={player.id} onClick={() => Taro.navigateTo({ url: `/pages/player-profile/index?id=${player.id}` })}>
                <PlayerAvatar name={player.name} avatar={player.avatar} elo={player.elo} size="medium" />
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View className={styles.emptyHint}>
          <Text className={styles.emptyHintText}>还没有球友，点击右上角添加吧</Text>
        </View>
      )}

      {rivals.length > 0 && (
        <>
          <Text className={styles.sectionTitle}>⚔️ 宿敌</Text>
          <Text className={styles.sectionSub}>和你势均力敌的对手</Text>
          <View className={styles.rivalSection}>
            {rivals.map((rival, index) => {
              const record = getPlayerRecord(rival.id);
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
                    <Text className={styles.rivalMeta}>Elo {rival.elo} · NTRP {rival.ntrpLevel} · {PLAY_STYLE_MAP[rival.playStyle]}</Text>
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
        </>
      )}

      {partners.length > 0 && (
        <>
          <Text className={styles.sectionTitle}>🤝 最佳搭档</Text>
          <View className={styles.partnerSection}>
            {partners.map((partner) => {
              const record = getPlayerRecord(partner.id);
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
        </>
      )}

      {players.length > 0 && (
        <>
          <Text className={styles.sectionTitle}>🏆 Elo 排行</Text>
          <View className={styles.rankSection}>
            <View className={styles.rankCard}>
              {sortedByElo.map((player, index) => (
                <View className={styles.rankItem} key={player.id}
                  onClick={() => Taro.navigateTo({ url: `/pages/player-profile/index?id=${player.id}` })}>
                  <Text className={styles.rankNum}>{index + 1}</Text>
                  <Text className={styles.rankName}>{player.name}</Text>
                  <Text className={styles.rankElo}>{player.elo}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default SocialPage;
