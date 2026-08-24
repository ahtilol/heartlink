import "./styles.css";

import { NavContextMenuPatchCallback, addContextMenuPatch, removeContextMenuPatch } from "@api/ContextMenu";
import { addProfileBadge, removeProfileBadge, ProfileBadge, BadgePosition } from "@api/Badges";
import { addMemberListDecorator, removeMemberListDecorator } from "@api/MemberListDecorators";
import { addMessageDecoration, removeMessageDecoration } from "@api/MessageDecorations";
import { definePluginSettings } from "@api/Settings";
import { showNotification } from "@api/Notifications";
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { findComponentByCodeLazy } from "@webpack";
import { Menu, UserStore, Popout, React, ReactDOM, createRoot, Tooltip } from "@webpack/common";
import type { PropsWithChildren } from "react";

import { RelationshipProfileSection } from "./components/RelationshipProfileSection";
import { openRelationshipModal } from "./components/RelationshipModal";
import { openRelationshipRequests } from "./components/RelationshipRequests";
import { openRelationshipDetailModal } from "./components/RelationshipDetailModal";
import { HeartLinkNameBadge } from "./components/HeartLinkNameBadge";
import { HeartLinkMenu } from "./components/HeartLinkMenu";
import { init, cleanup, getIncomingRequests, getActiveRelationships, getOutgoingRequests, getAllRelationshipsWith, getAcceptedRelationshipsForUser, useRelationshipStore, subscribe } from "./stores/RelationshipStore";
import { HeartIcon, RelationshipIcon } from "./icons";
import { triggerLovePokeEffect } from "./utils/lovePokeEffects";
import { sendLovePoke } from "./api/supabase";
import { initAutoCallStatus } from "./utils/autoCallStatus";
import type { DiscordUser } from "./types";

const settings = definePluginSettings({
    showInMemberList: {
        type: OptionType.BOOLEAN,
        description: "Show relationship badge in member list and DM list",
        default: true,
    },
    showInFriendsList: {
        type: OptionType.BOOLEAN,
        description: "Show relationship badge in friends list",
        default: true,
    },
    showInChat: {
        type: OptionType.BOOLEAN,
        description: "Show relationship badge in chat headers",
        default: true,
    },
    showProfileSection: {
        type: OptionType.BOOLEAN,
        description: "Show relationship info in user profiles",
        default: true,
    },
    showProfileBadges: {
        type: OptionType.BOOLEAN,
        description: "Show badges in Discord profile badge list",
        default: true,
    },
    enableNotifications: {
        type: OptionType.BOOLEAN,
        description: "Show desktop notifications for requests",
        default: true,
    },
    showInContextMenu: {
        type: OptionType.BOOLEAN,
        description: "Show 'Set Relationship' in user context menu",
        default: true,
    },
    autoCallStatus: {
        type: OptionType.BOOLEAN,
        description: "Automatically change status to 'In a call with the love of my life 💕' when in a voice call with your partner",
        default: true,
    },
    customCallStatusText: {
        type: OptionType.STRING,
        description: "Custom call status text ({partner} = name, {role} = role)",
        default: "In a call with the love of my life 💕",
    },
});

let cleanupAutoCallStatus: (() => void) | null = null;

import { HeartLinkTooltipContent } from "./components/HeartLinkTooltipContent";

const HeartLinkProfileBadge: ProfileBadge = {
    id: "heartlink-profile-badge",
    key: "heartlink-profile-badge",
    position: BadgePosition.START,
    getBadges({ userId }) {
        if (!settings.store.showProfileBadges) return [];
        // Show badges for everyone on any user profile
        const rels = getAcceptedRelationshipsForUser(userId);
        return rels.map(rel => {
            const isUserA = rel.raw.user_a === userId;
            const partnerId = isUserA ? rel.raw.user_b : rel.raw.user_a;
            const otherUser = UserStore?.getUser?.(partnerId);
            const otherUsername = otherUser?.username || partnerId;

            let badgeRole: string;
            let badgeIcon: string;
            let rawBadgeColor: string;
            let badgeNote: string;

            if (isUserA) {
                badgeRole  = rel.raw.reciprocal_type === "custom" ? (rel.raw.custom_reciprocal || "Custom") : rel.raw.reciprocal_type;
                badgeIcon  = rel.raw.icon_a  || rel.raw.custom_icon?.split(":")[0]  || "crown";
                rawBadgeColor = rel.raw.color_a || (rel.raw.custom_icon?.includes(":") ? rel.raw.custom_icon.substring(rel.raw.custom_icon.indexOf(":") + 1) : "") || "#eab308";
                badgeNote  = rel.raw.note_a  || "";
            } else {
                badgeRole  = rel.raw.type === "custom" ? (rel.raw.custom_label || "Custom") : rel.raw.type;
                badgeIcon  = rel.raw.icon_b  || rel.raw.custom_icon?.split(":")[0]  || "gem";
                rawBadgeColor = rel.raw.color_b || (rel.raw.custom_icon?.includes(":") ? rel.raw.custom_icon.substring(rel.raw.custom_icon.indexOf(":") + 1) : "") || "#f59e0b";
                badgeNote  = rel.raw.note_b  || "";
            }

            const [badgeColor, customIconColor, , rawFx, customTheme, customAnimation] = (rawBadgeColor || "").split(":");
            const iconColor = customIconColor || "#ffffff";
            const fxParts = (rawFx || "1,1,1").split(",");
            const op = parseFloat(fxParts[0]) || 1;
            const sat = parseFloat(fxParts[1]) || 1;
            const bright = parseFloat(fxParts[2]) || 1;
            const glowSpread = parseFloat(fxParts[3]) || 0;
            const glowIntensity = parseFloat(fxParts[4]) || 0.6;
            const glowColor = fxParts[5] || badgeColor || "#ff4081";

            const formattedRole = badgeRole ? (badgeRole.charAt(0).toUpperCase() + badgeRole.slice(1)) : "Partner";
            const badgeDesc = `@${otherUsername}'s ${formattedRole}`;

            return {
                id: `hl-badge-${rel.raw.id}`,
                key: `hl-badge-${rel.raw.id}`,
                description: badgeDesc,
                component: () => (
                    <Tooltip text={badgeDesc} position="top" hideOnClick={false}>
                        {tooltipProps => (
                            <div
                                {...tooltipProps}
                                className={`hl-discord-profile-badge ${customTheme && customTheme !== "isometric" ? `hl-theme-${customTheme}` : ""} ${customAnimation && customAnimation !== "none" ? `hl-anim-${customAnimation}` : ""}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openRelationshipDetailModal(rel.raw, userId, UserStore?.getCurrentUser?.()?.id || null);
                                }}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 22,
                                    height: 22,
                                    borderRadius: 6,
                                    backgroundColor: badgeColor || "#ff4081",
                                    "--badge-color": badgeColor || "#ff4081",
                                    "--badge-glow-spread": `${glowSpread}px`,
                                    "--badge-glow-intensity": glowIntensity,
                                    "--badge-glow-color": glowColor,
                                    cursor: "pointer",
                                    margin: "0 2px",
                                    opacity: op,
                                    filter: `saturate(${sat}) brightness(${bright})`,
                                } as any}
                            >
                                <RelationshipIcon type={badgeIcon} size={13} customColor={iconColor} />
                            </div>
                        )}
                    </Tooltip>
                )
            };
        });
    }
};

const userContextMenuPatch: NavContextMenuPatchCallback = (children, { user }) => {
    if (!settings.store.showInContextMenu || !user) return;
    const me = UserStore?.getCurrentUser?.();
    if (!me || user.id === me.id) return;

    const relsWithUser = getAllRelationshipsWith(user.id).filter(r => r.status === "accepted");
    const activeRel = relsWithUser[0];

    children.push(
        <Menu.MenuSeparator key="hl-sep" />,
        activeRel ? (
            <Menu.MenuItem
                key="hl-send-love-poke"
                id="hl-send-love-poke"
                label={<span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <HeartIcon size={14} color="#f43f5e" />
                    Send Love Poke ✨
                </span>}
                action={async () => {
                    try {
                        await sendLovePoke(activeRel.raw.id, me.id);
                        triggerLovePokeEffect(me.username || "You", user.username || "Partner", "Sent with love! 💕");
                    } catch (e: any) {
                        console.error(e);
                    }
                }}
            />
        ) : null,
        <Menu.MenuItem
            key="hl-set-relationship"
            id="hl-set-relationship"
            label={<span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <HeartIcon size={14} color="var(--brand-experiment, #5865f2)" />
                Set Relationship
            </span>}
            action={() => {
                const curUser = UserStore?.getCurrentUser?.();
                if (!curUser) return;

                const discordUser: DiscordUser = {
                    id: user.id,
                    username: user.username,
                    globalName: user.globalName ?? user.global_name ?? null,
                    discriminator: user.discriminator ?? "0",
                    avatar: user.avatar ?? null,
                    bot: user.bot ?? false,
                };
                openRelationshipModal(curUser.id, discordUser);
            }}
        />,
        <Menu.MenuItem
            key="hl-open-hub"
            id="hl-open-hub"
            label={<span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <RelationshipIcon type="heart" size={14} customColor="#a855f7" />
                HeartLink Hub
            </span>}
            action={() => openRelationshipRequests()}
        />
    );
};

let prevIncomingCount = 0;

function checkForNewRequests() {
    if (!settings.store.enableNotifications) return;
    const incoming = getIncomingRequests();
    if (incoming.length > prevIncomingCount) {
        const newReqs = incoming.slice(0, incoming.length - prevIncomingCount);
        newReqs.forEach(req => {
            const user = UserStore?.getUser?.(req.otherUserId);
            const name = user?.username || req.otherUserId;
            showNotification({
                title: "HeartLink",
                body: `@${name} sent a request to set you as their ${req.theirLabel}.`,
                onClick: openRelationshipRequests,
            });
        });
    }
    prevIncomingCount = incoming.length;
}

const HeaderBarIcon = findComponentByCodeLazy(".HEADER_BAR_BADGE_BOTTOM,", 'position:"bottom"');

function HeartLinkHeaderButton() {
    const store = useRelationshipStore();
    const incoming = getIncomingRequests();
    const active = getActiveRelationships();
    const outgoing = getOutgoingRequests();
    const totalPending = incoming.length;

    const tooltipText = totalPending > 0
        ? `HeartLink: ${totalPending} pending request${totalPending > 1 ? "s" : ""}!`
        : active.length > 0
            ? `HeartLink: ${active.length} active relationship${active.length > 1 ? "s" : ""}`
            : "HeartLink Relationships & Requests";

    return (
        <HeaderBarIcon
            className="hl-header-btn"
            onClick={() => openRelationshipRequests()}
            tooltip={tooltipText}
            icon={() => (
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 }}>
                    <HeartIcon
                        size={18}
                        color="#ffffff"
                    />
                    {totalPending > 0 && (
                        <span className="hl-header-badge" style={{
                            position: "absolute",
                            top: -4,
                            right: -6,
                            minWidth: 14,
                            height: 14,
                            borderRadius: 7,
                            backgroundColor: "var(--status-danger, #ed4245)",
                            color: "#ffffff",
                            fontSize: 9,
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 3px",
                            border: "1px solid #ffffff",
                        }}>
                            {totalPending}
                        </span>
                    )}
                </div>
            )}
        />
    );
}



export default definePlugin({
    name: "HeartLink",
    description: "Mutual relationships, custom badges, and status roles for Discord. Developed by <@930813224088141855> for his wife Kiki <@1212171442691776584> • https://ahti.lol/",
    authors: [Devs.Ahti],
    searchTerms: ["heart", "relationship", "badge", "partner", "love", "marry", "customizer"],
    tags: ["Utility", "Chat", "Appearance", "Customisation"],
    dependencies: ["MemberListDecoratorsAPI", "MessageDecorationsAPI", "BadgeAPI"],
    settings,

    patches: [
        {
            find: "customStatus",
            replacement: {
                match: /(\i\.customStatus[^}]+}(?:,\i\.bio[^}]+})?)/,
                replace: "$1,$self.renderProfileSection(arguments[0])",
                noWarn: true,
            },
        },
        {
            find: '?"BACK_FORWARD_NAVIGATION":',
            replacement: {
                match: /(trailing:.{0,50}?)\i\.Fragment,(?=\{children:\[)/,
                replace: "$1$self.TrailingWrapper,"
            }
        },
        // Friends List Row Patch
        {
            find: "null!=this.peopleListItemRef.current",
            replacement: [
                {
                    match: /(className:\i\.(?:text|nameAndDecorators|discordTag).{0,60}?children:\[)/,
                    replace: "$1$self.renderFriendBadge(this?.props?.user ?? this?.props),",
                    noWarn: true,
                },
                {
                    match: /(null!=this\.peopleListItemRef\.current[\s\S]+?className:\i\.\i,children:\[\(0,\i\.jsxs?\)\([^,]+,\{[^}]+?children:\[[\s\S]+?)(?=\]\}\),)/,
                    replace: "$1,$self.renderFriendBadge(this?.props?.user?.id ?? this?.props?.user)",
                    noWarn: true,
                },
                {
                    match: /(className:\i\.\i,children:\[\(0,\i\.jsx\)\([^,]+,\{[^}]+?children:\i\.(?:username|globalName|tag))/g,
                    replace: "$&$self.renderFriendBadge(this?.props?.user?.id ?? this?.props?.user),",
                    noWarn: true,
                },
            ],
        },
    ],

    TrailingWrapper({ children }: PropsWithChildren) {
        return (
            <>
                {children}
                <ErrorBoundary key="hl-header-btn" noop>
                    <HeartLinkHeaderButton />
                </ErrorBoundary>
            </>
        );
    },

    renderProfileSection(props: { userId?: string; user?: { id: string; }; }) {
        if (!settings.store.showProfileSection) return null;
        const userId = props.userId ?? props.user?.id;
        if (!userId) return null;
        return (
            <ErrorBoundary noop>
                <RelationshipProfileSection userId={userId} />
            </ErrorBoundary>
        );
    },

    renderInlineBadge(props: any) {
        if (!props) return null;
        const user = props.user ?? props.userOverride ?? props.author;
        const userId = user?.id ?? user?.authorId ?? props.userId;
        if (!userId) return null;
        return (
            <ErrorBoundary noop>
                <HeartLinkNameBadge userId={userId} showLabel={false} interactive={false} compact={true} />
            </ErrorBoundary>
        );
    },

    renderFriendBadge(userOrId?: any) {
        if (!userOrId) return null;
        const userId = typeof userOrId === "string" ? userOrId : (userOrId?.id ?? userOrId?.user?.id ?? userOrId?.userId);
        if (!userId) return null;
        return (
            <ErrorBoundary noop>
                <HeartLinkNameBadge userId={userId} showLabel={false} interactive={false} compact={true} />
            </ErrorBoundary>
        );
    },

    async start() {
        addContextMenuPatch("user-context", userContextMenuPatch);
        addProfileBadge(HeartLinkProfileBadge);

        addMemberListDecorator("heartlink-name-badge", ({ user }) => {
            if (!settings.store.showInMemberList || !user?.id) return null;
            return <HeartLinkNameBadge userId={user.id} showLabel={false} interactive={false} compact={true} />;
        });

        addMessageDecoration("heartlink-name-badge", ({ message }) => {
            if (!settings.store.showInChat) return null;
            const authorId = message?.author?.id;
            if (!authorId) return null;
            return <HeartLinkNameBadge userId={authorId} showLabel={true} interactive={true} compact={false} />;
        });

        await init();
        subscribe(checkForNewRequests);
        cleanupAutoCallStatus = initAutoCallStatus(settings);
    },

    stop() {
        removeContextMenuPatch("user-context", userContextMenuPatch);
        removeProfileBadge(HeartLinkProfileBadge);
        removeMemberListDecorator("heartlink-name-badge");
        removeMessageDecoration("heartlink-name-badge");
        cleanupAutoCallStatus?.();
        cleanupAutoCallStatus = null;
        cleanup();
    },
});

