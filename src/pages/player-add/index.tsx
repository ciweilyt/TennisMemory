import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Input, Textarea, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Gender, PlayStyle, GENDER_MAP, PLAY_STYLE_MAP } from '@/types/player';
import { generateAvatarURI } from '@/utils/avatarGenerator';
import styles from './index.module.scss';

const genderOptions: Gender[] = ['male', 'female'];
const styleOptions: PlayStyle[] = ['baseline', 'serve_volley', 'all_court', 'counter_puncher'];
const courtOptions = ['硬地', '红土', '草地'];

const PlayerAddPage: React.FC = () => {
  const addPlayer = usePlayerStore((s) => s.addPlayer);
  const players = usePlayerStore((s) => s.players);

  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [ntrpLevel, setNtrpLevel] = useState('3.0');
  const [playStyle, setPlayStyle] = useState<PlayStyle>('baseline');
  const [isLefty, setIsLefty] = useState(false);
  const [favoriteCourt, setFavoriteCourt] = useState('硬地');
  const [notes, setNotes] = useState('');

  const avatarURI = useMemo(() => {
    if (!name.trim()) return '';
    return generateAvatarURI(name.trim(), gender, playStyle, ntrpLevel, isLefty);
  }, [name, gender, playStyle, ntrpLevel, isLefty]);

  const handleGenderSelect = useCallback((g: Gender) => {
    setGender(g);
  }, []);

  const handleStyleSelect = useCallback((s: PlayStyle) => {
    setPlayStyle(s);
  }, []);

  const handleCourtSelect = useCallback((c: string) => {
    setFavoriteCourt(c);
  }, []);

  const handleSave = useCallback(() => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Taro.showToast({ title: '请输入球友姓名', icon: 'none' });
      return;
    }
    if (players.find((p) => p.name === trimmedName)) {
      Taro.showToast({ title: '该球友已存在', icon: 'none' });
      return;
    }

    addPlayer({
      name: trimmedName,
      gender,
      ntrpLevel: ntrpLevel || '3.0',
      playStyle,
      isLefty,
      favoriteCourt,
      notes,
      lastPlayDate: '',
      relationship: 'casual'
    });

    Taro.showToast({ title: '添加成功', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 500);
  }, [name, gender, ntrpLevel, playStyle, isLefty, favoriteCourt, notes, players, addPlayer]);

  return (
    <View className={styles.container}>
      <View className={styles.avatarPreview}>
        <View className={styles.avatarCircle}>
          {avatarURI ? (
            <image className={styles.avatarImg} src={avatarURI} mode="aspectFill" />
          ) : (
            <Text style={{ fontSize: '48rpx', lineHeight: '160rpx', textAlign: 'center', display: 'block' }}>👤</Text>
          )}
        </View>
        <Text className={styles.avatarHint}>头像根据信息自动生成</Text>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.formTitle}>基本信息</Text>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>姓名 *</Text>
          <Input className={styles.formInput} value={name} onInput={(e) => setName(e.detail.value)} placeholder="输入球友姓名" maxlength={20} />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>性别</Text>
          <View className={styles.optionRow}>
            {genderOptions.map((g) => (
              <View
                key={g}
                className={`${styles.optionBtn} ${gender === g ? styles.optionActive : ''}`}
                hoverClass={styles.optionHover}
                onClick={() => handleGenderSelect(g)}
              >
            <Text className={`${styles.optionText} ${gender === g ? styles.optionTextActive : ''}`}>{GENDER_MAP[g]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>技术水平（NTRP）</Text>
          <Input
            className={styles.formInput}
            value={ntrpLevel}
            onInput={(e) => setNtrpLevel(e.detail.value)}
            placeholder="如 2.5、3.0、4.0"
            type="digit"
            maxlength={4}
          />
          <Text className={styles.formHint}>参考：1.0初学 ~ 7.0职业</Text>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>打法风格</Text>
          <View className={styles.optionRow}>
            {styleOptions.map((s) => (
              <View
                key={s}
                className={`${styles.optionBtn} ${playStyle === s ? styles.optionActive : ''}`}
                hoverClass={styles.optionHover}
                onClick={() => handleStyleSelect(s)}
              >
            <Text className={`${styles.optionText} ${playStyle === s ? styles.optionTextActive : ''}`}>{PLAY_STYLE_MAP[s]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <View className={styles.switchRow}>
            <Text className={styles.switchLabel}>左手选手</Text>
            <Switch checked={isLefty} onChange={(e) => setIsLefty(e.detail.value)} color="#1A6B4C" />
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>偏好场地</Text>
          <View className={styles.optionRow}>
            {courtOptions.map((c) => (
              <View
                key={c}
                className={`${styles.optionBtn} ${favoriteCourt === c ? styles.optionActive : ''}`}
                hoverClass={styles.optionHover}
                onClick={() => handleCourtSelect(c)}
              >
            <Text className={`${styles.optionText} ${favoriteCourt === c ? styles.optionTextActive : ''}`}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>备注</Text>
          <Textarea className={styles.textArea} value={notes} onInput={(e) => setNotes(e.detail.value)} placeholder="记录球友特点..." maxlength={200} />
        </View>
      </View>

      <View className={styles.submitBtn} hoverClass={styles.submitBtnHover} onClick={handleSave}>
        <Text className={styles.submitText}>保存球友</Text>
      </View>
    </View>
  );
};

export default PlayerAddPage;
