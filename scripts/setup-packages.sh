#!/bin/bash
#
# Description: This script accepts three parameters - source node_modules pathname,
# destination node_modules pathname, and folder name prefix. It finds all folders in
# the source/.pnpm/ directory whose filename starts with the specified prefix, deletes
# those folders, and creates symbolic links to corresponding folders in the
# dest/.pnpm/ directory.
#
# Usage: ./script.sh <source_node_modules_pathname> <dest_node_modules_pathname> <folder_name_prefix>
#
# Example: ./script.sh /path/to/source_node_modules /path/to/dest_node_modules '@tanstack+'

# Check if correct number of arguments are provided
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <source_node_modules_pathname> <dest_node_modules_pathname> <folder_name_prefix>"
    exit 1
fi

source_path="$1"      # Source node_modules pathname
dest_path="$2"        # Destination node_modules pathname
name_prefix="$3"      # Folder name prefix

# Check if source directory exists
if [ ! -d "$source_path" ]; then
    echo "Source directory not found: $source_path"
    exit 1
fi

# Check if destination directory exists
if [ ! -d "$dest_path" ]; then
    echo "Destination directory not found: $dest_path"
    exit 1
fi

# Find folders in source/.pnpm/ starting with the specified name prefix
find "$source_path/.pnpm" -type d -name "$name_prefix"* | while read -r folder; do
    # Extract the folder name without path
    folder_name=$(basename "$folder")
    
    # Delete the folder in the source directory
    rm -rf "$folder"
    
    # Create a symbolic link to the destination directory
    ln -s "$dest_path/.pnpm/$folder_name" "$folder"
    
    echo "Soft link created for $folder_name"
done

echo "Task completed successfully!"
