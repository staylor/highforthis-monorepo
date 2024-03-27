# Stop daemon
pm2 stop highforthis-graphql

# change into GraphQL directory
cd graphql

# Clean build folder
rm -rf lib

# Build into JS
yarn env-cmd -e prod src/index.ts --packages=external --bundle --platform=node --target=node18.17.1 --format=esm --outfile=lib/index.js

# Start daemon
yarn env-cmd -e prod pm2 start lib/index.js --name highforthis-graphql