#!/usr/bin/env bash
#
# Next.js Calculator Application Development Startup Script
# =========================================================
#
# WHAT IT DOES:
# This script provides automatic hot-reload functionality for Next.js applications
# in a development environment. It monitors package.json for dependency changes
# and automatically reinstalls npm packages when dependencies are modified. The
# script uses nodemon to watch for changes and restart the Next.js development
# server accordingly.
#
# The script works in two stages:
#   1. Initial setup: Installs all dependencies and creates a hash of package.json
#   2. Continuous monitoring: Uses nodemon to watch package.json and restart the
#      dev server when dependencies change. The .dev_run.sh helper script checks
#      if package.json changed and reinstalls dependencies before starting the server.
#
# WHY IT'S NEEDED:
# In a containerized development environment (like DigitalOcean App Platform), this
# script enables automatic dependency management when package.json is updated via
# git sync. When new dependencies are added to package.json and pushed to GitHub,
# the git sync service pulls the changes, and this script detects the modification,
# reinstalls dependencies, and restarts the Next.js dev server automatically.
# This ensures the application always has the correct dependencies installed and
# running, without requiring manual npm install commands or server restarts.
#
# HOW IT'S USED:
# This script is executed by the container's RUN_COMMAND as specified in the
# appspec.yaml file. It:
#   - Runs 'npm install' initially to set up dependencies
#   - Creates a hash file (.package_hash) to track package.json state
#   - Generates a helper script (.dev_run.sh) that nodemon will execute
#   - Launches nodemon to watch package.json and execute .dev_run.sh on changes
#   - The helper script checks if package.json changed, reinstalls if needed, and
#     starts the Next.js dev server on port 8080
#
# The script runs continuously, with nodemon handling the process lifecycle and
# automatic restarts when package.json changes are detected.
#
set -euo pipefail
cd "$(dirname "$0")"

# Initial install and hash
npm install
sha256sum package.json | awk '{print $1}' > .package_hash

# Helper to reinstall when package.json changes
install_if_changed() {
  current=$(sha256sum package.json | awk '{print $1}')
  previous=$(cat .package_hash 2>/dev/null || true)
  if [ "$current" != "$previous" ]; then
    echo "package.json changed. Reinstalling..."
    npm install
    echo "$current" > .package_hash
  else
    echo "package.json unchanged. Skipping npm install."
  fi
}

# Runner invoked by nodemon
cat > .dev_run.sh <<'RUN'
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
current=$(sha256sum package.json | awk '{print $1}')
previous=$(cat .package_hash 2>/dev/null || true)
if [ "$current" != "$previous" ]; then
  echo "package.json changed. Reinstalling..."
  npm install
  echo "$current" > .package_hash
else
  echo "package.json unchanged. Skipping npm install."
fi
exec npm run dev -- --hostname 0.0.0.0 --port 8080
RUN
chmod +x .dev_run.sh

# Start nodemon to watch package.json and rerun .dev_run.sh
exec npx nodemon --watch package.json --ext json --exec "bash .dev_run.sh"

