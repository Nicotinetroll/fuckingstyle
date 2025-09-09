module.exports = {
  apps: [{
    name: 'voting-backend',
    script: './backend/dist/index.js',
    cwd: '/var/www/voting',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      MONGO_URI: 'mongodb://localhost:27017/voting'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    time: true
  }]
}
