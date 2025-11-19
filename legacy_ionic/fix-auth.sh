#!/bin/bash

# Fix raceLogs.ts
sed -i '' '1s/^import { auth } from/@\/lib\/firebase'\'';\/\/PLACEHOLDER/' src/services/raceLogs.ts
sed -i '' '1s/^/import { getCurrentUser } from '\''@\/lib\/auth-native'\'';\n/' src/services/raceLogs.ts  
sed -i '' 's/const user = auth\.currentUser;/const user = await getCurrentUser();/g' src/services/raceLogs.ts
sed -i '' '/\/\/PLACEHOLDER/d' src/services/raceLogs.ts

# Fix comments.ts
sed -i '' 's/import { auth } from '\''@\/lib\/firebase'\'';/import { getCurrentUser } from '\''@\/lib\/auth-native'\'';/' src/services/comments.ts
sed -i '' 's/const user = auth\.currentUser;/const user = await getCurrentUser();/g' src/services/comments.ts

# Fix follows.ts  
sed -i '' 's/import { auth } from '\''@\/lib\/firebase'\'';/import { getCurrentUser } from '\''@\/lib\/auth-native'\'';/' src/services/follows.ts
sed -i '' 's/const user = auth\.currentUser;/const user = await getCurrentUser();/g' src/services/follows.ts

# Fix lists.ts
sed -i '' 's/import { auth } from '\''@\/lib\/firebase'\'';/import { getCurrentUser } from '\''@\/lib\/auth-native'\'';/' src/services/lists.ts
sed -i '' 's/const user = auth\.currentUser;/const user = await getCurrentUser();/g' src/services/lists.ts

# Fix likes.ts (already fixed, but make sure)
sed -i '' 's/import { auth } from '\''@\/lib\/firebase'\'';/import { getCurrentUser } from '\''@\/lib\/auth-native'\'';/' src/services/likes.ts

# Fix watchlist.ts (already fixed, but make sure)
sed -i '' 's/import { auth } from '\''@\/lib\/firebase'\'';/import { getCurrentUser } from '\''@\/lib\/auth-native'\'';/' src/services/watchlist.ts

echo "Fixed all service files"
