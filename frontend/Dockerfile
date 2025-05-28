# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS base

# Set the working directory in the container
WORKDIR /app

# Install pnpm globally if you are using pnpm, or adjust for npm/yarn
# RUN npm install -g pnpm

# Copy package.json and lock file
COPY package.json ./
# Assuming use of npm, copy package-lock.json. Adjust if using yarn or pnpm.
COPY package-lock.json ./

# Install dependencies
# If using pnpm:
# RUN pnpm install --frozen-lockfile
# If using yarn:
# RUN yarn install --frozen-lockfile
# If using npm:
RUN npm install --production=false # Install devDependencies for build stage

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Production image
FROM node:18-alpine AS production

WORKDIR /app

# Copy built assets from the build stage
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./package.json
# COPY --from=base /app/node_modules ./node_modules # Not always needed if dependencies are bundled or handled differently in Next.js standalone output

# For Next.js 14+, often the standalone output is preferred
# Ensure your next.config.js has `output: 'standalone'` for this to work best
# RUN npx browserslist@latest --update-db # Optional: update browserslist
# EXPOSE 3000
# CMD ["node_modules/.bin/next", "start"]

# If not using standalone output, or for a more traditional setup:
# Copy node_modules (only production dependencies if possible)
# This can be tricky. If the build stage installed all dependencies,
# you might need to copy them or run npm install --production here.
# A common pattern is to copy the entire node_modules from the base image.
COPY --from=base /app/node_modules ./node_modules


EXPOSE 3000

# Set the command to run the application
# The `next start` command requires the .next directory and public assets from the build stage
CMD ["npm", "start"]
