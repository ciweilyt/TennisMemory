import Taro from '@tarojs/taro';

const STORAGE_KEYS = {
  MATCHES: 'tennis_memory_matches',
  PLAYERS: 'tennis_memory_players',
  USER_PROFILE: 'tennis_memory_user_profile',
  BACKUP_TIMESTAMP: 'tennis_memory_backup_ts'
};

export function loadData<T>(key: string, defaultValue: T): T {
  try {
    const data = Taro.getStorageSync(key);
    if (data) return JSON.parse(data) as T;
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveData<T>(key: string, data: T): void {
  try {
    Taro.setStorageSync(key, JSON.stringify(data));
  } catch (e) {
    console.error('[Storage] save failed:', key, e);
  }
}

export function removeData(key: string): void {
  try {
    Taro.removeStorageSync(key);
  } catch (e) {
    console.error('[Storage] remove failed:', key, e);
  }
}

export function exportAllData(): string {
  const matches = loadData(STORAGE_KEYS.MATCHES, []);
  const players = loadData(STORAGE_KEYS.PLAYERS, []);
  const userProfile = loadData(STORAGE_KEYS.USER_PROFILE, {});
  return JSON.stringify({ matches, players, userProfile, exportedAt: new Date().toISOString() }, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.matches) saveData(STORAGE_KEYS.MATCHES, data.matches);
    if (data.players) saveData(STORAGE_KEYS.PLAYERS, data.players);
    if (data.userProfile) saveData(STORAGE_KEYS.USER_PROFILE, data.userProfile);
    return true;
  } catch {
    return false;
  }
}

export function autoBackup(): void {
  try {
    const now = Date.now();
    const lastBackup = loadData(STORAGE_KEYS.BACKUP_TIMESTAMP, 0);
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (now - lastBackup < ONE_DAY) return;
    const allData = exportAllData();
    Taro.getFileSystemManager().writeFile({
      filePath: `${Taro.env.USER_DATA_PATH}/tennis_memory_backup_${new Date().toISOString().slice(0, 10)}.json`,
      data: allData,
      encoding: 'utf8',
      success: () => {
        saveData(STORAGE_KEYS.BACKUP_TIMESTAMP, now);
      },
      fail: (err) => {
        console.error('[Storage] auto backup failed:', err);
      }
    });
  } catch (e) {
    console.error('[Storage] auto backup error:', e);
  }
}

export { STORAGE_KEYS };
