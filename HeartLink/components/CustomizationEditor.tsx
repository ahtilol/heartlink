import { React } from "@webpack/common";
import * as DataStore from "@api/DataStore";
import {
    ICON_OPTIONS,
    RelationshipIcon,
    CheckIcon,
    UploadIcon,
    SparklesIcon,
    PaletteIcon,
    SlidersIcon,
    FilmIcon,
    FloppyDiskIcon,
    InfoCircleIcon,
    CalendarDaysIcon,
    RotateIcon,
    HeartPulseIcon,
    WaveIcon,
    PauseIcon,
    SnowflakeIcon,
    CubeIcon,
    FlaskIcon,
    DropletIcon,
    LightbulbIcon,
    FeatherIcon,
    GlobeIcon,
    TerminalIcon,
    MobileIcon,
    WindIcon,
    BasketballIcon,
    SunIcon,
    CrownIcon,
    BoltIcon,
    StarIcon,
    FireIcon,
    HeartIcon,
    MoonIcon,
    MusicIcon,
    GemIcon,
    GhostIcon,
    TrashIcon,
    WandSparklesIcon,
} from "../icons";

export interface ItemCustomization {
    typeId: string;
    theirRole?: string;   // What they appear as (e.g. Wife)
    yourRole?: string;    // What you appear as to them (e.g. Husband)
    customIcon?: string;
    customColor?: string; // Stored as "badgeColor:iconColors:sinceDate:fxString:theme:animation:interaction"
    customBadgeColor?: string;
    customIconColor?: string;     // Comma-separated "c1,c2,c3"
    customIconColor2?: string;
    customIconColor3?: string;
    customSinceDate?: string;
    customOpacity?: number;       // 0.4 to 1.0
    customSaturation?: number;    // 0.5 to 2.0
    customBrightness?: number;    // 0.6 to 1.6
    customGlowSpread?: number;    // 0 to 25px
    customGlowIntensity?: number; // 0 to 1.0
    customGlowColor?: string;
    customTheme?: string;         // Theme id
    customAnimation?: string;     // Animation id
    customInteraction?: string;   // Interaction poke style ("love" | "high_five" | "game_ping" | "fist_bump" | "hug" | "sparkle" | "fire")
    customDescription?: string;
}

export interface UserPreset {
    id: string;
    name: string;
    icon: string;
    badgeColor: string;
    iconColor: string;
    theme: string;
    animation: string;
    glowSpread: number;
    glowIntensity: number;
    glowColor: string;
    opacity: number;
    saturation: number;
    brightness: number;
}

interface CustomizationEditorProps {
    typeId: string;
    defaultTargetRole: string; // e.g. "Wife"
    defaultSourceRole: string; // e.g. "Husband"
    defaultIcon: string;
    defaultColor: string;
    defaultDescription: string;
    value: ItemCustomization;
    onChange: (custom: ItemCustomization) => void;
    onClose: () => void;
}

const GUILD_BADGES = Array.from({ length: 41 }, (_, i) => ({
    id: `https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/guilds/${i + 1}.svg`,
    label: `Guild Badge ${i + 1}`,
}));

const BADGE_COLOR_PALETTE = [
    "#ff4081", // Rose Pink
    "#f43f5e", // Crimson Red
    "#38bdf8", // Sky Blue
    "#5865f2", // Blurple
    "#10b981", // Emerald
    "#f59e0b", // Warm Amber
    "#a855f7", // Royal Purple
    "#1e1f22", // Midnight Dark
    "#ffffff", // Clean White
    "#ec4899", // Neon Fuchsia
    "#06b6d4", // Electric Cyan
    "#84cc16", // Lime Green
];

const ICON_COLOR_PALETTE = [
    "#ffffff", // Crisp White
    "#fbbf24", // Gold Yellow
    "#38bdf8", // Sky Blue
    "#f43f5e", // Rose Red
    "#10b981", // Mint Green
    "#a855f7", // Vivid Purple
    "#ff80bf", // Pastel Pink
    "#00e5ff", // Cyan Neon
    "#f97316", // Bright Orange
    "#e2e8f0", // Silver Slate
];

const THEME_OPTIONS: { id: string; label: string; IconComp: React.ComponentType<{ size?: number; color?: string; }>; desc: string; }[] = [
    { id: "none",        label: "Static / None",     IconComp: PauseIcon,         desc: "Clean solid enamel without theme shaders" },
    { id: "isometric",   label: "Classic 3D",        IconComp: CubeIcon,          desc: "Crisp multi-layer extruded enamel" },
    { id: "holographic", label: "Aurora Holo",       IconComp: WandSparklesIcon,  desc: "Dynamic rainbow prismatic wave" },
    { id: "gold",        label: "Golden Royalty",    IconComp: CrownIcon,         desc: "24K mirror gold with royal aura" },
    { id: "neon",        label: "Cyber Neon",        IconComp: BoltIcon,          desc: "Electric glow with reactor bloom" },
    { id: "sparkles",    label: "Starlight Galaxy",  IconComp: StarIcon,          desc: "Celestial twilight with diamond glint" },
    { id: "fire",        label: "Inferno Magma",     IconComp: FireIcon,          desc: "Molten flame with burning embers" },
    { id: "sakura",      label: "Sakura Blossom",    IconComp: HeartIcon,         desc: "Iridescent soft pastel petals" },
    { id: "crystal",     label: "Diamond Frost",     IconComp: SnowflakeIcon,     desc: "Glacial ice blue faceted gloss" },
    { id: "void",        label: "Obsidian Void",     IconComp: MoonIcon,          desc: "Dark matter with violet event-horizon" },
    { id: "synthwave",   label: "Synthwave Sunset",  IconComp: MusicIcon,         desc: "Retro 80s neon magenta & cyan" },
    { id: "matrix",      label: "Emerald Matrix",    IconComp: TerminalIcon,      desc: "Cyber terminal neon green pulse" },
    { id: "amethyst",    label: "Royal Amethyst",    IconComp: GemIcon,           desc: "Deep mystical purple gemstone" },
    { id: "velvet",      label: "Midnight Velvet",   IconComp: MoonIcon,          desc: "Stealth obsidian night gradient" },
    { id: "toxic",       label: "Toxic Acid",        IconComp: FlaskIcon,         desc: "High-voltage bio-hazard glow" },
    { id: "chroma",      label: "Chroma Prism",      IconComp: SparklesIcon,      desc: "Continuous spectral light movement" },
    { id: "ethereal",    label: "Ghostly Ethereal",  IconComp: GhostIcon,         desc: "Translucent phantom teal aura" },
    { id: "crimson",     label: "Vampire Crimson",   IconComp: DropletIcon,       desc: "Gothic blood red darkness" },
];

const ANIMATION_OPTIONS: { id: string; label: string; IconComp: React.ComponentType<{ size?: number; color?: string; }>; desc: string; }[] = [
    { id: "none",        label: "Static / None",       IconComp: PauseIcon,        desc: "Classic still 3D badge with zero motion" },
    { id: "float",       label: "Floating Bob",        IconComp: FeatherIcon,      desc: "Gentle vertical levitation" },
    { id: "pulse",       label: "Heartbeat Pulse",     IconComp: HeartPulseIcon,   desc: "Smooth cardiac rhythm scale" },
    { id: "shimmer",     label: "Rainbow Shimmer",     IconComp: WandSparklesIcon, desc: "Specular gleam reflection" },
    { id: "glow",        label: "Breathing Glow",      IconComp: SunIcon,          desc: "Radiant pulsating light aura" },
    { id: "rainbow",     label: "Rainbow Shift",       IconComp: PaletteIcon,      desc: "Continuous hue rotation" },
    { id: "flame",       label: "Molten Flame",        IconComp: FireIcon,         desc: "Flickering organic warmth" },
    { id: "glitch",      label: "Cyber Glitch",        IconComp: TerminalIcon,     desc: "Digital chromatic twitch" },
    { id: "flip",        label: "3D Perspective Flip", IconComp: RotateIcon,       desc: "Smooth periodic 3D rotation" },
    { id: "bounce",      label: "Playful Bounce",      IconComp: BasketballIcon,   desc: "Energetic spring bouncing" },
    { id: "neonstrobe",  label: "Neon Reactor",        IconComp: LightbulbIcon,    desc: "Dynamic high-tech strobe" },
    { id: "breathing",   label: "Organic Breath",      IconComp: WindIcon,         desc: "Relaxing deep light expansion" },
];

const INTERACTION_OPTIONS = [
    { id: "none",      label: "🚫 None / Disabled", desc: "No live particle effect on interaction", icon: "ban", color: "#949ba4" },
    { id: "love",      label: "💖 Love Poke",    desc: "Floating romantic hearts and pink spark burst",       icon: "heart",     color: "#f43f5e" },
    { id: "high_five", label: "⭐ High Five",    desc: "Golden stars and high-five blast for besties",        icon: "star",      color: "#f59e0b" },
    { id: "game_ping", label: "🎮 Game Ping",    desc: "Pixel controller and lightning duo match ping",       icon: "gamepad",   color: "#10b981" },
    { id: "fist_bump", label: "👊 Fist Bump",    desc: "Friendly vibe and handshake star confetti",           icon: "handshake", color: "#38bdf8" },
    { id: "hug",       label: "🫂 Warm Hug",     desc: "Comforting heart aura and golden glow",               icon: "paw",       color: "#ec4899" },
    { id: "sparkle",   label: "✨ Magic Sparkle", desc: "Prismatic rainbow stardust shower",                   icon: "sparkles",  color: "#a855f7" },
    { id: "fire",      label: "🔥 Hype Flame",   desc: "Burning embers and fiery adrenaline hype",            icon: "fire",      color: "#ef4444" },
];

const CURATED_PRESETS: UserPreset[] = [
    {
        id: "curated-static",
        name: "Static Minimalist",
        icon: "heart",
        badgeColor: "#ff4081",
        iconColor: "#ffffff",
        theme: "none",
        animation: "none",
        glowSpread: 0,
        glowIntensity: 0,
        glowColor: "#ff4081",
        opacity: 1,
        saturation: 1,
        brightness: 1,
    },
    {
        id: "curated-gold",
        name: "Imperial Royalty",
        icon: "crown",
        badgeColor: "#f59e0b",
        iconColor: "#ffffff",
        theme: "gold",
        animation: "pulse",
        glowSpread: 12,
        glowIntensity: 0.8,
        glowColor: "#f59e0b",
        opacity: 1,
        saturation: 1.1,
        brightness: 1.05,
    },
    {
        id: "curated-cyber",
        name: "Cyberpunk 2077",
        icon: "gem",
        badgeColor: "#00e5ff",
        iconColor: "#ffffff",
        theme: "neon",
        animation: "glitch",
        glowSpread: 16,
        glowIntensity: 0.9,
        glowColor: "#00e5ff",
        opacity: 1,
        saturation: 1.4,
        brightness: 1.1,
    },
    {
        id: "curated-holo",
        name: "Aurora Sunset",
        icon: "heart",
        badgeColor: "#ff4081",
        iconColor: "#ffffff",
        theme: "holographic",
        animation: "shimmer",
        glowSpread: 14,
        glowIntensity: 0.75,
        glowColor: "#ff4081",
        opacity: 1,
        saturation: 1.2,
        brightness: 1.05,
    },
    {
        id: "curated-inferno",
        name: "Inferno Phoenix",
        icon: "fire",
        badgeColor: "#ea580c",
        iconColor: "#fef08a",
        theme: "fire",
        animation: "flame",
        glowSpread: 18,
        glowIntensity: 0.85,
        glowColor: "#ea580c",
        opacity: 1,
        saturation: 1.3,
        brightness: 1.1,
    },
    {
        id: "curated-crystal",
        name: "Glacial Frost",
        icon: "star",
        badgeColor: "#38bdf8",
        iconColor: "#ffffff",
        theme: "crystal",
        animation: "float",
        glowSpread: 12,
        glowIntensity: 0.7,
        glowColor: "#38bdf8",
        opacity: 1,
        saturation: 1,
        brightness: 1.05,
    },
    {
        id: "curated-void",
        name: "Obsidian Void",
        icon: "moon",
        badgeColor: "#9333ea",
        iconColor: "#c084fc",
        theme: "void",
        animation: "breathing",
        glowSpread: 15,
        glowIntensity: 0.8,
        glowColor: "#9333ea",
        opacity: 1,
        saturation: 1.2,
        brightness: 1,
    },
    {
        id: "curated-sakura",
        name: "Sakura Blossom",
        icon: "heart",
        badgeColor: "#f472b6",
        iconColor: "#ffffff",
        theme: "sakura",
        animation: "twinkle",
        glowSpread: 10,
        glowIntensity: 0.65,
        glowColor: "#f472b6",
        opacity: 1,
        saturation: 1.1,
        brightness: 1.05,
    },
    {
        id: "curated-matrix",
        name: "Matrix Netrunner",
        icon: "gem",
        badgeColor: "#22c55e",
        iconColor: "#bbf7d0",
        theme: "matrix",
        animation: "neonstrobe",
        glowSpread: 14,
        glowIntensity: 0.85,
        glowColor: "#22c55e",
        opacity: 1,
        saturation: 1.3,
        brightness: 1.1,
    },
    {
        id: "curated-synthwave",
        name: "Synthwave '84",
        icon: "music",
        badgeColor: "#ff71ce",
        iconColor: "#01cdfe",
        theme: "synthwave",
        animation: "rainbow",
        glowSpread: 16,
        glowIntensity: 0.85,
        glowColor: "#ff71ce",
        opacity: 1,
        saturation: 1.3,
        brightness: 1.1,
    },
];

const MOOD_PRESETS = [
    "Matching profile pictures",
    "Gaming together",
    "Watching movies",
    "In a voice call",
    "Always thinking of you",
    "Forever & Always",
    "Sleeping peacefully",
    "Connected soulmates",
];

const USER_PRESETS_KEY = "HeartLink_user_presets";

type StudioTab = "style" | "themes" | "animations" | "animator" | "presets" | "roles";

export function CustomizationEditor({
    typeId,
    defaultTargetRole,
    defaultSourceRole,
    defaultIcon,
    defaultColor,
    defaultDescription,
    value,
    onChange,
    onClose,
}: CustomizationEditorProps) {
    const [studioTab, setStudioTab] = React.useState<StudioTab>("style");
    const [iconTab, setIconTab] = React.useState<"presets" | "guilds" | "upload">("presets");
    const [customUrlInput, setCustomUrlInput] = React.useState("");

    // Animator custom motion builder states
    const [animMotionType, setAnimMotionType] = React.useState("float");
    const [animDuration, setAnimDuration] = React.useState(2.4);
    const [animIntensity, setAnimIntensity] = React.useState(1.0);

    // Presets Manager State
    const [userPresets, setUserPresets] = React.useState<UserPreset[]>([]);
    const [presetNameInput, setPresetNameInput] = React.useState("");

    // Load user presets on mount
    React.useEffect(() => {
        try {
            const saved = DataStore.get(USER_PRESETS_KEY);
            if (Array.isArray(saved)) {
                setUserPresets(saved);
            }
        } catch {}
    }, []);

    // Parse the 6-part schema: badgeColor:iconColors:sinceDate:fxString:theme:animation
    const rawColorStr = value.customColor || defaultColor || "";
    const [parsedBadgeColor, parsedIconColor, parsedSinceDate, parsedFx, parsedTheme, parsedAnimation] = rawColorStr.split(":");

    // Active state values with defaults
    const activeIcon = value.customIcon || defaultIcon || "heart";
    const activeBadgeColor = value.customBadgeColor || parsedBadgeColor || "#ff4081";
    const activeTheme = value.customTheme || parsedTheme || "isometric";
    const activeAnimation = value.customAnimation || parsedAnimation || "none";
    const activeSinceDate = value.customSinceDate ?? parsedSinceDate ?? "";
    const activeDescription = value.customDescription ?? defaultDescription ?? "";

    // Parse icon colors (up to 3 gradient tones: c1,c2,c3)
    const rawIconColors = value.customIconColor || parsedIconColor || "#ffffff";
    const [c1, c2, c3] = rawIconColors.split(",");
    const iconColor1 = value.customIconColor || c1 || "#ffffff";
    const iconColor2 = value.customIconColor2 || c2 || iconColor1;
    const iconColor3 = value.customIconColor3 || c3 || iconColor2;

    // Parse FX string: op,sat,bright,glowSpread,glowIntensity,glowColor
    const fxParts = (parsedFx || "1,1,1,0,0.6").split(",");
    const activeOpacity = value.customOpacity ?? parseFloat(fxParts[0]) ?? 1.0;
    const activeSaturation = value.customSaturation ?? parseFloat(fxParts[1]) ?? 1.0;
    const activeBrightness = value.customBrightness ?? parseFloat(fxParts[2]) ?? 1.0;
    const activeGlowSpread = value.customGlowSpread ?? parseFloat(fxParts[3]) ?? 0;
    const activeGlowIntensity = value.customGlowIntensity ?? parseFloat(fxParts[4]) ?? 0.6;
    const activeGlowColor = value.customGlowColor || fxParts[5] || activeBadgeColor;

    const theirRole = value.theirRole !== undefined ? value.theirRole : (typeId === "custom" ? "" : defaultTargetRole);
    const yourRole = value.yourRole !== undefined ? value.yourRole : (typeId === "custom" ? "" : defaultSourceRole);

    const currentCombinedIconColor = `${iconColor1},${iconColor2},${iconColor3}`;

    // Helper to push updates up to parent
    function update(changes: Partial<ItemCustomization>) {
        const next: ItemCustomization = {
            ...value,
            ...changes,
        };

        const newBadgeCol = next.customBadgeColor || activeBadgeColor;
        const newIconCol1 = next.customIconColor || iconColor1;
        const newIconCol2 = next.customIconColor2 || iconColor2;
        const newIconCol3 = next.customIconColor3 || iconColor3;
        const combinedIconCol = `${newIconCol1},${newIconCol2},${newIconCol3}`;

        const newSince = next.customSinceDate !== undefined ? next.customSinceDate : activeSinceDate;
        const newOp = (next.customOpacity ?? activeOpacity).toFixed(2);
        const newSat = (next.customSaturation ?? activeSaturation).toFixed(2);
        const newBright = (next.customBrightness ?? activeBrightness).toFixed(2);
        const newGlowSpread = Math.round(next.customGlowSpread ?? activeGlowSpread);
        const newGlowIntensity = (next.customGlowIntensity ?? activeGlowIntensity).toFixed(2);
        const newGlowColor = next.customGlowColor || activeGlowColor;

        const fxStr = `${newOp},${newSat},${newBright},${newGlowSpread},${newGlowIntensity},${newGlowColor}`;
        const newTheme = next.customTheme || activeTheme;
        const newAnim = next.customAnimation || activeAnimation;
        const newInteraction = next.customInteraction || value?.customInteraction || "love";

        next.customColor = `${newBadgeCol}:${combinedIconCol}:${newSince}:${fxStr}:${newTheme}:${newAnim}:${newInteraction}`;
        onChange(next);
    }

    async function handleSavePreset() {
        if (!presetNameInput.trim()) return;
        const newPreset: UserPreset = {
            id: `user-${Date.now()}`,
            name: presetNameInput.trim(),
            icon: activeIcon,
            badgeColor: activeBadgeColor,
            iconColor: currentCombinedIconColor,
            theme: activeTheme,
            animation: activeAnimation,
            glowSpread: activeGlowSpread,
            glowIntensity: activeGlowIntensity,
            glowColor: activeGlowColor,
            opacity: activeOpacity,
            saturation: activeSaturation,
            brightness: activeBrightness,
        };

        const updated = [newPreset, ...userPresets];
        setUserPresets(updated);
        setPresetNameInput("");
        try {
            await DataStore.set(USER_PRESETS_KEY, updated);
        } catch {}
    }

    async function handleDeletePreset(presetId: string, e: React.MouseEvent) {
        e.stopPropagation();
        const updated = userPresets.filter(p => p.id !== presetId);
        setUserPresets(updated);
        try {
            await DataStore.set(USER_PRESETS_KEY, updated);
        } catch {}
    }

    function applyPreset(p: UserPreset) {
        update({
            customIcon: p.icon,
            customBadgeColor: p.badgeColor,
            customIconColor: p.iconColor.split(",")[0],
            customIconColor2: p.iconColor.split(",")[1],
            customIconColor3: p.iconColor.split(",")[2],
            customTheme: p.theme,
            customAnimation: p.animation,
            customGlowSpread: p.glowSpread,
            customGlowIntensity: p.glowIntensity,
            customGlowColor: p.glowColor,
            customOpacity: p.opacity,
            customSaturation: p.saturation,
            customBrightness: p.brightness,
        });
    }

    return (
        <div className="hl-studio-container">
            {/* 1. Live Ultra-Crisp Hero Preview Header */}
            <div className="hl-studio-preview-hero">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Chat Badge Preview */}
                    <div
                        className={`hl-badge-embossed ${activeTheme && activeTheme !== "isometric" && activeTheme !== "none" ? `hl-theme-${activeTheme}` : ""} ${activeAnimation && activeAnimation !== "none" ? `hl-anim-${activeAnimation}` : ""}`}
                        style={{
                            "--badge-color": activeBadgeColor,
                            "--badge-glow-spread": `${activeGlowSpread}px`,
                            "--badge-glow-intensity": activeGlowIntensity,
                            "--badge-glow-color": activeGlowColor,
                            "--hl-anim-duration": `${animDuration}s`,
                            "--hl-anim-intensity": animIntensity,
                            padding: "6px 14px",
                            fontSize: 13,
                            opacity: activeOpacity,
                            filter: `saturate(${activeSaturation}) brightness(${activeBrightness})`,
                            cursor: "pointer",
                        } as any}
                    >
                        <RelationshipIcon type={activeIcon} size={16} customColor={currentCombinedIconColor} />
                        <span className="hl-badge-text" style={{ marginLeft: 4 }}>
                            @{theirRole || "Role Title"}
                        </span>
                    </div>

                    {/* Compact Badge Preview */}
                    <div
                        className={`hl-badge-embossed hl-badge-compact ${activeTheme && activeTheme !== "isometric" && activeTheme !== "none" ? `hl-theme-${activeTheme}` : ""} ${activeAnimation && activeAnimation !== "none" ? `hl-anim-${activeAnimation}` : ""}`}
                        style={{
                            "--badge-color": activeBadgeColor,
                            "--badge-glow-spread": `${activeGlowSpread}px`,
                            "--badge-glow-intensity": activeGlowIntensity,
                            "--badge-glow-color": activeGlowColor,
                            "--hl-anim-duration": `${animDuration}s`,
                            "--hl-anim-intensity": animIntensity,
                            opacity: activeOpacity,
                            filter: `saturate(${activeSaturation}) brightness(${activeBrightness})`,
                            cursor: "pointer",
                        } as any}
                    >
                        <RelationshipIcon type={activeIcon} size={13} customColor={currentCombinedIconColor} />
                    </div>
                </div>

                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-experiment, #5865f2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Live Badge Studio
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted, #949ba4)", marginTop: 2 }}>
                        Hover over badges to test glint sweep
                    </div>
                </div>
            </div>

            {/* 2. Studio Navigation Tabs with Clean FontAwesome Icons */}
            <div className="hl-studio-tab-bar">
                <button
                    type="button"
                    className={`hl-studio-tab-btn ${studioTab === "style" ? "hl-studio-tab-btn--active" : ""}`}
                    onClick={() => setStudioTab("style")}
                >
                    <PaletteIcon size={14} />
                    <span>Style &amp; Glow</span>
                </button>
                <button
                    type="button"
                    className={`hl-studio-tab-btn ${studioTab === "themes" ? "hl-studio-tab-btn--active" : ""}`}
                    onClick={() => setStudioTab("themes")}
                >
                    <SparklesIcon size={14} />
                    <span>Themes ({THEME_OPTIONS.length})</span>
                </button>
                <button
                    type="button"
                    className={`hl-studio-tab-btn ${studioTab === "animations" ? "hl-studio-tab-btn--active" : ""}`}
                    onClick={() => setStudioTab("animations")}
                >
                    <FilmIcon size={14} />
                    <span>Animations ({ANIMATION_OPTIONS.length})</span>
                </button>
                <button
                    type="button"
                    className={`hl-studio-tab-btn ${studioTab === "animator" ? "hl-studio-tab-btn--active" : ""}`}
                    onClick={() => setStudioTab("animator")}
                >
                    <BoltIcon size={14} />
                    <span>Animator</span>
                </button>
                <button
                    type="button"
                    className={`hl-studio-tab-btn ${studioTab === "presets" ? "hl-studio-tab-btn--active" : ""}`}
                    onClick={() => setStudioTab("presets")}
                >
                    <FloppyDiskIcon size={14} />
                    <span>Presets ({CURATED_PRESETS.length + userPresets.length})</span>
                </button>
                <button
                    type="button"
                    className={`hl-studio-tab-btn ${studioTab === "roles" ? "hl-studio-tab-btn--active" : ""}`}
                    onClick={() => setStudioTab("roles")}
                >
                    <InfoCircleIcon size={14} />
                    <span>Roles &amp; Date</span>
                </button>
            </div>

            {/* 3. Tab Contents */}

            {/* TAB 1: STYLE & GLOW */}
            {studioTab === "style" && (
                <div className="hl-studio-section">
                    {/* Icon Selection Pills */}
                    <div>
                        <label className="hl-field-label" style={{ marginBottom: 6, display: "block" }}>
                            Badge Symbol / Icon
                        </label>
                        <div className="hl-tab-pills" style={{ marginBottom: 8 }}>
                            <button
                                className={`hl-tab-pill ${iconTab === "presets" ? "hl-tab-pill--active" : ""}`}
                                onClick={() => setIconTab("presets")}
                                type="button"
                            >
                                Standard Icons ({ICON_OPTIONS.length})
                            </button>
                            <button
                                className={`hl-tab-pill ${iconTab === "guilds" ? "hl-tab-pill--active" : ""}`}
                                onClick={() => setIconTab("guilds")}
                                type="button"
                            >
                                Clan Badges
                            </button>
                            <button
                                className={`hl-tab-pill ${iconTab === "upload" ? "hl-tab-pill--active" : ""}`}
                                onClick={() => setIconTab("upload")}
                                type="button"
                            >
                                Custom URL
                            </button>
                        </div>

                        {iconTab === "presets" && (
                            <div className="hl-icon-grid" style={{ maxHeight: 115, overflowY: "auto", padding: 4 }}>
                                {ICON_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        className={`hl-icon-btn ${activeIcon === opt.id ? "hl-icon-btn--active" : ""}`}
                                        onClick={() => update({ customIcon: opt.id })}
                                        title={opt.label}
                                    >
                                        <opt.IconComp size={18} color="#ffffff" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {iconTab === "guilds" && (
                            <div className="hl-icon-grid" style={{ maxHeight: 115, overflowY: "auto", padding: 4 }}>
                                {GUILD_BADGES.map(badge => (
                                    <button
                                        key={badge.id}
                                        type="button"
                                        className={`hl-icon-btn ${activeIcon === badge.id ? "hl-icon-btn--active" : ""}`}
                                        onClick={() => update({ customIcon: badge.id })}
                                        title={badge.label}
                                    >
                                        <RelationshipIcon type={badge.id} size={18} customColor={activeIcon === badge.id ? "#ffffff" : "#f2f3f5"} />
                                    </button>
                                ))}
                            </div>
                        )}

                        {iconTab === "upload" && (
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <input
                                    type="text"
                                    className="hl-field-input"
                                    placeholder="Paste PNG / GIF / SVG image URL..."
                                    value={customUrlInput}
                                    onChange={e => setCustomUrlInput(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="hl-btn hl-btn--secondary hl-btn--sm"
                                    onClick={() => {
                                        if (customUrlInput.trim()) {
                                            update({ customIcon: customUrlInput.trim() });
                                            setCustomUrlInput("");
                                        }
                                    }}
                                >
                                    <UploadIcon size={12} /> Apply URL
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Colors & Gradient Section */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {/* Badge Background / Enamel */}
                        <div>
                            <label className="hl-field-label" style={{ marginBottom: 6, display: "block" }}>
                                3D Enamel Base Color
                            </label>
                            <div className="hl-color-palette" style={{ marginBottom: 6 }}>
                                {BADGE_COLOR_PALETTE.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={`hl-color-swatch ${activeBadgeColor.toLowerCase() === c.toLowerCase() ? "hl-color-swatch--active" : ""}`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => update({ customBadgeColor: c, customGlowColor: c })}
                                    >
                                        {activeBadgeColor.toLowerCase() === c.toLowerCase() && (
                                            <CheckIcon size={11} color={c === "#ffffff" ? "#000000" : "#ffffff"} />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <input
                                    type="color"
                                    className="hl-color-picker-input"
                                    value={activeBadgeColor.startsWith("#") && activeBadgeColor.length === 7 ? activeBadgeColor : "#ff4081"}
                                    onChange={e => update({ customBadgeColor: e.target.value, customGlowColor: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="hl-field-input"
                                    style={{ width: 90, padding: "4px 8px", fontSize: 11 }}
                                    value={activeBadgeColor}
                                    onChange={e => update({ customBadgeColor: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Icon Multi-Tone / Gradient */}
                        <div>
                            <label className="hl-field-label" style={{ marginBottom: 6, display: "block" }}>
                                Icon Color (Tri-Tone Gradient)
                            </label>
                            <div className="hl-color-palette" style={{ marginBottom: 6 }}>
                                {ICON_COLOR_PALETTE.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={`hl-color-swatch ${iconColor1.toLowerCase() === c.toLowerCase() ? "hl-color-swatch--active" : ""}`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => update({ customIconColor: c, customIconColor2: c, customIconColor3: c })}
                                    >
                                        {iconColor1.toLowerCase() === c.toLowerCase() && (
                                            <CheckIcon size={11} color={c === "#ffffff" ? "#000000" : "#ffffff"} />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <input
                                    type="color"
                                    className="hl-color-picker-input"
                                    title="Primary Tone"
                                    value={iconColor1.startsWith("#") && iconColor1.length === 7 ? iconColor1 : "#ffffff"}
                                    onChange={e => update({ customIconColor: e.target.value })}
                                />
                                <input
                                    type="color"
                                    className="hl-color-picker-input"
                                    title="Gradient Secondary Tone"
                                    value={iconColor2.startsWith("#") && iconColor2.length === 7 ? iconColor2 : "#ffffff"}
                                    onChange={e => update({ customIconColor2: e.target.value })}
                                />
                                <input
                                    type="color"
                                    className="hl-color-picker-input"
                                    title="Gradient Accent Tone"
                                    value={iconColor3.startsWith("#") && iconColor3.length === 7 ? iconColor3 : "#ffffff"}
                                    onChange={e => update({ customIconColor3: e.target.value })}
                                />
                                <button
                                    type="button"
                                    className="hl-btn hl-btn--secondary hl-btn--sm"
                                    style={{ fontSize: 10, padding: "3px 6px" }}
                                    onClick={() => update({ customIconColor: "#ffffff", customIconColor2: "#ffffff", customIconColor3: "#ffffff" })}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* FX & Glow Control Sliders */}
                    <div className="hl-studio-slider-container">
                        <div className="hl-studio-slider-row">
                            <span className="hl-studio-slider-label">Glow Bloom Spread</span>
                            <input
                                type="range"
                                className="hl-studio-slider-input"
                                min="0"
                                max="25"
                                step="1"
                                value={activeGlowSpread}
                                onChange={e => update({ customGlowSpread: parseFloat(e.target.value) })}
                            />
                            <span className="hl-studio-slider-val">{Math.round(activeGlowSpread)}px</span>
                        </div>

                        <div className="hl-studio-slider-row">
                            <span className="hl-studio-slider-label">Glow Intensity</span>
                            <input
                                type="range"
                                className="hl-studio-slider-input"
                                min="0"
                                max="1"
                                step="0.05"
                                value={activeGlowIntensity}
                                onChange={e => update({ customGlowIntensity: parseFloat(e.target.value) })}
                            />
                            <span className="hl-studio-slider-val">{Math.round(activeGlowIntensity * 100)}%</span>
                        </div>

                        <div className="hl-studio-slider-row">
                            <span className="hl-studio-slider-label">Badge Brightness</span>
                            <input
                                type="range"
                                className="hl-studio-slider-input"
                                min="0.6"
                                max="1.6"
                                step="0.05"
                                value={activeBrightness}
                                onChange={e => update({ customBrightness: parseFloat(e.target.value) })}
                            />
                            <span className="hl-studio-slider-val">{Math.round(activeBrightness * 100)}%</span>
                        </div>

                        <div className="hl-studio-slider-row">
                            <span className="hl-studio-slider-label">Color Saturation</span>
                            <input
                                type="range"
                                className="hl-studio-slider-input"
                                min="0.5"
                                max="2.0"
                                step="0.05"
                                value={activeSaturation}
                                onChange={e => update({ customSaturation: parseFloat(e.target.value) })}
                            />
                            <span className="hl-studio-slider-val">{Math.round(activeSaturation * 100)}%</span>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: THEME SHADERS */}
            {studioTab === "themes" && (
                <div className="hl-studio-section">
                    <div style={{ fontSize: 12, color: "var(--text-muted, #949ba4)", marginBottom: 4 }}>
                        Select a 3D shader preset to completely transform the surface material, reflections, and border effects.
                    </div>
                    <div className="hl-studio-grid-themes" style={{ maxHeight: 280, overflowY: "auto", overflowX: "hidden", paddingRight: 4 }}>
                        {THEME_OPTIONS.map(theme => {
                            const isSelected = (activeTheme || "none") === theme.id;
                            return (
                                <div
                                    key={theme.id}
                                    className={`hl-studio-theme-card ${isSelected ? "hl-studio-theme-card--selected" : ""}`}
                                    onClick={() => update({ customTheme: theme.id })}
                                >
                                    <div
                                        className={`hl-badge-embossed ${theme.id !== "isometric" && theme.id !== "none" ? `hl-theme-${theme.id}` : ""} ${activeAnimation && activeAnimation !== "none" ? `hl-anim-${activeAnimation}` : ""}`}
                                        style={{
                                            "--badge-color": activeBadgeColor,
                                            "--badge-glow-spread": `${activeGlowSpread}px`,
                                            "--badge-glow-intensity": activeGlowIntensity,
                                            "--badge-glow-color": activeGlowColor,
                                            padding: "4px 10px",
                                            fontSize: 11,
                                            pointerEvents: "none",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                        } as any}
                                    >
                                        <RelationshipIcon type={activeIcon} size={13} customColor={currentCombinedIconColor} />
                                        <span className="hl-badge-text" style={{ fontSize: 11 }}>
                                            {theirRole || "Preview"}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: isSelected ? "#ffffff" : "var(--header-primary, #f2f3f5)" }}>
                                        <theme.IconComp size={14} />
                                        <span>{theme.label}</span>
                                    </div>
                                    <div style={{ fontSize: 10, color: "var(--text-muted, #949ba4)" }}>
                                        {theme.desc}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 3: ANIMATIONS */}
            {studioTab === "animations" && (
                <div className="hl-studio-section">
                    <div style={{ fontSize: 12, color: "var(--text-muted, #949ba4)", marginBottom: 4 }}>
                        Add ambient live animations that play continuously across chat, member lists, and profile badges.
                    </div>
                    <div className="hl-studio-grid-themes" style={{ maxHeight: 280, overflowY: "auto", overflowX: "hidden", paddingRight: 4 }}>
                        {ANIMATION_OPTIONS.map(anim => {
                            const isSelected = (activeAnimation || "none") === anim.id;
                            return (
                                <div
                                    key={anim.id}
                                    className={`hl-studio-theme-card ${isSelected ? "hl-studio-theme-card--selected" : ""}`}
                                    onClick={() => update({ customAnimation: anim.id })}
                                >
                                    <div
                                        className={`hl-badge-embossed ${activeTheme && activeTheme !== "isometric" && activeTheme !== "none" ? `hl-theme-${activeTheme}` : ""} ${anim.id !== "none" ? `hl-anim-${anim.id}` : ""}`}
                                        style={{
                                            "--badge-color": activeBadgeColor,
                                            "--badge-glow-spread": `${activeGlowSpread}px`,
                                            "--badge-glow-intensity": activeGlowIntensity,
                                            "--badge-glow-color": activeGlowColor,
                                            "--hl-anim-duration": `${animDuration}s`,
                                            "--hl-anim-intensity": animIntensity,
                                            padding: "4px 10px",
                                            fontSize: 11,
                                            pointerEvents: "none",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                        } as any}
                                    >
                                        <RelationshipIcon type={activeIcon} size={13} customColor={currentCombinedIconColor} />
                                        <span className="hl-badge-text" style={{ fontSize: 11 }}>
                                            {theirRole || "Preview"}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: isSelected ? "#ffffff" : "var(--header-primary, #f2f3f5)" }}>
                                        <anim.IconComp size={14} />
                                        <span>{anim.label}</span>
                                    </div>
                                    <div style={{ fontSize: 10, color: "var(--text-muted, #949ba4)" }}>
                                        {anim.desc}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 4: CUSTOM ANIMATOR */}
            {studioTab === "animator" && (
                <div className="hl-studio-section">
                    <div style={{ fontSize: 12, color: "var(--text-muted, #949ba4)", marginBottom: 6 }}>
                        Create a custom badge motion curve and adjust cycle duration and movement intensity.
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
                        {[
                            { id: "none",  label: "Static / None", icon: <PauseIcon size={14} /> },
                            { id: "float", label: "Floating Wave", icon: <WaveIcon size={14} /> },
                            { id: "pulse", label: "Scale Pulse", icon: <HeartPulseIcon size={14} /> },
                            { id: "flip",  label: "3D Spin", icon: <RotateIcon size={14} /> },
                            { id: "glow",  label: "Glow Surge", icon: <SunIcon size={14} /> },
                            { id: "bounce", label: "Spring Bounce", icon: <BasketballIcon size={14} /> },
                        ].map(m => (
                            <button
                                key={m.id}
                                type="button"
                                className={`hl-btn hl-btn--sm ${animMotionType === m.id ? "hl-btn--primary" : "hl-btn--secondary"}`}
                                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                                onClick={() => {
                                    setAnimMotionType(m.id);
                                    update({ customAnimation: m.id });
                                }}
                            >
                                {m.icon}
                                <span>{m.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="hl-studio-slider-container">
                        <div className="hl-studio-slider-row">
                            <span className="hl-studio-slider-label">Cycle Duration</span>
                            <input
                                type="range"
                                className="hl-studio-slider-input"
                                min="0.5"
                                max="4.0"
                                step="0.1"
                                value={animDuration}
                                onChange={e => {
                                    const val = parseFloat(e.target.value);
                                    setAnimDuration(val);
                                }}
                            />
                            <span className="hl-studio-slider-val">{animDuration.toFixed(1)}s</span>
                        </div>

                        <div className="hl-studio-slider-row">
                            <span className="hl-studio-slider-label">Motion Intensity</span>
                            <input
                                type="range"
                                className="hl-studio-slider-input"
                                min="0.3"
                                max="2.0"
                                step="0.1"
                                value={animIntensity}
                                onChange={e => {
                                    const val = parseFloat(e.target.value);
                                    setAnimIntensity(val);
                                }}
                            />
                            <span className="hl-studio-slider-val">{Math.round(animIntensity * 100)}%</span>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5: PRESETS MANAGER */}
            {studioTab === "presets" && (
                <div className="hl-studio-section">
                    {/* Save Current Style as Preset */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                        <input
                            type="text"
                            className="hl-field-input"
                            placeholder="Name your custom preset (e.g. My Neon Look)..."
                            value={presetNameInput}
                            onChange={e => setPresetNameInput(e.target.value)}
                        />
                        <button
                            type="button"
                            className="hl-btn hl-btn--primary hl-btn--sm"
                            style={{ whiteSpace: "nowrap", padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
                            onClick={handleSavePreset}
                        >
                            <FloppyDiskIcon size={12} /> Save Current Style
                        </button>
                    </div>

                    {/* User Saved Presets */}
                    {userPresets.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--header-primary)", textTransform: "uppercase", marginBottom: 6 }}>
                                Your Saved Presets ({userPresets.length})
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 120, overflowY: "auto" }}>
                                {userPresets.map(p => (
                                    <div
                                        key={p.id}
                                        className="hl-studio-preset-card"
                                        onClick={() => applyPreset(p)}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div
                                                className={`hl-badge-embossed ${p.theme !== "isometric" ? `hl-theme-${p.theme}` : ""} ${p.animation !== "none" ? `hl-anim-${p.animation}` : ""}`}
                                                style={{
                                                    "--badge-color": p.badgeColor,
                                                    "--badge-glow-spread": `${p.glowSpread}px`,
                                                    "--badge-glow-intensity": p.glowIntensity,
                                                    "--badge-glow-color": p.glowColor,
                                                    padding: "3px 8px",
                                                    fontSize: 11,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 4,
                                                } as any}
                                            >
                                                <RelationshipIcon type={p.icon} size={12} customColor={p.iconColor} />
                                                <span className="hl-badge-text" style={{ fontSize: 10 }}>Preview</span>
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--header-primary)" }}>{p.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="hl-btn hl-btn--ghost hl-btn--sm"
                                            style={{ color: "#ef4444", padding: "2px 6px", display: "inline-flex", alignItems: "center", gap: 4 }}
                                            onClick={e => handleDeletePreset(p.id, e)}
                                        >
                                            <TrashIcon size={12} /> Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Curated Discord Presets */}
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--header-primary)", textTransform: "uppercase", marginBottom: 6 }}>
                            Curated Legendary Presets
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, maxHeight: 180, overflowY: "auto", overflowX: "hidden", paddingRight: 4 }}>
                            {CURATED_PRESETS.map(p => (
                                <div
                                    key={p.id}
                                    className="hl-studio-preset-card"
                                    onClick={() => applyPreset(p)}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                        <div
                                            className={`hl-badge-embossed ${p.theme !== "isometric" && p.theme !== "none" ? `hl-theme-${p.theme}` : ""} ${p.animation !== "none" ? `hl-anim-${p.animation}` : ""}`}
                                            style={{
                                                "--badge-color": p.badgeColor,
                                                "--badge-glow-spread": `${p.glowSpread}px`,
                                                "--badge-glow-intensity": p.glowIntensity,
                                                "--badge-glow-color": p.glowColor,
                                                padding: "3px 8px",
                                                fontSize: 11,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 4,
                                                flexShrink: 0,
                                            } as any}
                                        >
                                            <RelationshipIcon type={p.icon} size={12} customColor={p.iconColor} />
                                            <span className="hl-badge-text" style={{ fontSize: 10 }}>{p.name.split(" ")[0]}</span>
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--header-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {p.name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 6: ROLES & INFO */}
            {studioTab === "roles" && (
                <div className="hl-studio-section">
                    <div>
                        <label className="hl-field-label">Custom Display Role Name</label>
                        <input
                            type="text"
                            className="hl-field-input"
                            value={theirRole}
                            placeholder="e.g. Wife, Bestie, Queen, Gaming Duo"
                            onChange={e => update({ theirRole: e.target.value })}
                        />
                    </div>

                    <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                            <label className="hl-field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <CalendarDaysIcon size={13} color="#10b981" />
                                <span>Together Since (Anniversary Date)</span>
                            </label>
                            <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>
                                Synced for both partners
                            </span>
                        </div>
                        <input
                            type="date"
                            className="hl-field-input"
                            value={activeSinceDate}
                            onChange={e => update({ customSinceDate: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="hl-field-label" style={{ marginBottom: 4, display: "block" }}>
                            Relationship Status / Mood Message
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                            {MOOD_PRESETS.map(m => {
                                const isSelected = activeDescription.split("||")[0]?.trim() === m;
                                return (
                                    <button
                                        key={m}
                                        type="button"
                                        className={`hl-btn hl-btn--sm ${isSelected ? "hl-btn--primary" : "hl-btn--secondary"}`}
                                        style={{ fontSize: 11 }}
                                        onClick={() => update({ customDescription: m })}
                                    >
                                        {m}
                                    </button>
                                );
                            })}
                        </div>
                        <input
                            type="text"
                            className="hl-field-input"
                            value={activeDescription}
                            placeholder="Write a custom quote or note..."
                            onChange={e => update({ customDescription: e.target.value })}
                        />
                    </div>

                    {/* Interactive Action Poke Type */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                            <label className="hl-field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <SparklesIcon size={13} color="#f43f5e" />
                                <span>Interactive Action / Poke Type</span>
                            </label>
                            <span style={{ fontSize: 10, color: "var(--text-muted, #949ba4)" }}>
                                Live particle burst on click
                            </span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                            {INTERACTION_OPTIONS.map(intOpt => {
                                const currentInt = value?.customInteraction || "love";
                                const isSelected = currentInt === intOpt.id;
                                return (
                                    <button
                                        key={intOpt.id}
                                        type="button"
                                        className={`hl-btn hl-btn--sm ${isSelected ? "hl-btn--primary" : "hl-btn--secondary"}`}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 8,
                                            justifyContent: "flex-start",
                                            padding: "7px 10px",
                                            borderRadius: 8,
                                        }}
                                        onClick={() => update({ customInteraction: intOpt.id })}
                                    >
                                        <RelationshipIcon type={intOpt.icon} size={14} customColor={isSelected ? "#ffffff" : intOpt.color} />
                                        <div style={{ textAlign: "left", lineHeight: 1.2 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700 }}>{intOpt.label}</div>
                                            <div style={{ fontSize: 9.5, color: isSelected ? "rgba(255,255,255,0.8)" : "var(--text-muted, #949ba4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>
                                                {intOpt.desc}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Action Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                <button
                    type="button"
                    className="hl-btn hl-btn--primary"
                    style={{ padding: "8px 24px", fontWeight: 800, borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 6 }}
                    onClick={onClose}
                >
                    <CheckIcon size={13} />
                    <span>Save &amp; Apply Customization</span>
                </button>
            </div>
        </div>
    );
}
