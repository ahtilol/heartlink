import { showToast, Toasts } from "@webpack/common";

export type InteractionType = "none" | "love" | "high_five" | "game_ping" | "fist_bump" | "hug" | "sparkle" | "fire";

export interface InteractionMeta {
    id: InteractionType;
    label: string;
    actionVerb: string;
    buttonText: string;
    icon: string;
    badgeEmoji: string;
    primaryColor: string;
    gradient: string;
    particleColors: string[];
    paths: string[];
    defaultToast: (sender: string, recipient: string, msg?: string) => string;
}

// High-fidelity FontAwesome 6 SVG path data for particle fountains
const PATH_HEART = "M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z";
const PATH_STAR = "M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z";
const PATH_SPARKLE = "M256 0L295 161L456 200L295 239L256 400L217 239L56 200L217 161Z";
const PATH_BOLT = "M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288H175.5L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-29.9-20.7H272.5L349.4 44.6z";
const PATH_GAMEPAD = "M512 256A256 256 0 1 0 0 256a256 256 0 1 0 512 0zM232 168c0-13.3-10.7-24-24-24s-24 10.7-24 24v40H144c-13.3 0-24 10.7-24 24s10.7 24 24 24h40v40c0 13.3 10.7 24 24 24s24-10.7 24-24V256h40c13.3 0 24-10.7 24-24s-10.7-24-24-24H232V168zm144 64a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm32 64a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z";
const PATH_FIRE = "M159.3 5.4c7.8-7.3 19.9-7.2 27.7 .1c27.6 26 62.1 63.8 85.5 101.4c23.5 37.7 39.5 77.2 39.5 117.1c0 79.5-64.5 144-144 144S24 303.5 24 224c0-23.9 5.8-48 16.9-70.1c1.3-2.5 3-4.7 5.1-6.6l.8-.7c30.2-26.6 67.2-76.3 112.5-141.2z";
const PATH_HAND = "M311.9 260.8L160 353.6V448c0 35.3 28.7 64 64 64h224c35.3 0 64-28.7 64-64V363.8c0-12.7-5.1-24.9-14.1-33.9L408.8 240.8c-12-12-28.3-18.8-45.3-18.8h-6.2c-17 0-33.3 6.7-45.3 18.8z";

export const INTERACTION_REGISTRY: Record<InteractionType, InteractionMeta> = {
    none: {
        id: "none",
        label: "None / Disabled",
        actionVerb: "interacted with",
        buttonText: "Interaction Disabled",
        icon: "ban",
        badgeEmoji: "🚫",
        primaryColor: "#949ba4",
        gradient: "linear-gradient(135deg, #4e5058 0%, #313338 100%)",
        particleColors: [],
        paths: [],
        defaultToast: (sender, recipient) => `@${sender} interacted with @${recipient}`,
    },
    love: {
        id: "love",
        label: "Love Poke",
        actionVerb: "sent a Love Poke to",
        buttonText: "Send Love Poke",
        icon: "heart",
        badgeEmoji: "💖",
        primaryColor: "#f43f5e",
        gradient: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)",
        particleColors: ["#f43f5e", "#ff4081", "#ec4899", "#fb7185", "#fda4af", "#ff2d55"],
        paths: [PATH_HEART, PATH_SPARKLE],
        defaultToast: (sender, recipient, msg) => `💖 @${sender} sent a Love Poke to @${recipient}! ${msg ? `"${msg}"` : "💕"}`,
    },
    high_five: {
        id: "high_five",
        label: "High Five",
        actionVerb: "gave an epic High Five to",
        buttonText: "Send High Five",
        icon: "star",
        badgeEmoji: "⭐",
        primaryColor: "#f59e0b",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
        particleColors: ["#f59e0b", "#fbbf24", "#facc15", "#fde047", "#ffffff", "#ea580c"],
        paths: [PATH_STAR, PATH_SPARKLE],
        defaultToast: (sender, recipient, msg) => `⭐ @${sender} gave @${recipient} an epic High Five! ${msg ? `"${msg}"` : "✨"}`,
    },
    game_ping: {
        id: "game_ping",
        label: "Game Ping",
        actionVerb: "pinged for a Duo Match",
        buttonText: "Send Game Ping",
        icon: "gamepad",
        badgeEmoji: "🎮",
        primaryColor: "#10b981",
        gradient: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
        particleColors: ["#10b981", "#34d399", "#06b6d4", "#38bdf8", "#84cc16", "#22c55e"],
        paths: [PATH_GAMEPAD, PATH_BOLT, PATH_SPARKLE],
        defaultToast: (sender, recipient, msg) => `🎮 @${sender} pinged @${recipient} for a Gaming Session! ${msg ? `"${msg}"` : "GG!"}`,
    },
    fist_bump: {
        id: "fist_bump",
        label: "Fist Bump",
        actionVerb: "fist-bumped",
        buttonText: "Send Fist Bump",
        icon: "handshake",
        badgeEmoji: "👊",
        primaryColor: "#38bdf8",
        gradient: "linear-gradient(135deg, #38bdf8 0%, #5865f2 100%)",
        particleColors: ["#38bdf8", "#60a5fa", "#5865f2", "#818cf8", "#c084fc", "#ffffff"],
        paths: [PATH_HAND, PATH_STAR, PATH_SPARKLE],
        defaultToast: (sender, recipient, msg) => `👊 @${sender} sent a Fist Bump to @${recipient}! ${msg ? `"${msg}"` : "🤝"}`,
    },
    hug: {
        id: "hug",
        label: "Warm Hug",
        actionVerb: "sent a warm hug to",
        buttonText: "Send Warm Hug",
        icon: "paw",
        badgeEmoji: "🫂",
        primaryColor: "#ec4899",
        gradient: "linear-gradient(135deg, #ec4899 0%, #c084fc 100%)",
        particleColors: ["#ec4899", "#f472b6", "#c084fc", "#e879f9", "#fda4af", "#ffffff"],
        paths: [PATH_HEART, PATH_SPARKLE],
        defaultToast: (sender, recipient, msg) => `🫂 @${sender} sent a warm, comforting hug to @${recipient}! ${msg ? `"${msg}"` : "✨"}`,
    },
    sparkle: {
        id: "sparkle",
        label: "Magic Sparkle",
        actionVerb: "blessed with magic sparkles",
        buttonText: "Send Sparkles",
        icon: "sparkles",
        badgeEmoji: "✨",
        primaryColor: "#a855f7",
        gradient: "linear-gradient(135deg, #a855f7 0%, #e879f9 100%)",
        particleColors: ["#a855f7", "#c084fc", "#e879f9", "#f43f5e", "#fbbf24", "#38bdf8"],
        paths: [PATH_SPARKLE, PATH_STAR],
        defaultToast: (sender, recipient, msg) => `✨ @${sender} showered @${recipient} with shimmering sparkles! ${msg ? `"${msg}"` : "🌟"}`,
    },
    fire: {
        id: "fire",
        label: "Hype Flame",
        actionVerb: "sent hype flames to",
        buttonText: "Send Hype Flame",
        icon: "fire",
        badgeEmoji: "🔥",
        primaryColor: "#ef4444",
        gradient: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
        particleColors: ["#ef4444", "#f87171", "#f97316", "#fb923c", "#fbbf24", "#ffffff"],
        paths: [PATH_FIRE, PATH_SPARKLE],
        defaultToast: (sender, recipient, msg) => `🔥 @${sender} sent pure hype flames to @${recipient}! ${msg ? `"${msg}"` : "⚡"}`,
    },
};

/**
 * Determine the default interaction style based on the role title or configured preference
 */
export function getInteractionForRole(roleName?: string, explicitChoice?: string): InteractionMeta {
    if (explicitChoice && INTERACTION_REGISTRY[explicitChoice as InteractionType]) {
        return INTERACTION_REGISTRY[explicitChoice as InteractionType];
    }

    const r = (roleName || "").toLowerCase();

    // 1. Romantic Partners
    if (r.includes("wife") || r.includes("husband") || r.includes("girlfriend") || r.includes("boyfriend") || r.includes("fianc") || r.includes("love") || r.includes("partner") || r.includes("soulmate") || r.includes("crush")) {
        return INTERACTION_REGISTRY.love;
    }

    // 2. Best Friends / Besties
    if (r.includes("best") || r.includes("bff") || r.includes("bestie") || r.includes("twin") || r.includes("homie")) {
        return INTERACTION_REGISTRY.high_five;
    }

    // 3. Gaming Duos
    if (r.includes("game") || r.includes("gaming") || r.includes("duo") || r.includes("carry") || r.includes("support") || r.includes("gamer") || r.includes("squad")) {
        return INTERACTION_REGISTRY.game_ping;
    }

    // 4. Hype / Rival / Fire
    if (r.includes("hype") || r.includes("fire") || r.includes("rival") || r.includes("boss") || r.includes("king") || r.includes("queen")) {
        return INTERACTION_REGISTRY.fire;
    }

    // 5. Default Friendship
    if (r.includes("friend") || r.includes("buddy") || r.includes("pal") || r.includes("bro") || r.includes("sister") || r.includes("brother")) {
        return INTERACTION_REGISTRY.fist_bump;
    }

    return INTERACTION_REGISTRY.love;
}

/**
 * Interactive Particle Fountain Trigger
 */
export function triggerInteractionEffect(
    senderName: string,
    recipientName: string,
    interactionOrRole?: InteractionType | string,
    customMessage?: string
) {
    const meta = getInteractionForRole(typeof interactionOrRole === "string" ? interactionOrRole : undefined, typeof interactionOrRole === "string" && INTERACTION_REGISTRY[interactionOrRole as InteractionType] ? interactionOrRole : undefined);

    if (meta.id === "none") {
        showToast(`@${senderName} poked @${recipientName}`, Toasts.Type.MESSAGE);
        return;
    }

    // 1. Display Toast Alert
    showToast(
        meta.defaultToast(senderName, recipientName, customMessage),
        Toasts.Type.SUCCESS
    );

    // 2. Spawn glowing vector fountain particles
    if (typeof document === "undefined") return;

    const container = document.createElement("div");
    container.className = "hl-particle-burst-container";
    document.body.appendChild(container);

    const count = 22;
    for (let i = 0; i < count; i++) {
        const pathData = meta.paths[i % meta.paths.length];
        const color = meta.particleColors[Math.floor(Math.random() * meta.particleColors.length)];

        const wrapper = document.createElement("div");
        wrapper.className = "hl-floating-heart-particle";

        const size = Math.random() * 14 + 18; // 18px to 32px
        const startX = 50 + (Math.random() - 0.5) * 36; // Centered fountain spread
        const startY = 76 + (Math.random() - 0.5) * 14;
        const duration = Math.random() * 1.2 + 1.6; // 1.6s to 2.8s
        const delay = Math.random() * 0.32;
        const drift = (Math.random() - 0.5) * 220;

        wrapper.style.left = `${startX}vw`;
        wrapper.style.top = `${startY}vh`;
        wrapper.style.width = `${size}px`;
        wrapper.style.height = `${size}px`;
        wrapper.style.animationDuration = `${duration}s`;
        wrapper.style.animationDelay = `${delay}s`;
        wrapper.style.setProperty("--drift", `${drift}px`);

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 512 512");
        svg.setAttribute("width", `${size}`);
        svg.setAttribute("height", `${size}`);
        svg.style.display = "block";
        svg.style.filter = `drop-shadow(0 0 10px ${color}) drop-shadow(0 2px 6px rgba(0,0,0,0.6))`;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("fill", color);

        svg.appendChild(path);
        wrapper.appendChild(svg);
        container.appendChild(wrapper);
    }

    setTimeout(() => {
        container.remove();
    }, 3200);
}

// Backward compatibility alias
export const triggerLovePokeEffect = triggerInteractionEffect;

