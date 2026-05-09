import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Gender, PlayStyle, SkillLevel, GENDER_MAP, PLAY_STYLE_MAP, SKILL_LEVEL_MAP } from '@/types/player';
import { generateAvatarURI } from '@/utils/avatarGenerator';
import styles from './index.module.scss';

const genderOptions: Gender[] = ['male', 'female'];
const skillOptions: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
const styleOptions: PlayStyle[] = ['baseline', 'serve_volley', 'all_court', 'counter_puncher'];
const courtOptions = ['硬地', '红土', '草地'];

const PlayerAddPage: React.FC = () => {
  const addPlayer = usePlayerStore((s) => s.addPlayer);
  const players = usePlayerStore((s) => s.players);

  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [playStyle, setPlayStyle] = useState<PlayStyle>('baseline');
  const [isLefty, setIsLefty] = useState(false);
  const [favoriteCourt, setFavoriteCourt] = useState('硬地');
  const [notes, setNotes] = useState('');

  const avatarURI = useMemo(() => {
    if (!name.trim()) return '';
    return generateAvatarURI(name.trim(), gender, playStyle, skillLevel, isLefty);
  }, [name, gender, playStyle, skillLevel, isLefty]);

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

    addPlayer({
      name: trimmedName,
      gender,
      skillLevel,
      playStyle,
      isLefty,
      favoriteCourt,
      notes,
      lastPlayDate: '',
      relationship: 'casual'
    });

    Taro.showToast({ title: '添加成功', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 500);
  };

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
              <View key={g} className={classnames(styles.optionBtn, gender === g && styles.optionActive)} onClick={() => setGender(g)}>
                <Text className={classnames(styles.optionText, gender === g && styles.optionTextActive)}>{GENDER_MAP[g]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>技术水平</Text>
          <View className={styles.optionRow}>
            {skillOptions.map((s) => (
              <View key={s} className={classnames(styles.optionBtn, skillLevel === s && styles.optionActive)} onClick={() => setSkillLevel(s)}>
                <Text className={classnames(styles.optionText, skillLevel === s && styles.optionTextActive)}>{SKILL_LEVEL_MAP[s]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>打法风格</Text>
          <View className={styles.optionRow}>
            {styleOptions.map((s) => (
              <View key={s} className={classnames(styles.optionBtn, playStyle === s && styles.optionActive)} onClick={() => setPlayStyle(s)}>
                <Text className={classnames(styles.optionText, playStyle === s && styles.optionTextActive)}>{PLAY_STYLE_MAP[s]}</Text>
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
              <View key={c} className={classnames(styles.optionBtn, favoriteCourt === c && styles.optionActive)} onClick={() => setFavoriteCourt(c)}>
                <Text className={classnames(styles.optionText, favoriteCourt === c && styles.optionTextActive)}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>备注</Text>
          <Textarea className={styles.textArea} value={notes} onInput={(e) => setNotes(e.detail.value)} placeholder="记录球友特点..." maxlength={200} />
        </View>
      </View>

      <View className={styles.submitBtn} onClick={handleSave}>
        <Text className={styles.submitText}>保存球友</Text>
      </View>
    </View>
  );
};

export default PlayerAddPage;
