#!/usr/bin/env bash
# ==============================================================================
# HeartLink Vencord Plugin Automated Installer (macOS & Linux)
# Developed by Ahti for his wife Kiki 💕
# https://heartlink.ahti.lol/ | https://ahti.lol/ | https://keys.ahti.lol/ | https://github.com/ahtilol/heartlink
# ==============================================================================

set -e

echo ""
echo "============================================================"
echo "    💖 HeartLink - Vencord Plugin Installer (macOS/Linux)   "
echo "         Developed by Ahti for his wife Kiki 💕             "
echo "============================================================"
echo ""

# Determine target directory
if [[ "$OSTYPE" == "darwin"* ]]; then
    VENCORD_DIR="$HOME/Library/Application Support/Vencord"
    CONFIG_DIR="$HOME/Library/Application Support"
else
    VENCORD_DIR="$HOME/.config/Vencord"
    CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}"
fi

REPO_CANDIDATES=(
    "$HOME/Vencord"
    "$HOME/Documents/Vencord"
    "$HOME/Projects/Vencord"
    "$HOME/src/Vencord"
    "$(pwd)"
)

VENCORD_REPO=""
for dir in "${REPO_CANDIDATES[@]}"; do
    if [ -f "$dir/package.json" ]; then
        VENCORD_REPO="$dir"
        break
    fi
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_SOURCE="$SCRIPT_DIR/src/userplugins/HeartLink"

if [ ! -d "$PLUGIN_SOURCE" ]; then
    PLUGIN_SOURCE="$SCRIPT_DIR"
fi

if [ -n "$VENCORD_REPO" ]; then
    echo "  -> Found Vencord repository at: $VENCORD_REPO"
    TARGET_DIR="$VENCORD_REPO/src/userplugins/HeartLink"
    mkdir -p "$TARGET_DIR"
    cp -R "$PLUGIN_SOURCE"/* "$TARGET_DIR/"
    echo "  -> Copied HeartLink files to userplugins"

    cd "$VENCORD_REPO"
    if command -v pnpm &> /dev/null; then
        echo "  -> Building with pnpm..."
        pnpm build
    elif command -v npm &> /dev/null; then
        echo "  -> Building with npm..."
        npm run build
    fi

    if [ -d "$VENCORD_REPO/dist" ]; then
        mkdir -p "$VENCORD_DIR/dist"
        cp -R "$VENCORD_REPO/dist"/* "$VENCORD_DIR/dist/"
        echo "  -> Synced bundle to $VENCORD_DIR/dist"
    fi
fi

# Kill running Discord instances
if [[ "$OSTYPE" == "darwin"* ]]; then
    killall Discord "Discord PTB" "Discord Canary" 2>/dev/null || true
else
    killall discord discord-ptb discord-canary 2>/dev/null || true
fi

echo ""
echo "============================================================"
echo "  ✨ HeartLink plugin installed successfully!              "
echo "============================================================"
echo ""
echo "Restart Discord to enjoy HeartLink ✨"
echo "Links: https://heartlink.ahti.lol/ | https://ahti.lol/ | https://github.com/ahtilol/heartlink"
echo ""
