// pm2-конфиг ImageLinkBot: pm2 пользователя imagelinkbot, не root.
// Лежит в /var/www/imagelinkbot/server рядом с кодом; .env (dotenv) читается из cwd.
// Картинки бот пишет на уровень выше — /var/www/imagelinkbot/image (file.js::saveImage).
const path = require('node:path');

module.exports = {
  apps: [
    {
      name: 'imagelinkbot',
      cwd: __dirname,
      script: path.join(__dirname, 'imageLinkBot.js'),
      env: { NODE_ENV: 'production' },
      kill_timeout: 10000,
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
