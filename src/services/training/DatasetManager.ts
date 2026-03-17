/**
 * 数据集管理器
 * 负责数据集的创建、标注、版本控制和管理
 */

export interface DataPoint {
  id: string;
  input: string;
  output: string;
  metadata: {
    source: string;
    timestamp: number;
    quality: number;
    tags: string[];
    annotations?: Annotation[];
  };
}

export interface Annotation {
  id: string;
  annotator: string;
  timestamp: number;
  type: 'classification' | 'entity' | 'sentiment' | 'quality';
  value: any;
  confidence: number;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  version: string;
  createdAt: number;
  updatedAt: number;
  dataPoints: DataPoint[];
  statistics: DatasetStatistics;
  splits: {
    train: number; // 百分比
    validation: number;
    test: number;
  };
  metadata: {
    source: string;
    domain: string;
    language: string;
    tags: string[];
  };
}

export interface DatasetStatistics {
  totalSamples: number;
  avgInputLength: number;
  avgOutputLength: number;
  qualityDistribution: Record<string, number>;
  tagDistribution: Record<string, number>;
}

export interface DatasetVersion {
  version: string;
  timestamp: number;
  changes: string;
  datasetId: string;
}

class DatasetManager {
  private datasets: Map<string, Dataset> = new Map();
  private versions: Map<string, DatasetVersion[]> = new Map();

  /**
   * 创建新数据集
   */
  createDataset(
    name: string,
    description: string,
    metadata: Dataset['metadata']
  ): Dataset {
    const dataset: Dataset = {
      id: this.generateId(),
      name,
      description,
      version: '1.0.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dataPoints: [],
      statistics: {
        totalSamples: 0,
        avgInputLength: 0,
        avgOutputLength: 0,
        qualityDistribution: {},
        tagDistribution: {},
      },
      splits: {
        train: 80,
        validation: 10,
        test: 10,
      },
      metadata,
    };

    this.datasets.set(dataset.id, dataset);
    this.versions.set(dataset.id, [{
      version: '1.0.0',
      timestamp: Date.now(),
      changes: 'Initial version',
      datasetId: dataset.id,
    }]);

    return dataset;
  }

  /**
   * 添加数据点
   */
  addDataPoint(datasetId: string, dataPoint: Omit<DataPoint, 'id'>): DataPoint {
    const dataset = this.datasets.get(datasetId);
    if (!dataset) {
      throw new Error(`Dataset ${datasetId} not found`);
    }

    const newDataPoint: DataPoint = {
      ...dataPoint,
      id: this.generateId(),
    };

    dataset.dataPoints.push(newDataPoint);
    dataset.updatedAt = Date.now();
    this.updateStatistics(dataset);

    return newDataPoint;
  }

  /**
   * 批量添加数据点
   */
  addDataPointsBatch(
    datasetId: string,
    dataPoints: Omit<DataPoint, 'id'>[]
  ): DataPoint[] {
    const dataset = this.datasets.get(datasetId);
    if (!dataset) {
      throw new Error(`Dataset ${datasetId} not found`);
    }

    const newDataPoints = dataPoints.map(dp => ({
      ...dp,
      id: this.generateId(),
    }));

    dataset.dataPoints.push(...newDataPoints);
    dataset.updatedAt = Date.now();
    this.updateStatistics(dataset);

    return newDataPoints;
  }

  /**
   * 标注数据点
   */
  annotateDataPoint(
    datasetId: string,
    dataPointId: string,
    annotation: Omit<Annotation, 'id' | 'timestamp'>
  ): Annotation {
    const dataset = this.datasets.get(datasetId);
    if (!dataset) {
      throw new Error(`Dataset ${datasetId} not found`);
    }

    const dataPoint = dataset.dataPoints.find(dp => dp.id === dataPointId);
    if (!dataPoint) {
      throw new Error(`DataPoint ${dataPointId} not found`);
    }

    const newAnnotation: Annotation = {
      ...annotation,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    if (!dataPoint.metadata.annotations) {
      dataPoint.metadata.annotations = [];
    }
    dataPoint.metadata.annotations.push(newAnnotation);
    dataset.updatedAt = Date.now();

    return newAnnotation;
  }

  /**
   * 更新数据点质量评分
   */
  updateQuality(datasetId: string, dataPointId: string, quality: number): void {
    const dataset = this.datasets.get(datasetId);
    if (!dataset) {
      throw new Error(`Dataset ${datasetId} not found`);
    }

    const dataPoint = dataset.dataPoints.find(dp => dp.id === dataPointId);
    if (!dataPoint) {
      throw new Error(`DataPoint ${dataPointId} not found`);
    }

    dataPoint.metadata.quality = Math.max(0, Math.min(1, quality));
    dataset.updatedAt = Date.now();
    this.updateStatistics(dataset);
  }

  /**
   * 数据集分割
   */
  splitDataset(
    datasetId: string,
    splits: { train: number; validation: number; test: number }
  ): {
    train: DataPoint[];
    validation: DataPoint[];
    test: DataPoint[];
  } {
    const dataset = this.datasets.get(datasetId);
    if (!dataset) {
      throw new Error(`Dataset ${datasetId} not found`);
    }

    // 验证分割比例
    const total = splits.train + splits.validation + splits.test;
    if (Math.abs(total - 100) > 0.01) {
      throw new Error('Split percentages must sum to 100');
    }

    dataset.splits = splits;

    // 随机打乱数据
    const shuffled = [...dataset.dataPoints].sort(() => Math.random() - 0.5);

    const trainSize = Math.floor((splits.train / 100) * shuffled.length);
    const validSize = Math.floor((splits.validation / 100) * shuffled.length);

    return {
      train: shuffled.slice(0, trainSize),
      validation: shuffled.slice(trainSize, trainSize + validSize),
      test: shuffled.slice(trainSize + validSize),
    };
  }

  /**
   * 创建数据集版本
   */
  createVersion(datasetId: string, changes: string): DatasetVersion {
    const dataset = this.datasets.get(datasetId);
    if (!dataset) {
      throw new Error(`Dataset ${datasetId} not found`);
    }

    const currentVersion = dataset.version;
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    const newVersion = `${major}.${minor}.${patch + 1}`;

    dataset.version = newVersion;
    dataset.updatedAt = Date.now();

    const version: DatasetVersion = {
      version: newVersion,
      timestamp: Date.now(),
      changes,
      datasetId,
    };

    const versions = this.versions.get(datasetId) || [];
    versions.push(version);
    this.versions.set(datasetId, versions);

    return version;
  }

  /**
   * 获取数据集版本历史
   */
  getVersionHistory(datasetId: string): DatasetVersion[] {
    return this.versions.get(datasetId) || [];
  }

  /**
   * 导出数据集
   */
  exportDataset(
    datasetId: string,
    format: 'json' | 'jsonl' | 'csv'
  ): string {
    const dataset = this.datasets.get(datasetId);
    if (!dataset) {
      throw new Error(`Dataset ${datasetId} not found`);
    }

    switch (format) {
      case 'json':
        return JSON.stringify(dataset, null, 2);

      case 'jsonl':
        return dataset.dataPoints
          .map(dp => JSON.stringify(dp))
          .join('\n');

      case 'csv':
        const headers = 'id,input,output,quality,tags\n';
        const rows = dataset.dataPoints
          .map(dp =>
            `"${dp.id}","${this.escapeCsv(dp.input)}","${this.escapeCsv(dp.output)}",${dp.metadata.quality},"${dp.metadata.tags.join(';')}"`
          )
          .join('\n');
        return headers + rows;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * 导入数据集
   */
  importDataset(
    name: string,
    data: string,
    format: 'json' | 'jsonl' | 'csv',
    metadata: Dataset['metadata']
  ): Dataset {
    let dataPoints: Omit<DataPoint, 'id'>[] = [];

    switch (format) {
      case 'json':
        const parsed = JSON.parse(data);
        dataPoints = Array.isArray(parsed) ? parsed : parsed.dataPoints || [];
        break;

      case 'jsonl':
        dataPoints = data
          .split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));
        break;

      case 'csv':
        const lines = data.split('\n').slice(1); // Skip header
        dataPoints = lines
          .filter(line => line.trim())
          .map(line => {
            const [id, input, output, quality, tags] = this.parseCsvLine(line);
            return {
              input,
              output,
              metadata: {
                source: 'import',
                timestamp: Date.now(),
                quality: parseFloat(quality) || 0,
                tags: tags.split(';').filter(Boolean),
              },
            };
          });
        break;
    }

    const dataset = this.createDataset(name, `Imported from ${format}`, metadata);
    this.addDataPointsBatch(dataset.id, dataPoints);

    return dataset;
  }

  /**
   * 过滤数据集
   */
  filterDataset(
    datasetId: string,
    filters: {
      minQuality?: number;
      tags?: string[];
      search?: string;
    }
  ): DataPoint[] {
    const dataset = this.datasets.get(datasetId);
    if (!dataset) {
      throw new Error(`Dataset ${datasetId} not found`);
    }

    let filtered = dataset.dataPoints;

    if (filters.minQuality !== undefined) {
      filtered = filtered.filter(dp => dp.metadata.quality >= filters.minQuality!);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(dp =>
        filters.tags!.some(tag => dp.metadata.tags.includes(tag))
      );
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(dp =>
        dp.input.toLowerCase().includes(search) ||
        dp.output.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  /**
   * 获取数据集
   */
  getDataset(datasetId: string): Dataset | undefined {
    return this.datasets.get(datasetId);
  }

  /**
   * 获取所有数据集
   */
  getAllDatasets(): Dataset[] {
    return Array.from(this.datasets.values());
  }

  /**
   * 删除数据集
   */
  deleteDataset(datasetId: string): boolean {
    const deleted = this.datasets.delete(datasetId);
    if (deleted) {
      this.versions.delete(datasetId);
    }
    return deleted;
  }

  /**
   * 更新统计信息
   */
  private updateStatistics(dataset: Dataset): void {
    const stats = dataset.statistics;
    stats.totalSamples = dataset.dataPoints.length;

    if (stats.totalSamples === 0) {
      stats.avgInputLength = 0;
      stats.avgOutputLength = 0;
      stats.qualityDistribution = {};
      stats.tagDistribution = {};
      return;
    }

    // 计算平均长度
    const totalInputLength = dataset.dataPoints.reduce(
      (sum, dp) => sum + dp.input.length,
      0
    );
    const totalOutputLength = dataset.dataPoints.reduce(
      (sum, dp) => sum + dp.output.length,
      0
    );

    stats.avgInputLength = totalInputLength / stats.totalSamples;
    stats.avgOutputLength = totalOutputLength / stats.totalSamples;

    // 质量分布
    stats.qualityDistribution = {};
    dataset.dataPoints.forEach(dp => {
      const qualityBucket = Math.floor(dp.metadata.quality * 10) / 10;
      const key = qualityBucket.toFixed(1);
      stats.qualityDistribution[key] = (stats.qualityDistribution[key] || 0) + 1;
    });

    // 标签分布
    stats.tagDistribution = {};
    dataset.dataPoints.forEach(dp => {
      dp.metadata.tags.forEach(tag => {
        stats.tagDistribution[tag] = (stats.tagDistribution[tag] || 0) + 1;
      });
    });
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * CSV转义
   */
  private escapeCsv(str: string): string {
    return str.replace(/"/g, '""');
  }

  /**
   * 解析CSV行
   */
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }
}

export const datasetManager = new DatasetManager();
