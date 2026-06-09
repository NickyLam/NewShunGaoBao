import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { RootState } from '../store/store';
import { useSensor } from '../hooks/useSensor';
import { useError } from '../hooks/useError';
import { LoadingOverlay, ErrorBoundary } from '../components';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryArea, VictoryTheme } from 'victory-native';

export const HomeScreen = () => {
  const glucose = useSelector((state: RootState) => state.glucose);
  const settings = useSelector((state: RootState) => state.settings);
  const navigation = useNavigation();
  const { 
    isScanning, 
    isSyncing,
    error: sensorError,
    scanAndConnect, 
    disconnect, 
    addMockReading,
    loadHistoryData,
    loadCachedData,
  } = useSensor();
  const { handleError, clearError } = useError();

  // 加载历史数据
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadCachedData();
        await loadHistoryData(7);
      } catch (error) {
        handleError(error, 'LoadHistoryData');
      }
    };
    
    loadData();
  }, [loadCachedData, loadHistoryData, handleError]);

  // 显示传感器错误
  useEffect(() => {
    if (sensorError) {
      Alert.alert('传感器错误', sensorError, [
        { text: '确定', onPress: clearError },
      ]);
    }
  }, [sensorError, clearError]);

  const trendArrows: Record<string, string> = {
    '↑↑': '↑↑',
    '↑': '↑',
    '→': '→',
    '↓': '↓',
    '↓↓': '↓↓',
  };

  const getGlucoseColor = (value: number) => {
    if (value < settings.alarms.lowThreshold) return '#F44336';
    if (value > settings.alarms.highThreshold) return '#FF9800';
    return '#4CAF50';
  };

  // 获取最近12小时的历史数据用于图表
  const getChartData = () => {
    const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
    return glucose.history
      .filter(reading => reading.timestamp >= twelveHoursAgo)
      .reverse()
      .map(reading => ({
        x: new Date(reading.timestamp),
        y: reading.value,
      }));
  };

  const chartData = getChartData();

  const handleConnect = () => {
    Alert.alert(
      '连接传感器',
      '扫描并连接FreeStyle Libre传感器',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '扫描', 
          onPress: async () => {
            try {
              await scanAndConnect();
            } catch (error) {
              handleError(error, 'ScanAndConnect');
            }
          }
        },
        { text: '测试模式', onPress: () => addMockReading() },
      ]
    );
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <LoadingOverlay visible={isScanning} message="正在扫描传感器..." />
        
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.sensorStatus}>
              <View style={[styles.statusDot, { backgroundColor: glucose.isConnected ? '#4CAF50' : '#F44336' }]} />
              <Text style={styles.statusText}>
                {glucose.isConnected ? '传感器已连接' : '传感器未连接'}
              </Text>
              {isSyncing && (
                <ActivityIndicator size="small" color="white" style={styles.syncIndicator} />
              )}
            </View>
            {glucose.sensorSession && (
              <Text style={styles.sensorInfo}>
                {glucose.sensorSession.sensorType} · 还剩{Math.ceil((glucose.sensorSession.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))}天
              </Text>
            )}
          </View>
        </View>

        <ScrollView style={styles.content}>
          {glucose.currentReading && (
            <View style={styles.glucoseDisplay}>
              <Text style={[styles.glucoseValue, { color: getGlucoseColor(glucose.currentReading.value) }]}>
                {glucose.currentReading.value}
              </Text>
              <Text style={styles.glucoseUnit}>mg/dL</Text>
              {glucose.currentReading.trend && (
                <Text style={styles.trendArrow}>
                  {trendArrows[glucose.currentReading.trend]}
                </Text>
              )}
              <Text style={styles.lastUpdate}>
                更新于 {new Date(glucose.currentReading.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          )}

          {!glucose.currentReading && (
            <View style={styles.glucoseDisplay}>
              <Text style={styles.noReadingText}>暂无血糖数据</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>范围内时间</Text>
              <Text style={styles.statValue}>--</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>最低</Text>
              <Text style={styles.statValue}>--</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>最高</Text>
              <Text style={styles.statValue}>--</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>12小时趋势</Text>
            {chartData.length > 1 ? (
              <VictoryChart
                width={320}
                height={150}
                theme={VictoryTheme.material}
                padding={{ left: 40, top: 20, right: 20, bottom: 40 }}
              >
                <VictoryAxis dependentAxis tickFormat={(t) => `${t}`} />
                <VictoryAxis tickFormat={(t) => `${t.getHours()}:00`} />
                <VictoryArea
                  data={chartData}
                  style={{
                    data: { fill: '#4CAF50', fillOpacity: 0.3, stroke: '#4CAF50', strokeWidth: 2 },
                  }}
                  interpolation="natural"
                />
              </VictoryChart>
            ) : (
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartPlaceholderText}>暂无数据，请连接传感器</Text>
              </View>
            )}
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('AddNote' as never)}
            >
              <Text style={styles.primaryButtonText}>添加备注</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Reports' as never)}
            >
              <Text style={styles.secondaryButtonText}>报告</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.connectorRow}>
            {glucose.isConnected ? (
              <TouchableOpacity
                style={[styles.connectButton, styles.disconnectButton]}
                onPress={disconnect}
              >
                <Text style={styles.connectButtonText}>断开传感器</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.connectButton}
                onPress={handleConnect}
                disabled={isScanning}
              >
                <Text style={styles.connectButtonText}>
                  {isScanning ? '扫描中...' : '连接传感器'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {!glucose.isConnected && (
            <View style={styles.testRow}>
              <TouchableOpacity
                style={styles.testButton}
                onPress={addMockReading}
              >
                <Text style={styles.testButtonText}>添加模拟数据</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.recentNotes}>
            <Text style={styles.sectionTitle}>最近备注</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Notes' as never)}>
              <Text style={styles.viewAllText}>查看全部 →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  sensorStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  syncIndicator: {
    marginLeft: 8,
  },
  sensorInfo: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  glucoseDisplay: {
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  glucoseValue: {
    fontSize: 72,
    fontWeight: '700',
    marginBottom: 4,
  },
  glucoseUnit: {
    fontSize: 18,
    color: '#757575',
    marginBottom: 8,
  },
  trendArrow: {
    fontSize: 32,
    marginBottom: 8,
  },
  lastUpdate: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  noReadingText: {
    fontSize: 18,
    color: '#9E9E9E',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  chartPlaceholder: {
    height: 150,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    color: '#9E9E9E',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    color: '#424242',
    fontSize: 16,
    fontWeight: '600',
  },
  recentNotes: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  connectorRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  connectButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  testRow: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  testButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
