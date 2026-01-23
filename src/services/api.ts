// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Types for API responses
export interface OverviewData {
  uptime: string;
  qps: number;
  tps: number;
  cpu: number;
  avgQueryTime: number;
  operations: {
    select: number;
    insert: number;
    update: number;
    delete: number;
  };
}

export interface ClusterActivityData {
  timestamps: string[];
  qps: number[];
  tps: number[];
}

export interface SlowQuery {
  query: string;
  calls: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
}

export interface ResourcesData {
  connections: {
    active: number;
    idle: number;
    total: number;
    maxConnections: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  cacheHitRatio: number;
}

export interface ReliabilityData {
  replication: {
    status: string;
    lag: number;
    syncState: string;
  };
  deadlocks: number;
  wal: {
    size: number;
    rate: number;
  };
}

export interface IndexData {
  unusedIndexes: Array<{
    indexName: string;
    tableName: string;
    size: string;
    scans: number;
  }>;
  missingIndexes: Array<{
    tableName: string;
    reason: string;
    impact: string;
  }>;
}

// API Client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  }

  // Overview endpoint
  async getOverview(): Promise<OverviewData> {
    return this.fetch<OverviewData>('/api/overview');
  }

  // Performance endpoints
  async getClusterActivity(): Promise<ClusterActivityData> {
    return this.fetch<ClusterActivityData>('/api/performance/cluster-activity');
  }

  async getSlowQueries(): Promise<SlowQuery[]> {
    return this.fetch<SlowQuery[]>('/api/performance/slow-queries');
  }

  // Resources endpoint
  async getResources(): Promise<ResourcesData> {
    return this.fetch<ResourcesData>('/api/resources');
  }

  // Reliability endpoint
  async getReliability(): Promise<ReliabilityData> {
    return this.fetch<ReliabilityData>('/api/reliability');
  }

  // Indexes endpoint
  async getIndexes(): Promise<IndexData> {
    return this.fetch<IndexData>('/api/indexes');
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.fetch('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual functions for convenience
export const {
  getOverview,
  getClusterActivity,
  getSlowQueries,
  getResources,
  getReliability,
  getIndexes,
  healthCheck,
} = apiClient;
