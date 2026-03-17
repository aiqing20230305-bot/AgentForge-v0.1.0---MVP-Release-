/**
 * BI Engine - 前端BI数据处理引擎
 * 提供数据转换、计算、聚合等核心功能
 */

export interface DataPoint {
  [key: string]: any;
}

export interface Dimension {
  name: string;
  type: 'category' | 'time' | 'numeric';
  format?: string;
}

export interface Metric {
  name: string;
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct';
  format?: string;
}

export interface BiQuery {
  dimensions: string[];
  metrics: string[];
  filters?: Record<string, any>;
  timeRange?: { start: string; end: string };
  groupBy?: string[];
  orderBy?: string | { field: string; direction: 'asc' | 'desc' };
  limit?: number;
}

export class BiEngine {
  private dataCache: Map<string, any> = new Map();
  private calculatedFields: Map<string, Function> = new Map();

  /**
   * 执行查询
   */
  query(data: DataPoint[], query: BiQuery): DataPoint[] {
    let result = [...data];

    // 应用过滤器
    if (query.filters) {
      result = this.applyFilters(result, query.filters);
    }

    // 应用时间范围
    if (query.timeRange) {
      result = this.applyTimeRange(result, query.timeRange);
    }

    // 选择字段
    if (query.dimensions || query.metrics) {
      result = this.selectFields(result, query.dimensions, query.metrics);
    }

    // 分组和聚合
    if (query.groupBy && query.metrics) {
      result = this.groupAndAggregate(result, query.groupBy, query.metrics);
    }

    // 排序
    if (query.orderBy) {
      result = this.sort(result, query.orderBy);
    }

    // 限制数量
    if (query.limit) {
      result = result.slice(0, query.limit);
    }

    return result;
  }

  /**
   * 应用过滤器
   */
  private applyFilters(data: DataPoint[], filters: Record<string, any>): DataPoint[] {
    return data.filter(row => {
      return Object.entries(filters).every(([field, condition]) => {
        const value = row[field];

        if (Array.isArray(condition)) {
          return condition.includes(value);
        }

        if (typeof condition === 'object' && condition !== null) {
          // 范围过滤
          if ('min' in condition && value < condition.min) return false;
          if ('max' in condition && value > condition.max) return false;
          if ('eq' in condition && value !== condition.eq) return false;
          if ('ne' in condition && value === condition.ne) return false;
          if ('gt' in condition && value <= condition.gt) return false;
          if ('gte' in condition && value < condition.gte) return false;
          if ('lt' in condition && value >= condition.lt) return false;
          if ('lte' in condition && value > condition.lte) return false;
          if ('contains' in condition && !String(value).includes(condition.contains)) return false;
          return true;
        }

        return value === condition;
      });
    });
  }

  /**
   * 应用时间范围
   */
  private applyTimeRange(
    data: DataPoint[],
    timeRange: { start: string; end: string }
  ): DataPoint[] {
    const start = new Date(timeRange.start).getTime();
    const end = new Date(timeRange.end).getTime();

    return data.filter(row => {
      const timestamp = new Date(row.timestamp || row.date).getTime();
      return timestamp >= start && timestamp <= end;
    });
  }

  /**
   * 选择字段
   */
  private selectFields(
    data: DataPoint[],
    dimensions?: string[],
    metrics?: string[]
  ): DataPoint[] {
    if (!dimensions && !metrics) return data;

    const fields = [...(dimensions || []), ...(metrics || [])];

    return data.map(row => {
      const selected: DataPoint = {};
      fields.forEach(field => {
        if (field in row) {
          selected[field] = row[field];
        }
      });
      return selected;
    });
  }

  /**
   * 分组和聚合
   */
  private groupAndAggregate(
    data: DataPoint[],
    groupBy: string[],
    metrics: string[]
  ): DataPoint[] {
    const groups = new Map<string, DataPoint[]>();

    // 分组
    data.forEach(row => {
      const key = groupBy.map(field => row[field]).join('|');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    });

    // 聚合
    const result: DataPoint[] = [];
    groups.forEach((rows, key) => {
      const aggregated: DataPoint = {};

      // 保留分组字段
      groupBy.forEach((field, index) => {
        aggregated[field] = key.split('|')[index];
      });

      // 聚合指标
      metrics.forEach(metric => {
        const values = rows.map(r => r[metric]).filter(v => v != null);
        aggregated[metric] = this.aggregate(values, 'sum'); // 默认求和
      });

      result.push(aggregated);
    });

    return result;
  }

  /**
   * 聚合函数
   */
  aggregate(values: any[], method: string): number {
    const numbers = values.map(v => Number(v)).filter(n => !isNaN(n));

    if (numbers.length === 0) return 0;

    switch (method) {
      case 'sum':
        return numbers.reduce((a, b) => a + b, 0);
      case 'avg':
      case 'average':
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
      case 'min':
        return Math.min(...numbers);
      case 'max':
        return Math.max(...numbers);
      case 'count':
        return numbers.length;
      case 'distinct':
        return new Set(numbers).size;
      case 'median':
        const sorted = [...numbers].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      case 'stddev':
        const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const variance = numbers.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / numbers.length;
        return Math.sqrt(variance);
      default:
        return numbers.reduce((a, b) => a + b, 0);
    }
  }

  /**
   * 排序
   */
  private sort(
    data: DataPoint[],
    orderBy: string | { field: string; direction: 'asc' | 'desc' }
  ): DataPoint[] {
    const { field, direction } =
      typeof orderBy === 'string'
        ? { field: orderBy, direction: 'asc' as const }
        : orderBy;

    return [...data].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal === bVal) return 0;

      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * 数据透视
   */
  pivot(
    data: DataPoint[],
    rowFields: string[],
    columnFields: string[],
    valueField: string,
    aggregation: string = 'sum'
  ): any {
    const pivotTable: any = {};

    data.forEach(row => {
      const rowKey = rowFields.map(f => row[f]).join('|');
      const colKey = columnFields.map(f => row[f]).join('|');

      if (!pivotTable[rowKey]) {
        pivotTable[rowKey] = {};
      }

      if (!pivotTable[rowKey][colKey]) {
        pivotTable[rowKey][colKey] = [];
      }

      pivotTable[rowKey][colKey].push(row[valueField]);
    });

    // 聚合值
    Object.keys(pivotTable).forEach(rowKey => {
      Object.keys(pivotTable[rowKey]).forEach(colKey => {
        pivotTable[rowKey][colKey] = this.aggregate(
          pivotTable[rowKey][colKey],
          aggregation
        );
      });
    });

    return pivotTable;
  }

  /**
   * 计算同比/环比
   */
  calculateGrowth(
    data: DataPoint[],
    valueField: string,
    dateField: string = 'date',
    type: 'yoy' | 'mom' | 'qoq' = 'mom'
  ): DataPoint[] {
    const sorted = this.sort(data, dateField);
    let period: number;

    switch (type) {
      case 'yoy': // 同比（Year over Year）
        period = 12;
        break;
      case 'qoq': // 环比季度（Quarter over Quarter）
        period = 3;
        break;
      case 'mom': // 环比月度（Month over Month）
      default:
        period = 1;
        break;
    }

    return sorted.map((row, index) => {
      const current = row[valueField];
      const previous = index >= period ? sorted[index - period][valueField] : null;

      let growth = null;
      let growthRate = null;

      if (previous !== null && previous !== 0) {
        growth = current - previous;
        growthRate = ((current - previous) / previous) * 100;
      }

      return {
        ...row,
        [`${valueField}_previous`]: previous,
        [`${valueField}_growth`]: growth,
        [`${valueField}_growthRate`]: growthRate
      };
    });
  }

  /**
   * 移动平均
   */
  movingAverage(
    data: DataPoint[],
    valueField: string,
    window: number = 7
  ): DataPoint[] {
    return data.map((row, index) => {
      const start = Math.max(0, index - window + 1);
      const windowData = data.slice(start, index + 1);
      const values = windowData.map(r => r[valueField]);
      const ma = this.aggregate(values, 'avg');

      return {
        ...row,
        [`${valueField}_ma${window}`]: ma
      };
    });
  }

  /**
   * 累计值
   */
  cumulative(data: DataPoint[], valueField: string): DataPoint[] {
    let sum = 0;

    return data.map(row => {
      sum += row[valueField] || 0;
      return {
        ...row,
        [`${valueField}_cumulative`]: sum
      };
    });
  }

  /**
   * 百分比分布
   */
  percentageDistribution(data: DataPoint[], valueField: string): DataPoint[] {
    const total = this.aggregate(
      data.map(r => r[valueField]),
      'sum'
    );

    return data.map(row => ({
      ...row,
      [`${valueField}_percentage`]: total > 0 ? (row[valueField] / total) * 100 : 0
    }));
  }

  /**
   * 排名
   */
  rank(
    data: DataPoint[],
    valueField: string,
    descending: boolean = true
  ): DataPoint[] {
    const sorted = this.sort(data, {
      field: valueField,
      direction: descending ? 'desc' : 'asc'
    });

    return sorted.map((row, index) => ({
      ...row,
      [`${valueField}_rank`]: index + 1
    }));
  }

  /**
   * 异常检测
   */
  detectAnomalies(
    data: DataPoint[],
    valueField: string,
    threshold: number = 2
  ): DataPoint[] {
    const values = data.map(r => r[valueField]);
    const avg = this.aggregate(values, 'avg');
    const stddev = this.aggregate(values, 'stddev');

    return data.map(row => {
      const value = row[valueField];
      const zScore = Math.abs((value - avg) / stddev);
      const isAnomaly = zScore > threshold;

      return {
        ...row,
        [`${valueField}_zScore`]: zScore,
        [`${valueField}_isAnomaly`]: isAnomaly
      };
    });
  }

  /**
   * 添加计算字段
   */
  addCalculatedField(name: string, formula: Function): void {
    this.calculatedFields.set(name, formula);
  }

  /**
   * 应用计算字段
   */
  applyCalculatedFields(data: DataPoint[]): DataPoint[] {
    return data.map(row => {
      const calculated = { ...row };

      this.calculatedFields.forEach((formula, name) => {
        try {
          calculated[name] = formula(row);
        } catch (error) {
          console.error(`Error calculating field ${name}:`, error);
          calculated[name] = null;
        }
      });

      return calculated;
    });
  }

  /**
   * 数据抽样
   */
  sample(data: DataPoint[], sampleSize: number, method: 'random' | 'systematic' = 'random'): DataPoint[] {
    if (sampleSize >= data.length) return data;

    if (method === 'random') {
      const sampled = [];
      const indices = new Set<number>();

      while (indices.size < sampleSize) {
        indices.add(Math.floor(Math.random() * data.length));
      }

      indices.forEach(i => sampled.push(data[i]));
      return sampled;
    } else {
      // 系统抽样
      const step = data.length / sampleSize;
      const sampled = [];

      for (let i = 0; i < sampleSize; i++) {
        sampled.push(data[Math.floor(i * step)]);
      }

      return sampled;
    }
  }

  /**
   * 数据分箱
   */
  binning(
    data: DataPoint[],
    valueField: string,
    bins: number = 10
  ): DataPoint[] {
    const values = data.map(r => r[valueField]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / bins;

    return data.map(row => {
      const value = row[valueField];
      const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);

      return {
        ...row,
        [`${valueField}_bin`]: binIndex,
        [`${valueField}_binRange`]: `${(min + binIndex * binWidth).toFixed(2)}-${(min + (binIndex + 1) * binWidth).toFixed(2)}`
      };
    });
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.dataCache.clear();
  }
}

export default new BiEngine();
