/**
 * 训练服务导出
 */

export * from './DatasetManager';
export * from './TrainingEngine';
export * from './EvaluationSystem';
export * from './DeploymentManager';

// 导出单例实例
export { datasetManager } from './DatasetManager';
export { trainingEngine } from './TrainingEngine';
export { evaluationSystem } from './EvaluationSystem';
export { deploymentManager } from './DeploymentManager';
