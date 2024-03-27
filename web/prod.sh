# Install deps, if missing
yarn

# Change into web
cd web

# Clean
rm -rf build public/build

# Build
yarn env-cmd -e prod remix build

# Upload to GCS
gsutil -m rsync -r public gs://static.highforthis.com

# Set metadata on new upload
gsutil -m setmeta -r -h 'Cache-control:public, max-age=259200' gs://static.highforthis.com/build

# Stop daemon
pm2 stop highforthis-remix

# Start daemon
yarn env-cmd -e prod pm2 start server.mjs --name highforthis-remix
