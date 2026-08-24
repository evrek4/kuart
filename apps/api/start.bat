@echo off
:: API sunucusunu monorepo kök .env dosyasıyla başlatır
cd /d %~dp0
set "DOTENV_CONFIG_PATH=%~dp0..\..\..\.env"
node -r dotenv/config dist/app.js dotenv_config_path=%DOTENV_CONFIG_PATH%
