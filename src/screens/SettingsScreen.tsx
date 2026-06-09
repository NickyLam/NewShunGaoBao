import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import {
  setAlarmsEnabled,
  setHighThreshold,
  setLowThreshold,
  setSignalLossAlarm,
  setHealthKitSync,
} from '../store/slices/settingsSlice';
import { useSettings } from '../hooks/useSettings';
import { useNavigation } from '@react-navigation/native';

export const SettingsScreen = () => {
  const settings = useSelector((state: RootState) => state.settings);
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { updateSetting, loadSettings } = useSettings();

  // 加载设置
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // 处理设置变更
  const handleAlarmsEnabledChange = async (value: boolean) => {
    dispatch(setAlarmsEnabled(value));
    await updateSetting('alarms', { ...settings.alarms, enabled: value });
  };

  const handleSignalLossChange = async (value: boolean) => {
    dispatch(setSignalLossAlarm(value));
    await updateSetting('alarms', { ...settings.alarms, signalLoss: value });
  };

  const handleHealthKitChange = async (value: boolean) => {
    dispatch(setHealthKitSync(value));
    await updateSetting('healthKitSync', value);
  };

  const handleSharePress = () => {
    Alert.alert(
      '共享数据',
      '此功能即将推出，敬请期待！',
      [{ text: '确定', style: 'default' }]
    );
  };

  const handleNewSensorPress = () => {
    navigation.navigate('Home' as never);
  };

  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确定要退出吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '退出', style: 'destructive', onPress: () => console.log('Logout') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>设置</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>报警设置</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>启用报警</Text>
            <Switch
              value={settings.alarms.enabled}
              onValueChange={handleAlarmsEnabledChange}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>高血糖阈值</Text>
            <Text style={styles.settingValue}>{settings.alarms.highThreshold} mg/dL</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>低血糖阈值</Text>
            <Text style={styles.settingValue}>{settings.alarms.lowThreshold} mg/dL</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>信号丢失报警</Text>
            <Switch
              value={settings.alarms.signalLoss}
              onValueChange={handleSignalLossChange}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>云端与共享</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>健康平台同步</Text>
            <Switch
              value={settings.healthKitSync}
              onValueChange={handleHealthKitChange}
            />
          </View>
          <TouchableOpacity style={styles.settingItem} onPress={handleSharePress}>
            <Text style={styles.settingLabel}>共享给家人/医生</Text>
            <Text style={styles.settingValue}>{settings.sharedWith.length} 人</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>账户</Text>
          {auth.user ? (
            <>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>邮箱</Text>
                <Text style={styles.settingValue}>{auth.user.email}</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>会员状态</Text>
                <Text style={[styles.settingValue, { color: auth.isPremium ? '#4CAF50' : '#757575' }]}>
                  {auth.isPremium ? 'Premium' : 'Free'}
                </Text>
              </View>
              <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                <Text style={[styles.settingLabel, { color: '#F44336' }]}>退出登录</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>未登录</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>传感器</Text>
          <TouchableOpacity style={styles.settingItem} onPress={handleNewSensorPress}>
            <Text style={[styles.settingLabel, { color: '#4CAF50' }]}>启动新传感器</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  settingLabel: {
    fontSize: 16,
    color: '#212121',
  },
  settingValue: {
    fontSize: 16,
    color: '#757575',
  },
});
