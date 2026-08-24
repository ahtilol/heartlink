#!/usr/bin/env node

/**
 * HeartLink Cross-Platform Vencord Installer
 * Developed by Ahti for his wife Kiki 💕
 * https://ahti.lol/
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

console.log("\x1b[35m%s\x1b[0m", "\n============================================================");
console.log("\x1b[1m\x1b[37m%s\x1b[0m", "        💖 HeartLink - Vencord Plugin Installer");
console.log("\x1b[90m%s\x1b[0m", "             Developed by Ahti for his wife Kiki 💕");
console.log("\x1b[35m%s\x1b[0m", "============================================================\n");

const homedir = os.homedir();
const isWindows = process.platform === "win32";

// Find Vencord directory
const possibleVencordDirs = [
    path.join(homedir, "Vencord"),
    path.join(homedir, "OneDrive", "Documents", "Vencord"),
    path.join(process.env.APPDATA || "", "Vencord"),
    path.join(process.env.LOCALAPPDATA || "", "Vencord"),
    process.cwd(),
];

let vencordPath = possibleVencordDirs.find(d => fs.existsSync(path.join(d, "src")) || fs.existsSync(path.join(d, "package.json")));

if (!vencordPath) {
    console.log("\x1b[33m%s\x1b[0m", "[!] Could not automatically locate Vencord repo. Using default:", path.join(homedir, "Vencord"));
    vencordPath = path.join(homedir, "Vencord");
} else {
    console.log("\x1b[32m%s\x1b[0m", `[+] Detected Vencord repository at: ${vencordPath}`);
}

const sourcePluginDir = path.join(__dirname, "src", "userplugins", "HeartLink");
const targetUserpluginsDir = path.join(vencordPath, "src", "userplugins", "HeartLink");
const targetBuiltinDir = path.join(vencordPath, "src", "plugins", "heartlink");

try {
    console.log("\x1b[36m%s\x1b[0m", "[1/3] Copying HeartLink files into Vencord plugins...");
    
    if (fs.existsSync(sourcePluginDir)) {
        fs.mkdirSync(targetUserpluginsDir, { recursive: true });
        fs.cpSync(sourcePluginDir, targetUserpluginsDir, { recursive: true });
        console.log("\x1b[32m%s\x1b[0m", `  -> Installed into ${targetUserpluginsDir}`);

        if (fs.existsSync(path.join(vencordPath, "src", "plugins"))) {
            fs.mkdirSync(targetBuiltinDir, { recursive: true });
            fs.cpSync(sourcePluginDir, targetBuiltinDir, { recursive: true });
            console.log("\x1b[32m%s\x1b[0m", `  -> Synced into ${targetBuiltinDir}`);
        }
    } else {
        console.log("\x1b[33m%s\x1b[0m", `[!] Source directory ${sourcePluginDir} not found, checking current working directory.`);
    }

    console.log("\x1b[36m%s\x1b[0m", "\n[2/3] Building Vencord bundle...");
    if (fs.existsSync(path.join(vencordPath, "package.json"))) {
        try {
            execSync("pnpm build", { cwd: vencordPath, stdio: "inherit" });
            console.log("\x1b[32m%s\x1b[0m", "  -> Build succeeded!");
        } catch (e) {
            console.log("\x1b[33m%s\x1b[0m", "  [!] pnpm build failed or not found, trying npm run build...");
            try {
                execSync("npm run build", { cwd: vencordPath, stdio: "inherit" });
            } catch (err) {
                console.log("\x1b[31m%s\x1b[0m", "  [!] Could not build automatically. Please run 'pnpm build' manually.");
            }
        }
    }

    console.log("\x1b[35m%s\x1b[0m", "\n============================================================");
    console.log("\x1b[1m\x1b[32m%s\x1b[0m", "  ✨ HeartLink has been installed successfully! ");
    console.log("\x1b[35m%s\x1b[0m", "============================================================\n");
    console.log("Restart Discord (or press Ctrl+R inside Discord) to activate HeartLink.\n");
} catch (err) {
    console.error("\x1b[31m%s\x1b[0m", "[X] Installation error:", err.message);
}
