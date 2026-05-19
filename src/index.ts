import app from './app';
import prisma from './config/database';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🛡️  Jerusalem Bible API Server Started Successfully`);
  console.log(`📡  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐  Developer Portal: http://localhost:${PORT}`);
  console.log(`🚀  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});

// Graceful shutdown handling
const handleGracefulShutdown = async () => {
  console.log('\nShutting down server gracefully...');
  
  server.close(async () => {
    console.log('Express server closed.');
    
    // Disconnect Prisma
    await prisma.$disconnect();
    console.log('Database connection disconnected.');
    
    process.exit(0);
  });
};

process.on('SIGTERM', handleGracefulShutdown);
process.on('SIGINT', handleGracefulShutdown);
