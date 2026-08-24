import { React, UserStore, showToast, Toasts } from "@webpack/common";
import { showNotification } from "@api/Notifications";
import * as DataStore from "@api/DataStore";
import { fetchMyRelationships } from "../api/supabase";
import { Relationship, ResolvedRelationship, RELATIONSHIP_TYPES } from "../types";
import { triggerLovePokeEffect } from "../utils/lovePokeEffects";

function openRequestsModal() {
    import("../components/RelationshipRequests").then(m => m.openRelationshipRequests()).catch(() => {});
}

const MUTED_USERS_KEY = "HeartLink_muted_users";

export async function getMutedUsers(): Promise<string[]> {
    try {
        return (await DataStore.get<string[]>(MUTED_USERS_KEY)) ?? [];
    } catch {
        return [];
    }
}

export async function toggleMuteUser(userId: string): Promise<boolean> {
    try {
        const muted = await getMutedUsers();
        let next: string[];
        let isNowMuted: boolean;
        if (muted.includes(userId)) {
            next = muted.filter(id => id !== userId);
            isNowMuted = false;
        } else {
            next = [...muted, userId];
            isNowMuted = true;
        }
        await DataStore.set(MUTED_USERS_KEY, next);
        return isNowMuted;
    } catch {
        return false;
    }
}

interface StoreState {
    authenticated: boolean;
    loading: boolean;
    myDiscordId: string | null;
    relationships: Relationship[];
    error: string | null;
}

let state: StoreState = {
    authenticated: false,
    loading: true,
    myDiscordId: null,
    relationships: [],
    error: null,
};

const listeners = new Set<() => void>();
let pollTimer: any = null;
const notifiedRequestIds = new Set<string>();

function notify() {
    listeners.forEach(l => {
        try { l(); } catch {}
    });
}

function setState(patch: Partial<StoreState>) {
    state = { ...state, ...patch };
    notify();
}

export function getState(): Readonly<StoreState> {
    return state;
}

export function subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

export function useRelationshipStore(): Readonly<StoreState> {
    const [, forceRender] = React.useReducer(x => x + 1, 0);
    React.useEffect(() => subscribe(forceRender), []);
    return state;
}

export async function init(): Promise<void> {
    setState({ loading: true, error: null });

    try {
        const me = UserStore.getCurrentUser();
        const discordId = me?.id;

        if (!discordId) {
            setState({ authenticated: false, loading: false });
            return;
        }

        const relationships = await fetchMyRelationships(discordId);
        setState({
            authenticated: true,
            myDiscordId: discordId,
            relationships,
            loading: false,
        });

        const lastHandledPokeTimestamps = new Map<string, number>();

        relationships.forEach(r => {
            if (r.user_b === discordId && r.status === "pending") {
                if (!notifiedRequestIds.has(r.id)) {
                    notifiedRequestIds.add(r.id);
                    handleIncomingRequestNotification(r, discordId);
                }
            }
            if (r.status === "accepted" && r.custom_icon?.startsWith("poke:")) {
                const [, , pokeTimeStr] = r.custom_icon.split(":");
                lastHandledPokeTimestamps.set(r.id, parseInt(pokeTimeStr, 10) || 0);
            }
        });

        if (pollTimer) clearInterval(pollTimer);
        pollTimer = setInterval(async () => {
            const activeId = state.myDiscordId || UserStore.getCurrentUser()?.id;
            if (!activeId) return;
            try {
                const fresh = await fetchMyRelationships(activeId);
                fresh.forEach(r => {
                    // 1. Pending incoming request check
                    if (r.user_b === activeId && r.status === "pending") {
                        if (!notifiedRequestIds.has(r.id)) {
                            notifiedRequestIds.add(r.id);
                            handleIncomingRequestNotification(r, activeId);
                        }
                    }

                    // 2. Incoming Love Poke check on accepted relationship!
                    if (r.status === "accepted" && r.custom_icon?.startsWith("poke:")) {
                        const [, pokeSenderId, pokeTimeStr] = r.custom_icon.split(":");
                        const pokeTime = parseInt(pokeTimeStr, 10) || 0;
                        const lastPoke = lastHandledPokeTimestamps.get(r.id) || 0;

                        // Only the specific partner in this relationship should receive the poke!
                        const targetReceiverId = r.user_a === pokeSenderId ? r.user_b : (r.user_b === pokeSenderId ? r.user_a : null);

                        if (targetReceiverId && targetReceiverId === activeId && pokeTime > lastPoke && (Date.now() - pokeTime < 120000)) {
                            lastHandledPokeTimestamps.set(r.id, pokeTime);
                            handleIncomingLovePokeNotification(pokeSenderId);
                        }
                    }
                });
                setState({ relationships: fresh, myDiscordId: activeId, authenticated: true });
            } catch {}
        }, 3500);

    } catch (e: any) {
        setState({ loading: false, error: e.message ?? "Failed to initialize HeartLink" });
    }
}

async function handleIncomingLovePokeNotification(senderId: string) {
    try {
        const sender = UserStore.getUser(senderId);
        const name = sender?.username || "Your partner";

        triggerLovePokeEffect(name, "You", "Sent you a Love Poke! 💖");

        showNotification({
            title: "HeartLink Love Poke! 💖",
            body: `@${name} sent you a Love Poke!`,
            onClick: () => openRequestsModal(),
        });
    } catch (err) {
        console.error("[HeartLink] Poke notification error:", err);
    }
}

async function handleIncomingRequestNotification(row: Relationship, myId: string) {
    try {
        const muted = await getMutedUsers();
        if (muted.includes(row.user_a)) return;

        const sender = UserStore.getUser(row.user_a);
        const name = sender?.username || "A friend";
        const res = resolveRelationship(row, myId);

        showToast(
            `💖 @${name} sent you a request to be their ${res.theirLabel}!`,
            Toasts.Type.SUCCESS
        );

        showNotification({
            title: "HeartLink Relationship Request",
            body: `@${name} sent a request to set you as their ${res.theirLabel}!`,
            onClick: () => openRequestsModal(),
        });
    } catch (err) {
        console.error("[HeartLink] Notification trigger error:", err);
    }
}

export function cleanup(): void {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
    state = { authenticated: false, loading: false, myDiscordId: null, relationships: [], error: null };
    notify();
}

export function resolveRelationship(rel: Relationship, myDiscordId: string): ResolvedRelationship {
    const iAmRequester = rel.user_a === myDiscordId;
    const otherUserId = iAmRequester ? rel.user_b : rel.user_a;

    const findDef = (id: string) => RELATIONSHIP_TYPES.find(t => t.id === id);

    let theirLabel: string;
    let myLabel: string;
    let icon: string;
    let color: string;
    let note: string;
    let subtext: string;

    let rawColor: string;

    if (iAmRequester) {
        const def = findDef(rel.type);
        const reciprocalDef = findDef(rel.reciprocal_type);

        theirLabel = rel.type === "custom" ? (rel.custom_label || "Custom") : (def?.label || rel.type);
        myLabel = rel.reciprocal_type === "custom" ? (rel.custom_reciprocal || "Custom") : (reciprocalDef?.label || rel.reciprocal_type);

        icon = rel.icon_b || rel.custom_icon?.split(":")[0] || def?.id || "gem";
        rawColor = rel.color_b || rel.custom_icon?.split(":")[1] || def?.iconColor || "#f59e0b";
        note = rel.note_b || "";

        subtext = `You are their ${myLabel}`;
    } else {
        const def = findDef(rel.reciprocal_type);
        const reciprocalDef = findDef(rel.type);

        theirLabel = rel.reciprocal_type === "custom" ? (rel.custom_reciprocal || "Custom") : (def?.label || rel.reciprocal_type);
        myLabel = rel.type === "custom" ? (rel.custom_label || "Custom") : (reciprocalDef?.label || rel.type);

        icon = rel.icon_a || rel.custom_icon?.split(":")[0] || def?.id || "crown";
        rawColor = rel.color_a || rel.custom_icon?.split(":")[1] || def?.iconColor || "#eab308";
        note = rel.note_a || "";

        subtext = `You are their ${myLabel}`;
    }

    const [badgeColor, customIconColor, thisSinceDate, rawFx, customTheme, customAnimation] = (rawColor || "").split(":");
    color = badgeColor || "#f43f5e";
    const iconColor = customIconColor || "#ffffff";

    const fxParts = (rawFx || "1,1,1,0,0.6").split(",");
    const opacity = parseFloat(fxParts[0]) || 1;
    const saturation = parseFloat(fxParts[1]) || 1;
    const brightness = parseFloat(fxParts[2]) || 1;
    const glowSpread = parseFloat(fxParts[3]) || 0;
    const glowIntensity = parseFloat(fxParts[4]) || 0.6;
    const glowColor = fxParts[5] || badgeColor || "#f43f5e";

    const theme = customTheme || "isometric";
    const animation = customAnimation || "none";

    const [, , sinceDateA] = (rel.color_a || "").split(":");
    const [, , sinceDateB] = (rel.color_b || "").split(":");
    const effectiveDate = thisSinceDate || sinceDateA || sinceDateB || rel.created_at;

    let daysTogether = 1;
    if (effectiveDate) {
        const start = new Date(effectiveDate).getTime();
        const diffDays = Math.max(1, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)));
        daysTogether = diffDays;
    }

    const hoverText = `@${theirLabel}`;

    return {
        raw: rel,
        otherUserId,
        theirLabel,
        myLabel,
        icon,
        color,
        iconColor,
        note,
        hoverText,
        subtext,
        iAmRequester,
        status: rel.status,
        daysTogether,
        theme,
        animation,
        glowSpread,
        glowIntensity,
        glowColor,
        opacity,
        saturation,
        brightness,
    };
}

export function getRelationshipWith(otherUserId: string): ResolvedRelationship | null {
    const { myDiscordId, relationships } = state;
    if (!myDiscordId) return null;
    const rel = relationships.find(
        r => (r.user_a === otherUserId || r.user_b === otherUserId) && (r.user_a === myDiscordId || r.user_b === myDiscordId)
    );
    if (!rel) return null;
    return resolveRelationship(rel, myDiscordId);
}

export function getAllRelationshipsWith(otherUserId: string): ResolvedRelationship[] {
    const { myDiscordId, relationships } = state;
    if (!myDiscordId) return [];
    return relationships
        .filter(r => (r.user_a === otherUserId || r.user_b === otherUserId) && (r.user_a === myDiscordId || r.user_b === myDiscordId))
        .map(r => resolveRelationship(r, myDiscordId));
}

export function getIncomingRequests(): ResolvedRelationship[] {
    const { myDiscordId, relationships } = state;
    if (!myDiscordId) return [];
    return relationships
        .filter(r => r.user_b === myDiscordId && r.status === "pending")
        .map(r => resolveRelationship(r, myDiscordId));
}

export function getOutgoingRequests(): ResolvedRelationship[] {
    const { myDiscordId, relationships } = state;
    if (!myDiscordId) return [];
    return relationships
        .filter(r => r.user_a === myDiscordId && r.status === "pending")
        .map(r => resolveRelationship(r, myDiscordId));
}

export function getActiveRelationships(): ResolvedRelationship[] {
    const { myDiscordId, relationships } = state;
    if (!myDiscordId) return [];
    return relationships
        .filter(r => (r.user_a === myDiscordId || r.user_b === myDiscordId) && r.status === "accepted")
        .map(r => resolveRelationship(r, myDiscordId));
}

export function getAcceptedRelationshipsForUser(userId: string): ResolvedRelationship[] {
    const { relationships } = state;
    return relationships
        .filter(r => (r.user_a === userId || r.user_b === userId) && r.status === "accepted")
        .map(r => resolveRelationship(r, userId));
}
