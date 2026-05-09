import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea, Switch, Button } from '@tarojs/components';
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

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Taro.showToast({ title: '请输入球友姓名', icon: 'none' });
      return;
    }
    if (players.find((p) => p.name === trimmedName)) {
      Taro.showToast({ title: '该球友已存在', icon: 'none' });
      return;
    }

    try {
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
    } catch (e) {
      console.error('[PlayerAdd] save error:', e);
      Taro.showToast({ title: '保存失败，请重试', icon: 'none' });
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.avatarPreview}>
        <View className={styles.avatarCircle}>
          {avatarURI ? (
            <image className={styles.avatarImg} src={avatarURI} mode="aspectFill" />
          ) : (
            <Text className={styles.avatarPlaceholder}>👤</Text>
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
            <Text
              className={gender === 'male' ? styles.optionActive : styles.optionBtn}
              onClick={() => setGender('male')}
            >{GENDER_MAP['male']}</Text>
            <Text
              className={gender === 'female' ? styles.optionActive : styles.optionBtn}
              onClick={() => setGender('female')}
            >{GENDER_MAP['female']}</Text>
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
              <Text
                key={s}
                className={playStyle === s ? styles.optionActive : styles.optionBtn}
                onClick={() => setPlayStyle(s)}
              >{PLAY_STYLE_MAP[s]}</Text>
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
              <Text
                key={c}
                className={favoriteCourt === c ? styles.optionActive : styles.optionBtn}
                onClick={() => setFavoriteCourt(c)}
              >{c}</Text>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>备注</Text>
          <Textarea className={styles.textArea} value={notes} onInput={(e) => setNotes(e.detail.value)} placeholder="记录球友特点..." maxlength={200} />
        </View>
      </View>

      <Button className={styles.submitBtn} onClick={handleSave}>保存球友</Button>
    </View>
  );
};

export default PlayerAddPage;
