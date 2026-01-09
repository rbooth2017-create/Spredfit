#!/bin/bash
# Remove all console.log statements more carefully
find src -type f \( -name "*.tsx" -o -name "*.ts" \) | while read file; do
  # Use perl for better multi-line regex handling
  perl -i -0pe 's/console\.log\([^;]*\);//gs' "$file"
  echo "Cleaned: $file"
done
echo "Done!"
