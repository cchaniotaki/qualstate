#!/bin/bash

# Step 1: Set browser=chrome in .env file
sed -i '' 's/^BROWSER=.*/BROWSER=chrome/' .env

# Step 2: Run qs.js with chrome configuration
node qs.js

## Step 5: Update .env file to browser=edge
sed -i '' 's/^BROWSER=.*/BROWSER=edge/' .env
#
## Step 6: Run qs.js again with edge configuration
node qs.js
