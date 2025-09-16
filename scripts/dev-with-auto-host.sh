#!/bin/bash
# scripts/dev-with-auto-host.sh

ENV_FILE=".env"
WEB_ENV_FILE="web/.env"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Shopify app development with auto HOST update...${NC}\n"

# Function to update HOST in .env file
update_env_file() {
    local file="$1"
    local new_host="$2"

    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  File $file not found, skipping...${NC}"
        return
    fi

    # Create a backup
    cp "$file" "$file.backup"

    # Update HOST variable if it exists, otherwise add it
    if grep -q "^HOST=" "$file"; then
        # Update existing HOST
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|^HOST=.*|HOST=$new_host|" "$file"
        else
            # Linux
            sed -i "s|^HOST=.*|HOST=$new_host|" "$file"
        fi
    else
        # Add HOST variable at the end
        echo "" >> "$file"
        echo "# Auto-updated HOST URL" >> "$file"
        echo "HOST=$new_host" >> "$file"
    fi

    # Add or update additional URL variables
    declare -A url_vars=(
        ["SHOPIFY_APP_URL"]="$new_host"
        ["SHOPIFY_TUNNEL_URL"]="$new_host"
        ["APP_URL"]="$new_host"
        ["NEXT_PUBLIC_SHOPIFY_APP_URL"]="$new_host"
    )

    for var_name in "${!url_vars[@]}"; do
        var_value="${url_vars[$var_name]}"

        if grep -q "^${var_name}=" "$file"; then
            # Update existing variable
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s|^${var_name}=.*|${var_name}=$var_value|" "$file"
            else
                sed -i "s|^${var_name}=.*|${var_name}=$var_value|" "$file"
            fi
        else
            # Add new variable
            echo "${var_name}=$var_value" >> "$file"
        fi
    done

    echo -e "${GREEN}✅ Updated $file with HOST: $new_host${NC}"
}

# Function to extract URL from Shopify CLI output
extract_url() {
    local line="$1"

    # Try different patterns to match tunnel URLs
    if echo "$line" | grep -qE "Using URL:.*https://"; then
        echo "$line" | sed -E 's/.*Using URL: (https:\/\/[^ ]*).*/\1/'
    elif echo "$line" | grep -qE "App URL:.*https://"; then
        echo "$line" | sed -E 's/.*App URL: (https:\/\/[^ ]*).*/\1/'
    elif echo "$line" | grep -qE "Preview URL:.*https://"; then
        echo "$line" | sed -E 's/.*Preview URL: (https:\/\/[^ ]*).*/\1/'
    elif echo "$line" | grep -qE "Tunnel URL:.*https://"; then
        echo "$line" | sed -E 's/.*Tunnel URL: (https:\/\/[^ ]*).*/\1/'
    elif echo "$line" | grep -qE "trycloudflare\.com"; then
        echo "$line" | grep -oE 'https://[^[:space:]]*\.trycloudflare\.com'
    fi
}

# Start Shopify CLI and monitor output
current_host=""

bun run dev 2>&1 | while IFS= read -r line; do
    # Print the line (pass through)
    echo "$line"

    # Check if this line contains a tunnel URL
    if echo "$line" | grep -qE "(Using URL:|App URL:|trycloudflare\.com).*https://"; then
        # Extract the URL
        url=$(extract_url "$line")

        if [ -n "$url" ] && [[ "$url" == https://* ]] && [[ "$url" != *"myshopify.com"* ]]; then
            # Clean the URL (remove trailing slashes and query params)
            url=$(echo "$url" | sed 's:/*$::' | cut -d'?' -f1)

            # Only update if URL changed
            if [ "$url" != "$current_host" ]; then
                current_host="$url"

                echo ""
                echo -e "${YELLOW}🔄 New tunnel URL detected: $url${NC}"

                # Update .env files
                update_env_file "$ENV_FILE" "$url"
                update_env_file "$WEB_ENV_FILE" "$url"

                echo ""
                echo -e "${GREEN}🎉 Environment files updated!${NC}"
                echo -e "${BLUE}   You can now use process.env.HOST in your code${NC}"
                echo -e "${BLUE}   Current URL: $url${NC}"
                echo ""
            fi
        fi
    fi
done