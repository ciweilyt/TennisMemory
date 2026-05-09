import React, { useState, useRef, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { TennisMatch } from '@/types/match';
import { formatScore, formatDuration } from '@/utils/statsCalculator';
import classnames from 'classnames';
import styles from './index.module.scss';

interface MatchCardProps {
  match: TennisMatch;
  onClick?: (match: TennisMatch) => void;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

const courtTypeMap: Record<string, string> = { hard: '硬地', clay: '红土', grass: '草地' };
const weatherMap: Record<string, string> = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️', windy: '💨', hot: '🔥' };

const DELETE_BTN_WIDTH = 140;
const SWIPE_THRESHOLD = 60;

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick, onDelete, showDelete }) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const directionLockedRef = useRef<'none' | 'horizontal' | 'vertical'>('none');

  const handleTouchStart = useCallback((e) => {
    if (!showDelete) return;
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    currentOffsetRef.current = offsetX;
    directionLockedRef.current = 'none';
    setIsTouching(true);
  }, [showDelete, offsetX]);

  const handleTouchMove = useCallback((e) => {
    if (!showDelete) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startXRef.current;
    const deltaY = touch.clientY - startYRef.current;

    if (directionLockedRef.current === 'none') {
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        directionLockedRef.current = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
      }
      return;
    }

    if (directionLockedRef.current === 'vertical') return;

    let newOffset = currentOffsetRef.current + deltaX;
    if (newOffset > 0) newOffset = 0;
    if (newOffset < -DELETE_BTN_WIDTH) newOffset = -DELETE_BTN_WIDTH;

    setOffsetX(newOffset);

    if (newOffset <= -SWIPE_THRESHOLD && !isRevealed) {
      Taro.vibrateShort({ type: 'light' });
    }
  }, [showDelete, isRevealed]);

  const handleTouchEnd = useCallback(() => {
    if (!showDelete) return;
    setIsTouching(false);

    if (directionLockedRef.current !== 'horizontal') return;

    if (offsetX <= -SWIPE_THRESHOLD) {
      setOffsetX(-DELETE_BTN_WIDTH);
      setIsRevealed(true);
    } else {
      setOffsetX(0);
      setIsRevealed(false);
    }
  }, [showDelete, offsetX]);

  const handleCardClick = () => {
    if (isRevealed) {
      setOffsetX(0);
      setIsRevealed(false);
      return;
    }
    onClick?.(match);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(match.id);
    setOffsetX(0);
    setIsRevealed(false);
  };

  const translateStyle = {
    transform: `translateX(${offsetX}rpx)`,
    transition: isTouching ? 'none' : 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  };

  return (
    <View className={styles.cardWrap}>
      <View
        className={styles.cardInner}
        style={showDelete ? translateStyle : undefined}
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <View className={styles.card}>
          <View className={styles.header}>
            <View className={styles.headerLeft}>
              <Text className={classnames(styles.resultTag, match.result === 'win' ? styles.win : styles.lose)}>
                {match.result === 'win' ? '胜' : '负'}
              </Text>
              <Text className={styles.matchType}>{match.matchType === 'singles' ? '单打' : '双打'}</Text>
            </View>
            <View className={styles.headerRight}>
              <Text className={styles.eloChange}>
                {match.eloChange > 0 ? `+${match.eloChange}` : match.eloChange}
              </Text>
            </View>
          </View>

          <View className={styles.body}>
            <View className={styles.opponentRow}>
              <Text className={styles.label}>对手</Text>
              <Text className={styles.opponentName}>{match.opponent}</Text>
              {match.partner && (
                <>
                  <Text className={styles.label}>搭档</Text>
                  <Text className={styles.partnerName}>{match.partner}</Text>
                </>
              )}
            </View>
            <View className={styles.scoreRow}>
              <Text className={styles.score}>{formatScore(match.scores)}</Text>
            </View>
          </View>

          <View className={styles.footer}>
            <View className={styles.footerLeft}>
              <Text className={styles.footerText}>{match.date}</Text>
              <Text className={styles.footerText}>{courtTypeMap[match.courtType]}</Text>
              <Text className={styles.footerText}>{formatDuration(match.duration)}</Text>
              <Text className={styles.footerText}>{weatherMap[match.weather] || ''}</Text>
            </View>
            <Text className={styles.courtName}>{match.court}</Text>
          </View>
        </View>
      </View>
      {showDelete && (
        <View className={styles.deleteBtn} onClick={handleDelete}>
          <Text className={styles.deleteIcon}>🗑️</Text>
          <Text className={styles.deleteText}>删除</Text>
        </View>
      )}
    </View>
  );
};

export default MatchCard;
