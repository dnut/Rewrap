cd /d "%~dp0"

if not exist "node_modules\" (
  echo No node_modules found. Running npm install...
  npm install
)

@node .config/do.mjs %*
