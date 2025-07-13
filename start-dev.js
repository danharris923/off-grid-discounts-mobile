#!/usr/bin/env node

const { spawn } = require('child_process');
const net = require('net');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Logging functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('');
  log('━'.repeat(60), colors.dim);
  log(title, colors.bright + colors.cyan);
  log('━'.repeat(60), colors.dim);
}

function logStep(step, message) {
  log(`[${step}] ${message}`, colors.blue);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

// Check if port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logWarning(`Port ${port} is already in use`);
        resolve(false);
      } else {
        logError(`Error checking port ${port}: ${err.message}`);
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      logSuccess(`Port ${port} is available!`);
      server.close();
      resolve(true);
    });
    
    logStep('CHECK', `Testing port ${port}...`);
    server.listen(port, '127.0.0.1');
  });
}

// Find available port starting from basePort
async function findAvailablePort(basePort = 3100, maxTries = 100) {
  logSection('🔍 SEARCHING FOR AVAILABLE PORT');
  logInfo(`Starting search from port ${basePort}`);
  logInfo(`Will try up to ${maxTries} ports`);
  
  for (let i = 0; i < maxTries; i++) {
    const port = basePort + i;
    const available = await isPortAvailable(port);
    
    if (available) {
      console.log('');
      logSuccess(`Found available port: ${port}`);
      return port;
    }
    
    if (i < maxTries - 1) {
      logStep('NEXT', `Trying next port...`);
    }
  }
  
  throw new Error(`No available ports found between ${basePort} and ${basePort + maxTries - 1}`);
}

// Start the development server
async function startDevServer() {
  try {
    logSection('🚀 OFF-GRID DISCOUNTS DEV SERVER LAUNCHER');
    logInfo(`Current directory: ${process.cwd()}`);
    logInfo(`Node version: ${process.version}`);
    logInfo(`Platform: ${process.platform}`);
    logInfo(`Time: ${new Date().toLocaleString()}`);
    
    // Find available port
    const port = await findAvailablePort(3100);
    
    // Set environment variable
    process.env.PORT = port;
    
    logSection('🔧 STARTING DEVELOPMENT SERVER');
    logInfo(`Using PORT: ${port}`);
    logInfo(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Detect which package manager to use
    const fs = require('fs');
    let command = 'npm';
    let args = ['start'];
    
    if (fs.existsSync('yarn.lock')) {
      command = 'yarn';
      args = ['start'];
      logInfo('Detected yarn.lock - using Yarn');
    } else if (fs.existsSync('pnpm-lock.yaml')) {
      command = 'pnpm';
      args = ['start'];
      logInfo('Detected pnpm-lock.yaml - using PNPM');
    } else {
      logInfo('Using NPM (default)');
    }
    
    logStep('EXEC', `Running: ${command} ${args.join(' ')}`);
    console.log('');
    
    // Spawn the dev server
    const devServer = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        PORT: port,
        BROWSER: 'none', // Prevent auto-opening browser
      }
    });
    
    // Handle process events
    devServer.on('error', (error) => {
      logError(`Failed to start dev server: ${error.message}`);
      process.exit(1);
    });
    
    devServer.on('close', (code) => {
      if (code !== 0) {
        logError(`Dev server exited with code ${code}`);
      } else {
        logSuccess('Dev server stopped gracefully');
      }
      process.exit(code);
    });
    
    // Handle CTRL+C
    process.on('SIGINT', () => {
      logSection('👋 SHUTTING DOWN');
      logInfo('Received interrupt signal, stopping server...');
      devServer.kill('SIGINT');
    });
    
    // Handle terminal close
    process.on('SIGTERM', () => {
      logSection('👋 SHUTTING DOWN');
      logInfo('Received termination signal, stopping server...');
      devServer.kill('SIGTERM');
    });
    
    // Success message with delay to ensure server output appears first
    setTimeout(() => {
      console.log('');
      logSection('✨ SERVER READY');
      logSuccess(`Development server is running on port ${port}`);
      logInfo(`Local:            http://localhost:${port}`);
      logInfo(`On Your Network:  http://${getNetworkAddress()}:${port}`);
      console.log('');
      logInfo('To stop the server, press Ctrl+C');
      log('━'.repeat(60), colors.dim);
    }, 3000);
    
  } catch (error) {
    logError(`Launcher error: ${error.message}`);
    process.exit(1);
  }
}

// Get network address
function getNetworkAddress() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return '127.0.0.1';
}

// Run the launcher
startDevServer().catch((error) => {
  logError(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});