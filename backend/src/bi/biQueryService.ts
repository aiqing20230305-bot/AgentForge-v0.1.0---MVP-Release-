/**
 * BI Query Service - 多维数据分析服务
 * 支持：切片(Slice)、切块(Dice)、上钻(Roll-up)、下钻(Drill-down)
 */
export class BiQueryService {
  private dataCache: Map<string, any> = new Map();

  /**
   * 执行多维查询
   */
  async executeQuery(query: any) {
    const {
      dimensions,
      metrics,
      filters,
      timeRange,
      groupBy,
      orderBy,
      limit
    } = query;

    // 构建查询
    let data = await this.fetchData(dimensions, metrics, timeRange);

    // 应用过滤器
    if (filters && Object.keys(filters).length > 0) {
      data = this.applyFilters(data, filters);
    }

    // 分组
    if (groupBy) {
      data = this.groupData(data, groupBy);
    }

    // 排序
    if (orderBy) {
      data = this.sortData(data, orderBy);
    }

    // 限制结果数量
    if (limit) {
      data = data.slice(0, limit);
    }

    return {
      data,
      meta: {
        total: data.length,
        dimensions,
        metrics,
        executionTime: Math.floor(Math.random() * 100)
      }
    };
  }

  /**
   * 切片 - 选择一个维度的特定值
   */
  async slice(dimension: string, value: any, metrics: string[]) {
    const data = await this.fetchData([dimension], metrics);

    const slicedData = data.filter((row: any) => row[dimension] === value);

    return {
      dimension,
      value,
      data: slicedData,
      count: slicedData.length
    };
  }

  /**
   * 切块 - 选择多个维度的特定值
   */
  async dice(dimensions: string[], values: any, metrics: string[]) {
    const data = await this.fetchData(dimensions, metrics);

    const dicedData = data.filter((row: any) => {
      return dimensions.every((dim, index) =>
        !values[dim] || row[dim] === values[dim]
      );
    });

    return {
      dimensions,
      values,
      data: dicedData,
      count: dicedData.length
    };
  }

  /**
   * 上钻 - 从详细数据聚合到更高层次
   */
  async rollUp(dimension: string, aggregation: string, metrics: string[]) {
    const data = await this.fetchData([dimension], metrics);

    const grouped = this.groupBy(data, dimension);
    const rolledUp = Object.keys(grouped).map(key => {
      const group = grouped[key];
      const result: any = { [dimension]: key };

      metrics.forEach(metric => {
        result[metric] = this.aggregate(
          group.map((row: any) => row[metric]),
          aggregation
        );
      });

      return result;
    });

    return {
      dimension,
      aggregation,
      data: rolledUp,
      originalCount: data.length,
      aggregatedCount: rolledUp.length
    };
  }

  /**
   * 下钻 - 从汇总数据展开到更详细层次
   */
  async drillDown(
    dimension: string,
    value: any,
    childDimension: string,
    metrics: string[]
  ) {
    // 首先获取父级数据
    const parentData = await this.slice(dimension, value, metrics);

    // 然后按子维度分组
    const data = await this.fetchData([dimension, childDimension], metrics);
    const filtered = data.filter((row: any) => row[dimension] === value);

    const grouped = this.groupBy(filtered, childDimension);
    const drilledDown = Object.keys(grouped).map(key => {
      const group = grouped[key];
      const result: any = {
        [dimension]: value,
        [childDimension]: key
      };

      metrics.forEach(metric => {
        result[metric] = this.aggregate(
          group.map((row: any) => row[metric]),
          'sum'
        );
      });

      return result;
    });

    return {
      parent: {
        dimension,
        value,
        summary: parentData
      },
      child: {
        dimension: childDimension,
        data: drilledDown
      }
    };
  }

  /**
   * 获取数据
   */
  private async fetchData(dimensions: string[], metrics: string[], timeRange?: any) {
    // 生成缓存键
    const cacheKey = `${dimensions.join(',')}_${metrics.join(',')}_${JSON.stringify(timeRange)}`;

    // 检查缓存
    if (this.dataCache.has(cacheKey)) {
      return this.dataCache.get(cacheKey);
    }

    // 生成模拟数据
    const data = this.generateMockData(dimensions, metrics, 100);

    // 缓存数据
    this.dataCache.set(cacheKey, data);

    return data;
  }

  /**
   * 生成模拟数据
   */
  private generateMockData(dimensions: string[], metrics: string[], count: number) {
    const data = [];

    const dimensionValues: any = {
      region: ['North', 'South', 'East', 'West'],
      product: ['Product A', 'Product B', 'Product C', 'Product D'],
      category: ['Category 1', 'Category 2', 'Category 3'],
      channel: ['Online', 'Retail', 'Partner'],
      segment: ['Enterprise', 'SMB', 'Consumer']
    };

    for (let i = 0; i < count; i++) {
      const row: any = {};

      dimensions.forEach(dim => {
        if (dimensionValues[dim]) {
          row[dim] = dimensionValues[dim][
            Math.floor(Math.random() * dimensionValues[dim].length)
          ];
        } else {
          row[dim] = `${dim}_${Math.floor(Math.random() * 10)}`;
        }
      });

      metrics.forEach(metric => {
        row[metric] = Math.floor(Math.random() * 10000);
      });

      data.push(row);
    }

    return data;
  }

  /**
   * 应用过滤器
   */
  private applyFilters(data: any[], filters: any) {
    return data.filter(row => {
      return Object.keys(filters).every(key => {
        const filter = filters[key];

        if (Array.isArray(filter)) {
          return filter.includes(row[key]);
        }

        if (typeof filter === 'object') {
          // 支持范围过滤
          if (filter.min !== undefined && row[key] < filter.min) {
            return false;
          }
          if (filter.max !== undefined && row[key] > filter.max) {
            return false;
          }
          return true;
        }

        return row[key] === filter;
      });
    });
  }

  /**
   * 分组数据
   */
  private groupData(data: any[], groupBy: string | string[]) {
    const keys = Array.isArray(groupBy) ? groupBy : [groupBy];
    const grouped: any = {};

    data.forEach(row => {
      const groupKey = keys.map(key => row[key]).join('|');

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }

      grouped[groupKey].push(row);
    });

    return Object.keys(grouped).map(key => {
      const group = grouped[key];
      const result: any = {};

      // 保留分组键
      keys.forEach((k, i) => {
        result[k] = key.split('|')[i];
      });

      // 聚合其他字段
      const firstRow = group[0];
      Object.keys(firstRow).forEach(field => {
        if (!keys.includes(field)) {
          if (typeof firstRow[field] === 'number') {
            result[field] = this.aggregate(
              group.map((r: any) => r[field]),
              'sum'
            );
          } else {
            result[field] = firstRow[field];
          }
        }
      });

      return result;
    });
  }

  /**
   * 排序数据
   */
  private sortData(data: any[], orderBy: any) {
    const { field, direction = 'asc' } =
      typeof orderBy === 'string'
        ? { field: orderBy, direction: 'asc' }
        : orderBy;

    return [...data].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal === bVal) return 0;

      const comparison = aVal > bVal ? 1 : -1;
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * 分组辅助函数
   */
  private groupBy(data: any[], key: string) {
    return data.reduce((groups: any, item: any) => {
      const groupKey = item[key];
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {});
  }

  /**
   * 聚合函数
   */
  private aggregate(values: number[], method: string): number {
    switch (method) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
      case 'average':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'count':
        return values.length;
      case 'median':
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      default:
        return values.reduce((a, b) => a + b, 0);
    }
  }

  /**
   * 执行OLAP操作
   */
  async executeOLAP(operation: string, params: any) {
    switch (operation) {
      case 'slice':
        return this.slice(params.dimension, params.value, params.metrics);
      case 'dice':
        return this.dice(params.dimensions, params.values, params.metrics);
      case 'rollup':
        return this.rollUp(params.dimension, params.aggregation, params.metrics);
      case 'drilldown':
        return this.drillDown(
          params.dimension,
          params.value,
          params.childDimension,
          params.metrics
        );
      default:
        throw new Error(`Unknown OLAP operation: ${operation}`);
    }
  }

  /**
   * 透视表查询
   */
  async pivotTable(config: any) {
    const { rows, columns, values, aggregation = 'sum' } = config;

    const data = await this.fetchData(
      [...rows, ...columns],
      values
    );

    // 构建透视表
    const pivot: any = {};

    data.forEach((row: any) => {
      const rowKey = rows.map((r: string) => row[r]).join('|');
      const colKey = columns.map((c: string) => row[c]).join('|');

      if (!pivot[rowKey]) {
        pivot[rowKey] = {};
      }

      if (!pivot[rowKey][colKey]) {
        pivot[rowKey][colKey] = [];
      }

      values.forEach((value: string) => {
        pivot[rowKey][colKey].push(row[value]);
      });
    });

    // 聚合值
    Object.keys(pivot).forEach(rowKey => {
      Object.keys(pivot[rowKey]).forEach(colKey => {
        pivot[rowKey][colKey] = this.aggregate(
          pivot[rowKey][colKey],
          aggregation
        );
      });
    });

    return {
      rows: Object.keys(pivot),
      columns: columns,
      data: pivot,
      aggregation
    };
  }

  /**
   * 数据立方体查询
   */
  async dataCube(dimensions: string[], metrics: string[]) {
    const data = await this.fetchData(dimensions, metrics);

    // 生成所有可能的维度组合
    const combinations = this.generateCombinations(dimensions);

    const cube: any = {};

    for (const combo of combinations) {
      const key = combo.join(',') || 'total';
      cube[key] = this.groupData(
        data,
        combo.length > 0 ? combo : dimensions
      );
    }

    return {
      dimensions,
      metrics,
      cube,
      combinations: combinations.length
    };
  }

  /**
   * 生成维度组合
   */
  private generateCombinations(arr: string[]): string[][] {
    const result: string[][] = [[]];

    for (const item of arr) {
      const len = result.length;
      for (let i = 0; i < len; i++) {
        result.push([...result[i], item]);
      }
    }

    return result;
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.dataCache.clear();
  }
}
