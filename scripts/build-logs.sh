#!/bin/bash

# Script: build_info.sh
# Description: Collects build information and dumps them into a build_info.txt file.
# Author: Your Name
# Date: $(date +"%Y-%m-%d %H:%M:%S")

# Function to get the latest commit hash
get_latest_commit_hash() {
  git rev-parse HEAD
}

# Function to get the latest commit message
get_latest_commit_message() {
  git log -1 --pretty=%B | sed 's/^/    /'
}

# Function to check if the latest commit has a tag and get the tag name
get_latest_commit_tag() {
  git describe --tags --exact-match 2>/dev/null
}

# Function to get the version from package.json
get_package_version() {
  cat package.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | awk '{$1=$1};1' \
    | sed 's/[",]//g'
}

# Function to get Node.js version
get_node_version() {
  node --version
}

# Function to get PNPM version
get_pnpm_version() {
  pnpm --version
}

# Main script

# Output file
output_file="public/next-debug.log"

# Check if package.json exists
if [ -f "package.json" ]; then

  # Get build information
  commit_hash=$(get_latest_commit_hash)
  commit_message=$(get_latest_commit_message)
  commit_tag=$(get_latest_commit_tag)
  commit_branch=$(git rev-parse --abbrev-ref HEAD)
  version=$(get_package_version)
  node_version=$(get_node_version)
  pnpm_version=$(get_pnpm_version)
  build_time=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
  submodule_commit_hash=$(git submodule status)

  # Create or overwrite the output file
  echo "Build Information" > "$output_file"
  echo "-----------------" >> "$output_file"
  echo "Vercel ENV: $VERCEL_ENV" >> "$output_file"
  echo "Site URL: $NEXT_PUBLIC_SITE_URL" >> "$output_file"
  echo "Frame: $NEXT_PUBLIC_FRAME" >> "$output_file"
  echo "Mask Web Components: $NEXT_PUBLIC_MASK_WEB_COMPONENTS" >> "$output_file"
  echo "Build Time: $build_time" >> "$output_file"
  echo "Node.js Version: $node_version" >> "$output_file"
  echo "PNPM Version: $pnpm_version" >> "$output_file"
  echo "Application Version: v$version" >> "$output_file"
  echo "Submodule Status: $submodule_commit_hash" >> "$output_file"
  echo "Latest Commit Branch: $commit_branch" >> "$output_file"
  if [ -n "$commit_tag" ]; then
    echo "Latest Commit Tag: $commit_tag" >> "$output_file"
  fi
  echo "Latest Commit Hash: $commit_hash" >> "$output_file"
  echo "Latest Commit Message:" >> "$output_file"
  echo "" >> "$output_file"
  echo "$commit_message" >> "$output_file"

else
  echo "Error: package.json not found. Make sure you are in the correct directory."
fi
