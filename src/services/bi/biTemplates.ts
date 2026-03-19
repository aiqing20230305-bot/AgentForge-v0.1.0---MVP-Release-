/**
 * BI Dashboard Templates - 10+ 预定义仪表盘模板
 */

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  layout: any;
  widgets: any[];
  preview?: string;
}

export const BI_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'executive',
    name: 'Executive Dashboard',
    description: '高管视图：关键业务指标总览',
    category: 'management',
    thumbnail: '/templates/executive.png',
    layout: 'grid',
    widgets: [
      {
        type: 'kpi',
        title: 'Total Revenue',
        position: { x: 0, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'performance',
        query: { metrics: ['revenue'] },
        config: { format: 'currency', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Active Users',
        position: { x: 3, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'users',
        query: { metrics: ['activeUsers'] },
        config: { format: 'number', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Conversion Rate',
        position: { x: 6, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'performance',
        query: { metrics: ['conversionRate'] },
        config: { format: 'percentage', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Customer Satisfaction',
        position: { x: 9, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'performance',
        query: { metrics: ['satisfaction'] },
        config: { format: 'number', showTrend: true }
      },
      {
        type: 'line',
        title: 'Revenue Trend',
        position: { x: 0, y: 2 },
        size: { w: 6, h: 4 },
        dataSource: 'performance',
        query: { dimensions: ['date'], metrics: ['revenue'] },
        config: { showTrend: true, movingAverage: 7 }
      },
      {
        type: 'bar',
        title: 'Top Products',
        position: { x: 6, y: 2 },
        size: { w: 6, h: 4 },
        dataSource: 'performance',
        query: { dimensions: ['product'], metrics: ['sales'], limit: 10 },
        config: {}
      }
    ]
  },

  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: '深度分析：详细的数据洞察',
    category: 'analytics',
    thumbnail: '/templates/analytics.png',
    layout: 'grid',
    widgets: [
      {
        type: 'line',
        title: 'Traffic Overview',
        position: { x: 0, y: 0 },
        size: { w: 8, h: 4 },
        dataSource: 'analytics',
        query: { dimensions: ['date'], metrics: ['pageviews', 'visitors'] },
        config: { showTrend: true }
      },
      {
        type: 'pie',
        title: 'Traffic Sources',
        position: { x: 8, y: 0 },
        size: { w: 4, h: 4 },
        dataSource: 'analytics',
        query: { dimensions: ['source'], metrics: ['sessions'] },
        config: {}
      },
      {
        type: 'heatmap',
        title: 'Activity Heatmap',
        position: { x: 0, y: 4 },
        size: { w: 6, h: 4 },
        dataSource: 'analytics',
        query: { dimensions: ['day', 'hour'], metrics: ['activity'] },
        config: { showValues: true }
      },
      {
        type: 'scatter',
        title: 'Engagement vs Conversion',
        position: { x: 6, y: 4 },
        size: { w: 6, h: 4 },
        dataSource: 'analytics',
        query: { metrics: ['engagement', 'conversion'] },
        config: {}
      }
    ]
  },

  {
    id: 'operations',
    name: 'Operations Dashboard',
    description: '运营监控：实时系统状态',
    category: 'operations',
    thumbnail: '/templates/operations.png',
    layout: 'grid',
    widgets: [
      {
        type: 'gauge',
        title: 'System Health',
        position: { x: 0, y: 0 },
        size: { w: 3, h: 3 },
        dataSource: 'performance',
        query: { metrics: ['health'] },
        config: { unit: '%' }
      },
      {
        type: 'gauge',
        title: 'CPU Usage',
        position: { x: 3, y: 0 },
        size: { w: 3, h: 3 },
        dataSource: 'performance',
        query: { metrics: ['cpu'] },
        config: { unit: '%' }
      },
      {
        type: 'gauge',
        title: 'Memory Usage',
        position: { x: 6, y: 0 },
        size: { w: 3, h: 3 },
        dataSource: 'performance',
        query: { metrics: ['memory'] },
        config: { unit: '%' }
      },
      {
        type: 'gauge',
        title: 'Disk Usage',
        position: { x: 9, y: 0 },
        size: { w: 3, h: 3 },
        dataSource: 'performance',
        query: { metrics: ['disk'] },
        config: { unit: '%' }
      },
      {
        type: 'line',
        title: 'Response Time',
        position: { x: 0, y: 3 },
        size: { w: 12, h: 4 },
        dataSource: 'performance',
        query: { dimensions: ['timestamp'], metrics: ['responseTime'] },
        config: { realtime: true }
      }
    ]
  },

  {
    id: 'sales',
    name: 'Sales Dashboard',
    description: '销售追踪：销售业绩和管道',
    category: 'sales',
    thumbnail: '/templates/sales.png',
    layout: 'grid',
    widgets: [
      {
        type: 'kpi',
        title: 'Monthly Sales',
        position: { x: 0, y: 0 },
        size: { w: 4, h: 2 },
        dataSource: 'sales',
        query: { metrics: ['monthlySales'] },
        config: { format: 'currency', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Deals Closed',
        position: { x: 4, y: 0 },
        size: { w: 4, h: 2 },
        dataSource: 'sales',
        query: { metrics: ['dealsClosedCount'] },
        config: { format: 'number', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Win Rate',
        position: { x: 8, y: 0 },
        size: { w: 4, h: 2 },
        dataSource: 'sales',
        query: { metrics: ['winRate'] },
        config: { format: 'percentage', showTrend: true }
      },
      {
        type: 'bar',
        title: 'Sales by Region',
        position: { x: 0, y: 2 },
        size: { w: 6, h: 4 },
        dataSource: 'sales',
        query: { dimensions: ['region'], metrics: ['sales'] },
        config: {}
      },
      {
        type: 'line',
        title: 'Sales Forecast',
        position: { x: 6, y: 2 },
        size: { w: 6, h: 4 },
        dataSource: 'sales',
        query: { dimensions: ['date'], metrics: ['sales', 'forecast'] },
        config: { showTrend: true }
      }
    ]
  },

  {
    id: 'marketing',
    name: 'Marketing Dashboard',
    description: '营销分析：营销活动效果',
    category: 'marketing',
    thumbnail: '/templates/marketing.png',
    layout: 'grid',
    widgets: [
      {
        type: 'kpi',
        title: 'Campaign ROI',
        position: { x: 0, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'marketing',
        query: { metrics: ['roi'] },
        config: { format: 'percentage', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Leads Generated',
        position: { x: 3, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'marketing',
        query: { metrics: ['leads'] },
        config: { format: 'number', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Cost Per Lead',
        position: { x: 6, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'marketing',
        query: { metrics: ['cpl'] },
        config: { format: 'currency', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Email Open Rate',
        position: { x: 9, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'marketing',
        query: { metrics: ['emailOpenRate'] },
        config: { format: 'percentage', showTrend: true }
      },
      {
        type: 'pie',
        title: 'Lead Sources',
        position: { x: 0, y: 2 },
        size: { w: 4, h: 4 },
        dataSource: 'marketing',
        query: { dimensions: ['source'], metrics: ['leads'] },
        config: {}
      },
      {
        type: 'bar',
        title: 'Campaign Performance',
        position: { x: 4, y: 2 },
        size: { w: 8, h: 4 },
        dataSource: 'marketing',
        query: { dimensions: ['campaign'], metrics: ['conversions'] },
        config: {}
      }
    ]
  },

  {
    id: 'customer',
    name: 'Customer Analytics',
    description: '客户洞察：客户行为分析',
    category: 'customer',
    thumbnail: '/templates/customer.png',
    layout: 'grid',
    widgets: [
      {
        type: 'kpi',
        title: 'Customer Lifetime Value',
        position: { x: 0, y: 0 },
        size: { w: 4, h: 2 },
        dataSource: 'customers',
        query: { metrics: ['ltv'] },
        config: { format: 'currency', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Churn Rate',
        position: { x: 4, y: 0 },
        size: { w: 4, h: 2 },
        dataSource: 'customers',
        query: { metrics: ['churnRate'] },
        config: { format: 'percentage', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'NPS Score',
        position: { x: 8, y: 0 },
        size: { w: 4, h: 2 },
        dataSource: 'customers',
        query: { metrics: ['nps'] },
        config: { format: 'number', showTrend: true }
      },
      {
        type: 'scatter',
        title: 'Customer Segmentation',
        position: { x: 0, y: 2 },
        size: { w: 6, h: 4 },
        dataSource: 'customers',
        query: { metrics: ['recency', 'frequency', 'monetary'] },
        config: {}
      },
      {
        type: 'area',
        title: 'Customer Growth',
        position: { x: 6, y: 2 },
        size: { w: 6, h: 4 },
        dataSource: 'customers',
        query: { dimensions: ['date'], metrics: ['newCustomers', 'totalCustomers'] },
        config: {}
      }
    ]
  },

  {
    id: 'financial',
    name: 'Financial Dashboard',
    description: '财务概览：财务指标和预测',
    category: 'finance',
    thumbnail: '/templates/financial.png',
    layout: 'grid',
    widgets: [
      {
        type: 'kpi',
        title: 'Total Revenue',
        position: { x: 0, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'finance',
        query: { metrics: ['revenue'] },
        config: { format: 'currency', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Net Profit',
        position: { x: 3, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'finance',
        query: { metrics: ['netProfit'] },
        config: { format: 'currency', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Operating Margin',
        position: { x: 6, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'finance',
        query: { metrics: ['operatingMargin'] },
        config: { format: 'percentage', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Cash Flow',
        position: { x: 9, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'finance',
        query: { metrics: ['cashFlow'] },
        config: { format: 'currency', showTrend: true }
      },
      {
        type: 'line',
        title: 'Revenue & Expenses',
        position: { x: 0, y: 2 },
        size: { w: 8, h: 4 },
        dataSource: 'finance',
        query: { dimensions: ['date'], metrics: ['revenue', 'expenses'] },
        config: { showTrend: true }
      },
      {
        type: 'pie',
        title: 'Expense Breakdown',
        position: { x: 8, y: 2 },
        size: { w: 4, h: 4 },
        dataSource: 'finance',
        query: { dimensions: ['category'], metrics: ['expenses'] },
        config: {}
      }
    ]
  },

  {
    id: 'product',
    name: 'Product Analytics',
    description: '产品指标：产品使用和性能',
    category: 'product',
    thumbnail: '/templates/product.png',
    layout: 'grid',
    widgets: [
      {
        type: 'kpi',
        title: 'Daily Active Users',
        position: { x: 0, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'product',
        query: { metrics: ['dau'] },
        config: { format: 'number', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Session Duration',
        position: { x: 3, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'product',
        query: { metrics: ['sessionDuration'] },
        config: { format: 'time', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Feature Adoption',
        position: { x: 6, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'product',
        query: { metrics: ['featureAdoption'] },
        config: { format: 'percentage', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Crash Rate',
        position: { x: 9, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'product',
        query: { metrics: ['crashRate'] },
        config: { format: 'percentage', showTrend: true }
      },
      {
        type: 'line',
        title: 'User Engagement',
        position: { x: 0, y: 2 },
        size: { w: 6, h: 4 },
        dataSource: 'product',
        query: { dimensions: ['date'], metrics: ['engagement'] },
        config: {}
      },
      {
        type: 'bar',
        title: 'Feature Usage',
        position: { x: 6, y: 2 },
        size: { w: 6, h: 4 },
        dataSource: 'product',
        query: { dimensions: ['feature'], metrics: ['usage'] },
        config: {}
      }
    ]
  },

  {
    id: 'social',
    name: 'Social Media Dashboard',
    description: '社交媒体：社交平台表现',
    category: 'social',
    thumbnail: '/templates/social.png',
    layout: 'grid',
    widgets: [
      {
        type: 'kpi',
        title: 'Total Followers',
        position: { x: 0, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'social',
        query: { metrics: ['followers'] },
        config: { format: 'compact', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Engagement Rate',
        position: { x: 3, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'social',
        query: { metrics: ['engagementRate'] },
        config: { format: 'percentage', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Post Reach',
        position: { x: 6, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'social',
        query: { metrics: ['reach'] },
        config: { format: 'compact', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Mentions',
        position: { x: 9, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'social',
        query: { metrics: ['mentions'] },
        config: { format: 'number', showTrend: true }
      },
      {
        type: 'line',
        title: 'Follower Growth',
        position: { x: 0, y: 2 },
        size: { w: 6, h: 4 },
        dataSource: 'social',
        query: { dimensions: ['date'], metrics: ['followers'] },
        config: {}
      },
      {
        type: 'pie',
        title: 'Content Performance',
        position: { x: 6, y: 2 },
        size: { w: 6, h: 4 },
        dataSource: 'social',
        query: { dimensions: ['contentType'], metrics: ['engagement'] },
        config: {}
      }
    ]
  },

  {
    id: 'hr',
    name: 'HR Dashboard',
    description: '人力资源：员工和招聘指标',
    category: 'hr',
    thumbnail: '/templates/hr.png',
    layout: 'grid',
    widgets: [
      {
        type: 'kpi',
        title: 'Total Employees',
        position: { x: 0, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'hr',
        query: { metrics: ['employees'] },
        config: { format: 'number', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Attrition Rate',
        position: { x: 3, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'hr',
        query: { metrics: ['attritionRate'] },
        config: { format: 'percentage', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Open Positions',
        position: { x: 6, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'hr',
        query: { metrics: ['openPositions'] },
        config: { format: 'number', showTrend: true }
      },
      {
        type: 'kpi',
        title: 'Employee Satisfaction',
        position: { x: 9, y: 0 },
        size: { w: 3, h: 2 },
        dataSource: 'hr',
        query: { metrics: ['satisfaction'] },
        config: { format: 'number', showTrend: true }
      },
      {
        type: 'bar',
        title: 'Headcount by Department',
        position: { x: 0, y: 2 },
        size: { w: 6, h: 4 },
        dataSource: 'hr',
        query: { dimensions: ['department'], metrics: ['headcount'] },
        config: {}
      },
      {
        type: 'line',
        title: 'Hiring Trend',
        position: { x: 6, y: 2 },
        size: { w: 6, h: 4 },
        dataSource: 'hr',
        query: { dimensions: ['date'], metrics: ['hires'] },
        config: {}
      }
    ]
  }
];

/**
 * 获取模板
 */
export function getTemplate(templateId: string): DashboardTemplate | undefined {
  return BI_TEMPLATES.find(t => t.id === templateId);
}

/**
 * 获取分类模板
 */
export function getTemplatesByCategory(category: string): DashboardTemplate[] {
  return BI_TEMPLATES.filter(t => t.category === category);
}

/**
 * 获取所有分类
 */
export function getCategories(): string[] {
  return Array.from(new Set(BI_TEMPLATES.map(t => t.category)));
}
