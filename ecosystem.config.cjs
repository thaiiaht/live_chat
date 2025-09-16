module.exports = {
  apps: [
    {
      name: 'livechat',           // Tên app hiển thị trong PM2
      script: './build/bin/server.js',     // File đã build
      cwd: __dirname,                  // Thư mục gốc
      instances: 1,                     // Hoặc 'max' nếu muốn cluster mode
      exec_mode: 'fork',                // Hoặc 'cluster' nếu muốn
      watch: false,                     // Không nên bật watch trong production
      env: {
        NODE_ENV: 'production',         // Biến môi trường mặc định
      },
      env_production: {
        NODE_ENV: 'production',         // Biến môi trường khi chạy pm2 start --env production
      }
    }
  ]
}