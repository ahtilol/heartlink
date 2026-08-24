import { React, UserStore, Tooltip } from "@webpack/common";
import ErrorBoundary from "@components/ErrorBoundary";
import { useRelationshipStore } from "../stores/RelationshipStore";
import { openRelationshipDetailModal } from "./RelationshipDetailModal";
import { RelationshipIcon } from "../icons";
import { HeartLinkTooltipContent } from "./HeartLinkTooltipContent";

interface HeartLinkNameBadgeProps {
    userId: string;
    showLabel?: boolean;
    interactive?: boolean;
    compact?: boolean;
}

export function HeartLinkNameBadge({
    userId,
    showLabel = true,
    interactive = true,
    compact = !showLabel,
}: HeartLinkNameBadgeProps) {
    const store = useRelationshipStore();
    const { myDiscordId, relationships } = store;

    // Find all accepted relationships involving this user
    const userRels = relationships.filter(
        r => (r.user_a === userId || r.user_b === userId) && r.status === "accepted"
    );

    if (!userRels || userRels.length === 0) return null;

    return (
        <ErrorBoundary noop>
            <span className="hl-badge-container" style={!interactive ? { pointerEvents: "none" } : undefined}>
                {userRels.map(rawRel => {
                    const isUserA = rawRel.user_a === userId;
                    const partnerId = isUserA ? rawRel.user_b : rawRel.user_a;
                    const partnerUser = UserStore?.getUser?.(partnerId);
                    const partnerUsername = partnerUser?.username || partnerId;

                    let badgeRole: string;
                    let badgeIcon: string;
                    let rawBadgeColor: string;
                    let badgeNote: string;

                    if (isUserA) {
                        badgeRole  = rawRel.reciprocal_type === "custom" ? (rawRel.custom_reciprocal || "Custom") : rawRel.reciprocal_type;
                        badgeIcon  = rawRel.icon_a  || rawRel.custom_icon?.split(":")[0]  || "crown";
                        rawBadgeColor = rawRel.color_a || (rawRel.custom_icon?.includes(":") ? rawRel.custom_icon.substring(rawRel.custom_icon.indexOf(":") + 1) : "") || "#eab308";
                        badgeNote  = rawRel.note_a  || "";
                    } else {
                        badgeRole  = rawRel.type === "custom" ? (rawRel.custom_label || "Custom") : rawRel.type;
                        badgeIcon  = rawRel.icon_b  || rawRel.custom_icon?.split(":")[0]  || "gem";
                        rawBadgeColor = rawRel.color_b || (rawRel.custom_icon?.includes(":") ? rawRel.custom_icon.substring(rawRel.custom_icon.indexOf(":") + 1) : "") || "#f59e0b";
                        badgeNote  = rawRel.note_b  || "";
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
                    const displayText = `@${partnerUsername}'s ${formattedRole}`;

                    return (
                        <Tooltip key={rawRel.id} text={displayText} position="top" hideOnClick={false}>
                            {tooltipProps => (
                                <span
                                    {...tooltipProps}
                                    className={`hl-badge-embossed ${compact ? "hl-badge-compact" : ""} ${customTheme && customTheme !== "isometric" && customTheme !== "none" ? `hl-theme-${customTheme}` : ""} ${customAnimation && customAnimation !== "none" ? `hl-anim-${customAnimation}` : ""}`}
                                    style={{
                                        "--badge-color": badgeColor || "#ff4081",
                                        "--badge-glow-spread": `${glowSpread}px`,
                                        "--badge-glow-intensity": glowIntensity,
                                        "--badge-glow-color": glowColor,
                                        cursor: interactive ? "pointer" : "default",
                                        pointerEvents: interactive ? "auto" : "none",
                                        opacity: op,
                                        filter: `saturate(${sat}) brightness(${bright})`,
                                    } as any}
                                    onClick={interactive ? (e) => {
                                        e.stopPropagation();
                                        openRelationshipDetailModal(rawRel, userId, myDiscordId);
                                    } : undefined}
                                >
                                    <RelationshipIcon type={badgeIcon} size={compact ? 12 : 13} customColor={iconColor} />
                                    {!compact && showLabel && (
                                        <span className="hl-badge-text">
                                            {displayText}
                                        </span>
                                    )}
                                </span>
                            )}
                        </Tooltip>
                    );
                })}
            </span>
        </ErrorBoundary>
    );
}
