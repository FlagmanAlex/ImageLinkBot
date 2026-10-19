# ImageLinkBot

Бот Telegram: присылаешь картинку — получаешь публичную ссылку на неё.

- Картинка сохраняется в `../image/<user_id>-<время>.jpeg` (папка рядом с папкой кода).
- Ссылка: `${HOST}/image/<файл>.jpeg`. Отдаёт файл nginx, а не встроенный express.
- Каждая присланная картинка пересылается владельцу (`FLAGMANALEX_CHAT_ID`) и записывается в
  коллекцию `SaveLog` базы `IMAGE`.

В репозитории — скомпилированный JS в том виде, в каком он работал на сервере с января 2025;
исходники на TypeScript не сохранились. `package-lock.json` с сервера в репозиторий не попал —
на сервере зависимости уже установлены.

## На сервере (VPS api.wwms.ru, с 2026-10-19)

| | |
|---|---|
| Код | `/var/www/imagelinkbot/server` |
| Картинки | `/var/www/imagelinkbot/image` → `https://api.wwms.ru/imagelinkbot/image/…` |
| Процесс | pm2 пользователя `imagelinkbot` (systemd `pm2-imagelinkbot`), конфиг — `ecosystem.config.cjs` |
| База | `IMAGE`, учётка `imagelinkbot` (`readWrite` только на `IMAGE`) |
| Старые картинки | `/var/www/html/image` (общая папка, отдаётся как раньше) |

nginx (`/etc/nginx/sites-available/default`, блок `server` для `api.wwms.ru` на 443):

```nginx
location /imagelinkbot/image/ {
    alias /var/www/imagelinkbot/image/;
}
```

Команды (от root):

```bash
sudo -u imagelinkbot -H sh -c 'cd ~ && pm2 list'
sudo -u imagelinkbot -H sh -c 'cd ~ && pm2 logs imagelinkbot --lines 50 --nostream'
sudo -u imagelinkbot -H sh -c 'cd ~ && pm2 restart imagelinkbot'
```

Обновить код: скопировать файлы из репозитория в `/var/www/imagelinkbot/server`, затем
`pm2 restart`. Новые зависимости — `sudo -u imagelinkbot -H sh -c 'cd /var/www/imagelinkbot/server && npm install'`.
