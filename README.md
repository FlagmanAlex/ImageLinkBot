# ImageLinkBot

Бот Telegram: присылаешь картинку — получаешь публичную ссылку на неё.

- Картинка сохраняется в `../image/<user_id>-<время>.jpeg` (папка рядом с папкой кода).
- Ссылка: `${HOST}/image/<файл>.jpeg`. Отдаёт файл nginx, а не встроенный express.
- Каждая присланная картинка пересылается владельцу (`FLAGMANALEX_CHAT_ID`) и записывается в
  коллекцию `SaveLog` базы `IMAGE`.

В репозитории — скомпилированный JS в том виде, в каком он работал на сервере с января 2025;
исходники на TypeScript не сохранились. `package-lock.json` с сервера в репозиторий не попал —
на сервере зависимости уже установлены.

## На сервере (VDSina Москва `138.16.178.157`, с 2026-11-10 — после атаки на Beget)

| | |
|---|---|
| Код | `/var/www/imagelinkbot/server` — клон этого репозитория (`git pull` для обновления) |
| Картинки | `/var/www/imagelinkbot/image` → `https://api.wwms.ru/imagelinkbot/image/…` |
| Старые картинки | `/var/www/html/image` → `https://api.wwms.ru/image/…` |
| Процесс | pm2 пользователя `imagelinkbot` (systemd `pm2-imagelinkbot`), конфиг — `ecosystem.config.cjs` |
| База | `IMAGE` на `127.0.0.1` (один узел `rs0`), учётка `imagelinkbot` в `admin` (`readWrite` на `IMAGE`) |
| Telegram | `TELEGRAM_API_URL` — посредник `tg-relay` (с сервера в РФ `api.telegram.org` режется) |

nginx — `/etc/nginx/snippets/imagelinkbot.conf`, подключён в блоке `wwms-api`. Бэкап — общий
`wwms-backup.sh` (репозиторий warehouse, `server/deploy/`): база `IMAGE`, `imagelinkbot-image`,
`html-image`, `.env`. Пошагово — warehouse `server/deploy/RESTORE.md`, раздел 12.

Команды (от root):

```bash
sudo -u imagelinkbot -H sh -c 'cd ~ && pm2 list'
sudo -u imagelinkbot -H sh -c 'cd ~ && pm2 logs imagelinkbot --lines 50 --nostream'
sudo -u imagelinkbot -H sh -c 'cd /var/www/imagelinkbot/server && git pull -q && npm install --omit=dev && pm2 restart imagelinkbot'
```
