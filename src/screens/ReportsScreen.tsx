import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryBar,
  VictoryPie,
  VictoryLabel,
  VictoryTheme,
  VictoryArea,
} from 'victory-native';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 64;
const chartHeight = 150;

interface GlucoseDataPoint {
  x: Date;
  y: number;
}

export const ReportsScreen = () => {
  const glucose = useSelector((state: RootState) => state.glucose);
  const settings = useSelector((state: RootState) => state.settings);

  // 处理历史数据为图表格式
  const getGlucoseData = (): GlucoseDataPoint[] => {
    return glucose.history
      .slice(0, 72)
      .reverse()
      .map(reading => ({
        x: new Date(reading.timestamp),
        y: reading.value,
      }));
  };

  // 计算范围内时间百分比
  const getTimeInRangeData = () => {
    const readings = glucose.history.slice(0, 72);
    if (readings.length === 0) {
      return { inRange: 0, above: 0, below: 0 };
    }

    const inRange = readings.filter(
      r => r.value >= settings.alarms.lowThreshold && r.value <= settings.alarms.highThreshold
    ).length;
    const above = readings.filter(r => r.value > settings.alarms.highThreshold).length;
    const below = readings.filter(r => r.value < settings.alarms.lowThreshold).length;

    return {
      inRange: Math.round((inRange / readings.length) * 100),
      above: Math.round((above / readings.length) * 100),
      below: Math.round((below / readings.length) * 100),
    };
  };

  // 获取每日模式数据（按小时分组）
  const getDailyPatternData = () => {
    const hourlyData: { [key: number]: number[] } = {};
    
    glucose.history.forEach(reading => {
      const hour = new Date(reading.timestamp).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = [];
      }
      hourlyData[hour].push(reading.value);
    });

    return Object.entries(hourlyData).map(([hour, values]) => ({
      hour: parseInt(hour),
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    }));
  };

  // 血糖分布数据
  const getDistributionData = () => {
    const readings = glucose.history;
    if (readings.length === 0) return [];

    const ranges = [
      { range: '低血糖', min: 0, max: 70, count: 0 },
      { range: '正常低', min: 70, max: 100, count: 0 },
      { range: '正常', min: 100, max: 140, count: 0 },
      { range: '正常高', min: 140, max: 180, count: 0 },
      { range: '高血糖', min: 180, max: 999, count: 0 },
    ];

    readings.forEach(reading => {
      const range = ranges.find(r => reading.value >= r.min && reading.value < r.max);
      if (range) range.count++;
    });

    return ranges
      .filter(r => r.count > 0)
      .map(r => ({ x: r.range, y: r.count }));
  };

  const glucoseData = getGlucoseData();
  const timeInRange = getTimeInRangeData();
  const dailyPattern = getDailyPatternData();
  const distributionData = getDistributionData();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>报告</Text>
      </View>
      <ScrollView style={styles.content}>
        {/* 范围内时间 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>范围内时间</Text>
          <Text style={styles.cardSubtitle}>
            {timeInRange.inRange}% 在目标范围内 ({settings.alarms.lowThreshold}-{settings.alarms.highThreshold} mg/dL)
          </Text>
          <View style={styles.pieContainer}>
            <VictoryPie
              data={[
                { x: '范围内', y: timeInRange.inRange },
                { x: '偏高', y: timeInRange.above },
                { x: '偏低', y: timeInRange.below },
              ]}
              width={chartWidth}
              height={chartHeight}
              innerRadius={30}
              colorScale={['#4CAF50', '#FF9800', '#F44336']}
              labelRadius={({ innerRadius }) => (chartWidth / 2 + innerRadius) / 2}
              labelComponent={<VictoryLabel style={{ fontSize: 12, fill: 'white' }} />}
              theme={VictoryTheme.material}
            />
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>范围内 {timeInRange.inRange}%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.legendText}>偏高 {timeInRange.above}%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendText}>偏低 {timeInRange.below}%</Text>
            </View>
          </View>
        </View>

        {/* 每日模式 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>每日模式</Text>
          <Text style={styles.cardSubtitle}>24小时平均血糖水平</Text>
          {dailyPattern.length > 0 ? (
            <VictoryChart
              width={chartWidth}
              height={chartHeight}
              theme={VictoryTheme.material}
              padding={{ left: 40, top: 20, right: 20, bottom: 40 }}
            >
              <VictoryAxis dependentAxis tickFormat={(t) => `${t}`} />
              <VictoryAxis tickFormat={(t) => `${t}:00`} />
              <VictoryBar
                data={dailyPattern}
                x="hour"
                y="avg"
                style={{
                  data: { fill: '#4CAF50' },
                }}
              />
            </VictoryChart>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>暂无数据</Text>
            </View>
          )}
        </View>

        {/* 血糖分布 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>血糖分布</Text>
          <Text style={styles.cardSubtitle}>各范围读数分布</Text>
          {distributionData.length > 0 ? (
            <VictoryChart
              width={chartWidth}
              height={chartHeight}
              theme={VictoryTheme.material}
              padding={{ left: 80, top: 20, right: 20, bottom: 40 }}
            >
              <VictoryAxis dependentAxis tickFormat={(t) => `${t}`} />
              <VictoryAxis />
              <VictoryBar
                data={distributionData}
                x="x"
                y="y"
                horizontal
                style={{
                  data: { fill: '#2196F3' },
                }}
              />
            </VictoryChart>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>暂无数据</Text>
            </View>
          )}
        </View>

        {/* 趋势图 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>血糖趋势</Text>
          <Text style={styles.cardSubtitle}>最近12小时</Text>
          {glucoseData.length > 1 ? (
            <VictoryChart
              width={chartWidth}
              height={chartHeight}
              theme={VictoryTheme.material}
              padding={{ left: 40, top: 20, right: 20, bottom: 40 }}
            >
              <VictoryAxis dependentAxis tickFormat={(t) => `${t}`} />
              <VictoryAxis tickFormat={(t) => `${t.getHours()}:00`} />
              <VictoryArea
                data={glucoseData}
                style={{
                  data: { fill: '#4CAF50', fillOpacity: 0.3, stroke: '#4CAF50', strokeWidth: 2 },
                }}
                interpolation="natural"
              />
            </VictoryChart>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>暂无数据</Text>
            </View>
          )}
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
  card: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 16,
  },
  pieContainer: {
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#424242',
  },
  noDataContainer: {
    height: chartHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  noDataText: {
    color: '#9E9E9E',
    fontSize: 14,
  },
});
