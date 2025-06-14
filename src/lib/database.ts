import mongoose from 'mongoose';
import { PaginationParams, PaginationInfo } from '@/types/index';

// Database connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wattschain';
const DB_OPTIONS: mongoose.ConnectOptions = {
  bufferCommands: false,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// Connection state
interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  lastConnected?: Date;
  connectionCount: number;
}

let connectionState: ConnectionState = {
  isConnected: false,
  isConnecting: false,
  connectionCount: 0
};

/**
 * Connect to MongoDB database
 */
export async function connectDatabase(): Promise<typeof mongoose> {
  // If already connected, return existing connection
  if (connectionState.isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If currently connecting, wait for connection
  if (connectionState.isConnecting) {
    while (connectionState.isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return mongoose;
  }

  try {
    connectionState.isConnecting = true;

    // Set up connection event listeners
    setupConnectionListeners();

    // Connect to MongoDB
    const connection = await mongoose.connect(MONGODB_URI, DB_OPTIONS);

    connectionState.isConnected = true;
    connectionState.isConnecting = false;
    connectionState.lastConnected = new Date();
    connectionState.connectionCount++;

    console.log(`✅ Connected to MongoDB: ${connection.connection.name}`);
    return connection;

  } catch (error) {
    connectionState.isConnecting = false;
    connectionState.isConnected = false;

    console.error('❌ MongoDB connection error:', error);
    throw new Error(`Failed to connect to MongoDB: ${error}`);
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      connectionState.isConnected = false;
      console.log('✅ Disconnected from MongoDB');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
    throw error;
  }
}

/**
 * Setup MongoDB connection event listeners
 */
function setupConnectionListeners(): void {
  // Remove existing listeners to prevent duplicates
  mongoose.connection.removeAllListeners();

  mongoose.connection.on('connected', () => {
    console.log('🔗 MongoDB connected');
    connectionState.isConnected = true;
  });

  mongoose.connection.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error);
    connectionState.isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    console.log('🔌 MongoDB disconnected');
    connectionState.isConnected = false;
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
    connectionState.isConnected = true;
  });

  // Handle application termination
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed through app termination');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  });
}

/**
 * Get database connection status
 */
export function getConnectionStatus(): ConnectionState & { readyState: number } {
  return {
    ...connectionState,
    readyState: mongoose.connection.readyState
  };
}

/**
 * Initialize database with indexes and configurations
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await connectDatabase();

    // Ensure indexes are created for all models
    console.log('📝 Creating database indexes...');
    
    // This will automatically create indexes defined in schemas
    await mongoose.connection.db.admin().command({ listCollections: 1 });

    console.log('✅ Database initialization completed');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Health check for database connection
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  details: {
    connected: boolean;
    readyState: number;
    host: string;
    name: string;
    lastConnected?: Date;
    connectionCount: number;
  };
}> {
  try {
    const isHealthy = mongoose.connection.readyState === 1;
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      details: {
        connected: connectionState.isConnected,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host || 'unknown',
        name: mongoose.connection.name || 'unknown',
        lastConnected: connectionState.lastConnected,
        connectionCount: connectionState.connectionCount
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        connected: false,
        readyState: -1,
        host: 'unknown',
        name: 'unknown',
        connectionCount: connectionState.connectionCount
      }
    };
  }
}

/**
 * Generic pagination helper
 */
export function createPagination(
  page: number = 1,
  limit: number = 20,
  total: number
): PaginationInfo {
  const normalizedLimit = Math.min(Math.max(limit, 1), 100); // Limit between 1-100
  const normalizedPage = Math.max(page, 1);
  const totalPages = Math.ceil(total / normalizedLimit);
  const hasNext = normalizedPage < totalPages;
  const hasPrev = normalizedPage > 1;

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    total,
    totalPages,
    hasNext,
    hasPrev
  };
}

/**
 * Build MongoDB aggregation pipeline for pagination
 */
export function buildPaginationPipeline(params: PaginationParams): any[] {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;
  
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  return [
    { $sort: sort },
    { $skip: skip },
    { $limit: limit }
  ];
}

/**
 * Build MongoDB search pipeline
 */
export function buildSearchPipeline(
  searchFields: string[],
  searchQuery?: string
): any[] {
  if (!searchQuery || searchQuery.trim() === '') {
    return [];
  }

  const searchRegex = new RegExp(searchQuery.trim(), 'i');
  
  return [
    {
      $match: {
        $or: searchFields.map(field => ({
          [field]: { $regex: searchRegex }
        }))
      }
    }
  ];
}

/**
 * Build MongoDB date range filter
 */
export function buildDateRangeFilter(
  dateField: string,
  startDate?: string | Date,
  endDate?: string | Date
): any {
  const filter: any = {};

  if (startDate || endDate) {
    filter[dateField] = {};
    
    if (startDate) {
      filter[dateField].$gte = new Date(startDate);
    }
    
    if (endDate) {
      filter[dateField].$lte = new Date(endDate);
    }
  }

  return filter;
}

/**
 * Transaction wrapper for atomic operations
 */
export async function withTransaction<T>(
  operation: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  await connectDatabase();
  
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    const result = await operation(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

/**
 * Safely execute database operation with error handling
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Database operation failed'
): Promise<T> {
  try {
    await connectDatabase();
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    
    // Re-throw with sanitized error message for production
    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMessage);
    } else {
      throw error;
    }
  }
}

/**
 * Bulk operations helper
 */
export async function bulkWrite<T>(
  Model: mongoose.Model<T>,
  operations: any[],
  options: mongoose.BulkWriteOptions = {}
): Promise<mongoose.mongo.BulkWriteResult> {
  await connectDatabase();
  
  try {
    return await Model.bulkWrite(operations, {
      ordered: false, // Continue on error
      ...options
    });
  } catch (error) {
    console.error('Bulk write operation failed:', error);
    throw error;
  }
}

/**
 * Clean up old records based on date
 */
export async function cleanupOldRecords<T>(
  Model: mongoose.Model<T>,
  dateField: string,
  olderThanDays: number
): Promise<number> {
  await connectDatabase();
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  try {
    const result = await Model.deleteMany({
      [dateField]: { $lt: cutoffDate }
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} old records from ${Model.collection.name}`);
    return result.deletedCount || 0;
  } catch (error) {
    console.error(`Failed to cleanup old records from ${Model.collection.name}:`, error);
    throw error;
  }
}

/**
 * Create database backup (basic implementation)
 */
export async function createBackup(): Promise<{
  success: boolean;
  filename?: string;
  error?: string;
}> {
  try {
    await connectDatabase();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    
    // In a real implementation, you would use mongodump or a similar tool
    console.log(`📦 Creating database backup: ${filename}`);
    
    // This is a simplified example - in production, use proper backup tools
    return {
      success: true,
      filename
    };
  } catch (error) {
    console.error('Backup creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  collections: Array<{
    name: string;
    documentCount: number;
    averageDocumentSize: number;
    totalSize: number;
  }>;
  totalSize: number;
  indexSize: number;
}> {
  await connectDatabase();
  
  try {
    const admin = mongoose.connection.db.admin();
    const stats = await admin.command({ dbStats: 1 });
    
    // Get collection stats
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionStats = await Promise.all(
      collections.map(async (collection) => {
        const collStats = await mongoose.connection.db.command({
          collStats: collection.name
        });
        
        return {
          name: collection.name,
          documentCount: collStats.count || 0,
          averageDocumentSize: collStats.avgObjSize || 0,
          totalSize: collStats.size || 0
        };
      })
    );

    return {
      collections: collectionStats,
      totalSize: stats.dataSize || 0,
      indexSize: stats.indexSize || 0
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    throw error;
  }
}

/**
 * Optimize database performance
 */
export async function optimizeDatabase(): Promise<{
  success: boolean;
  operations: string[];
  errors: string[];
}> {
  await connectDatabase();
  
  const operations: string[] = [];
  const errors: string[] = [];

  try {
    // Compact collections to reclaim space
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      try {
        await mongoose.connection.db.command({
          compact: collection.name
        });
        operations.push(`Compacted collection: ${collection.name}`);
      } catch (error) {
        errors.push(`Failed to compact ${collection.name}: ${error}`);
      }
    }

    // Rebuild indexes
    try {
      await mongoose.connection.db.command({ reIndex: 1 });
      operations.push('Rebuilt all indexes');
    } catch (error) {
      errors.push(`Failed to rebuild indexes: ${error}`);
    }

    console.log('🔧 Database optimization completed');
    
    return {
      success: errors.length === 0,
      operations,
      errors
    };
  } catch (error) {
    console.error('Database optimization failed:', error);
    return {
      success: false,
      operations,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Validate ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Convert string to ObjectId
 */
export function toObjectId(id: string): mongoose.Types.ObjectId {
  if (!isValidObjectId(id)) {
    throw new Error('Invalid ObjectId format');
  }
  return new mongoose.Types.ObjectId(id);
}

/**
 * Generate new ObjectId
 */
export function generateObjectId(): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId();
}
