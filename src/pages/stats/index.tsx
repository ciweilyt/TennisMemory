import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import StatCard from '@/components/StatCard';
import { mockOverallStats, mockCourtStats, mockMatchTypeStats, mockAIInsights, mockEloInfo } from '@/data/stats';
import { useMatchStore } from '@/store/useMatchStore';
import classnames from 'classnames';
import styles from './index.module.scss';

const WEEK_DAYS = ['一', '二', '三', '四', '五', '六', '日'];

const StatsPage: React.FC = () => {
  const matches = useMatchStore((state) => state.matches);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);

  const eloProgress = Math.min(((mockEloInfo.current - 1000) / 800) * 100, 100);

  const matchDates = useMemo(() => {
    const dateMap: Record<string, number> = {};
    matches.forEach(m => {
      dateMap[m.date] = (dateMap[m.date] || 0) + 1;
    });
    return dateMap;
  }, [matches]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth - 1, 1);
    const lastDay = new Date(calendarYear, calendarMonth, 0);
    const totalDays = lastDay.getDate();
    let startWeekDay = firstDay.getDay();
    if (startWeekDay === 0) startWeekDay = 7;

    const days: (number | null)[] = [];
    for (let i = 1; i < startWeekDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(d);
    }
    return days;
  }, [calendarYear, calendarMonth]);

  const monthMatchCount = useMemo(() => {
    const prefix = `${calendarYear}-${calendarMonth.toString().padStart(2, '0')}`;
    return matches.filter(m => m.date.startsWith(prefix)).length;
  }, [matches, calendarYear, calendarMonth]);

  const prevMonth = () => {
    if (calendarMonth === 1) {
      setCalendarMonth(12);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 12) {
      setCalendarMonth(1);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const getDayMatchCount = (day: number | null) => {
    if (day === null) return 0;
    const dateStr = `${calendarYear}-${calendarMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return matchDates[dateStr] || 0;
  };

  const getDayLevel = (count: number) => {
    if (count === 0) return styles.dayEmpty;
    if (count === 1) return styles.dayLevel1;
    if (count === 2) return styles.dayLevel2;
    return styles.dayLevel3;
  };

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

      <View className={styles.calendarHeader}>
        <Text className={styles.sectionTitle}>🎾 网球日历</Text>
        <Text className={styles.calendarCount}>本月 {monthMatchCount} 场</Text>
      </View>
      <View className={styles.calendarCard}>
        <View className={styles.calendarNav}>
          <Text className={styles.calendarNavBtn} onClick={prevMonth}>‹</Text>
          <Text className={styles.calendarTitle}>{calendarYear}年{calendarMonth}月</Text>
          <Text className={styles.calendarNavBtn} onClick={nextMonth}>›</Text>
        </View>
        <View className={styles.calendarWeekRow}>
          {WEEK_DAYS.map(d => (
            <Text key={d} className={styles.calendarWeekDay}>{d}</Text>
          ))}
        </View>
        <View className={styles.calendarGrid}>
          {calendarDays.map((day, i) => {
            const count = getDayMatchCount(day);
            return (
              <View key={i} className={classnames(styles.calendarDay, getDayLevel(count))}>
                {day !== null && (
                  <Text className={count > 0 ? styles.dayTextActive : styles.dayText}>{day}</Text>
                )}
              </View>
            );
          })}
        </View>
        <View className={styles.calendarLegend}>
          <View className={styles.legendItem}>
            <View className={classnames(styles.legendDot, styles.dayEmpty)} />
            <Text className={styles.legendText}>无</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={classnames(styles.legendDot, styles.dayLevel1)} />
            <Text className={styles.legendText}>1场</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={classnames(styles.legendDot, styles.dayLevel2)} />
            <Text className={styles.legendText}>2场</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={classnames(styles.legendDot, styles.dayLevel3)} />
            <Text className={styles.legendText}>3+场</Text>
          </View>
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
