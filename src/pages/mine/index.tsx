import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockEloInfo, mockOverallStats } from '@/data/stats';
import { getEloLevel } from '@/utils/elo';
import { useUserStore } from '@/store/useUserStore';
import { useMatchStore } from '@/store/useMatchStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { exportAllData, importAllData } from '@/utils/storage';
import styles from './index.module.scss';

const courtOptions = ['硬地', '红土', '草地'];

const MinePage: React.FC = () => {
  const profile = useUserStore((state) => state.profile);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const matches = useMatchStore((state) => state.matches);
  const players = usePlayerStore((state) => state.players);
  const eloLevel = getEloLevel(mockEloInfo.current);

  const [editing, setEditing] = useState(false);
  const [editNickname, setEditNickname] = useState(profile.nickname);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editCourt, setEditCourt] = useState(profile.favoriteCourt);
  const [editYears, setEditYears] = useState(profile.playingYears);

  const handleEdit = () => {
    setEditNickname(profile.nickname);
    setEditBio(profile.bio);
    setEditCourt(profile.favoriteCourt);
    setEditYears(profile.playingYears);
    setEditing(true);
  };

  const handleSave = () => {
    const nickname = editNickname.trim();
    if (!nickname) {
      Taro.showToast({ title: '昵称不能为空', icon: 'none' });
      return;
    }
    updateProfile({
      nickname,
      bio: editBio.trim(),
      favoriteCourt: editCourt,
      playingYears: editYears.trim()
    });
    setEditing(false);
    Taro.showToast({ title: '保存成功', icon: 'success' });
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleExport = () => {
    try {
      const data = exportAllData();
      const fs = Taro.getFileSystemManager();
      const filePath = `${Taro.env.USER_DATA_PATH}/tennis_memory_export_${new Date().toISOString().slice(0, 10)}.json`;
      fs.writeFile({
        filePath,
        data,
        encoding: 'utf8',
        success: () => {
          Taro.showToast({ title: '导出成功', icon: 'success' });
        },
        fail: () => {
          Taro.showToast({ title: '导出失败', icon: 'none' });
        }
      });
    } catch {
      Taro.showToast({ title: '导出失败', icon: 'none' });
    }
  };

  const handleImport = () => {
    Taro.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json'],
      success: (res) => {
        const fs = Taro.getFileSystemManager();
        fs.readFile({
          filePath: res.tempFiles[0].path,
          encoding: 'utf8',
          success: (readRes) => {
            const success = importAllData(readRes.data as string);
            if (success) {
              Taro.showToast({ title: '导入成功，请重启', icon: 'success' });
            } else {
              Taro.showToast({ title: '文件格式错误', icon: 'none' });
            }
          }
        });
      }
    });
  };

  const handleMenuClick = (type: string) => {
    switch (type) {
      case 'stats':
        Taro.switchTab({ url: '/pages/stats/index' });
        break;
      case 'social':
        Taro.switchTab({ url: '/pages/social/index' });
        break;
      case 'export':
        handleExport();
        break;
      case 'import':
        handleImport();
        break;
      default:
        Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.profileCard}>
        <View className={styles.profileHeader}>
          <View className={styles.profileAvatar}>
            <Text className={styles.profileAvatarText}>🎾</Text>
          </View>
          <View className={styles.profileInfo}>
            <Text className={styles.profileName}>{profile.nickname}</Text>
            <Text className={styles.profileElo}>NTRP {eloLevel.level} · {eloLevel.levelName}</Text>
            <Text className={styles.profileBio}>{profile.bio}</Text>
          </View>
        </View>
        <View className={styles.profileStats}>
          <View className={styles.profileStatItem}>
            <Text className={styles.profileStatValue}>{matches.length}</Text>
            <Text className={styles.profileStatLabel}>总场次</Text>
          </View>
          <View className={styles.profileStatItem}>
            <Text className={styles.profileStatValue}>{players.length}</Text>
            <Text className={styles.profileStatLabel}>球友</Text>
          </View>
          <View className={styles.profileStatItem}>
            <Text className={styles.profileStatValue}>{mockEloInfo.current}</Text>
            <Text className={styles.profileStatLabel}>Elo</Text>
          </View>
        </View>
      </View>

      <Text className={styles.sectionTitle}>等级详情</Text>
      <View className={styles.eloDetailCard}>
        <View className={styles.eloDetailRow}>
          <Text className={styles.eloDetailLabel}>当前等级</Text>
          <Text className={styles.eloDetailValue}>NTRP {eloLevel.level}</Text>
        </View>
        <View className={styles.eloDetailRow}>
          <Text className={styles.eloDetailLabel}>等级名称</Text>
          <Text className={styles.eloDetailValue}>{eloLevel.levelName}</Text>
        </View>
        <View className={styles.eloDetailRow}>
          <Text className={styles.eloDetailLabel}>Elo 分数</Text>
          <Text className={styles.eloDetailValue}>{mockEloInfo.current}</Text>
        </View>
        <View className={styles.eloDetailRow}>
          <Text className={styles.eloDetailLabel}>发展趋势</Text>
          <Text className={styles.eloDetailValue}>
            {mockEloInfo.trend === 'up' ? '📈 上升' : mockEloInfo.trend === 'down' ? '📉 下降' : '➡️ 稳定'}
          </Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>个人信息</Text>
      <View className={styles.infoCard}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>昵称</Text>
          <Text className={styles.infoValue}>{profile.nickname}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>个性签名</Text>
          <Text className={styles.infoValue}>{profile.bio}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>偏好场地</Text>
          <Text className={styles.infoValue}>{profile.favoriteCourt}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>球龄</Text>
          <Text className={styles.infoValue}>{profile.playingYears}年</Text>
        </View>
        <View className={styles.editBtn} onClick={handleEdit}>
          <Text className={styles.editBtnText}>✏️ 编辑信息</Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>数据管理</Text>
      <View className={styles.menuCard}>
        <View className={styles.menuItem} onClick={() => handleMenuClick('export')}>
          <View className={styles.menuItemLeft}>
            <Text className={styles.menuIcon}>📤</Text>
            <Text className={styles.menuLabel}>导出数据</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('import')}>
          <View className={styles.menuItemLeft}>
            <Text className={styles.menuIcon}>📥</Text>
            <Text className={styles.menuLabel}>导入数据</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>更多</Text>
      <View className={styles.menuCard}>
        <View className={styles.menuItem} onClick={() => handleMenuClick('stats')}>
          <View className={styles.menuItemLeft}>
            <Text className={styles.menuIcon}>📊</Text>
            <Text className={styles.menuLabel}>数据统计</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('social')}>
          <View className={styles.menuItemLeft}>
            <Text className={styles.menuIcon}>👥</Text>
            <Text className={styles.menuLabel}>球友社交</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('about')}>
          <View className={styles.menuItemLeft}>
            <Text className={styles.menuIcon}>ℹ️</Text>
            <Text className={styles.menuLabel}>关于</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <Text className={styles.versionText}>网球记忆 v1.1.0 · 单机版</Text>

      {editing && (
        <View className={styles.overlay} onClick={handleCancel}>
          <View className={styles.editModal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>编辑个人信息</Text>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>昵称</Text>
              <Input className={styles.formInput} value={editNickname} onInput={(e) => setEditNickname(e.detail.value)} placeholder="输入昵称" maxlength={20} />
            </View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>个性签名</Text>
              <Input className={styles.formInput} value={editBio} onInput={(e) => setEditBio(e.detail.value)} placeholder="输入个性签名" maxlength={50} />
            </View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>偏好场地</Text>
              <View className={styles.courtOptions}>
                {courtOptions.map((court) => (
                  <View key={court} className={classnames(styles.courtOption, editCourt === court && styles.courtOptionActive)} onClick={() => setEditCourt(court)}>
                    <Text className={classnames(styles.courtOptionText, editCourt === court && styles.courtOptionTextActive)}>{court}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>球龄（年）</Text>
              <Input className={styles.formInput} value={editYears} onInput={(e) => setEditYears(e.detail.value)} placeholder="输入球龄" type="number" maxlength={2} />
            </View>
            <View className={styles.modalActions}>
              <View className={styles.modalCancel} onClick={handleCancel}>
                <Text className={styles.modalCancelText}>取消</Text>
              </View>
              <View className={styles.modalConfirm} onClick={handleSave}>
                <Text className={styles.modalConfirmText}>保存</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default MinePage;
