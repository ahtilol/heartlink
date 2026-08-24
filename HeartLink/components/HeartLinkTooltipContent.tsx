import { React, UserStore } from "@webpack/common";
import { RelationshipIcon, ClockIcon, MusicIcon } from "../icons";
import { calculateRelationshipLevel } from "../utils/levelSystem";

interface HeartLinkTooltipContentProps {
    rawRel: any;
    partnerId: string;
    formattedRole: string;
    badgeIcon: string;
    badgeColor: string;
    iconColor: string;
    badgeNote: string;
}

export function HeartLinkTooltipContent({
    rawRel,
    partnerId,
    formattedRole,
    badgeIcon,
    badgeColor,
    iconColor,
    badgeNote,
}: HeartLinkTooltipContentProps) {
    const partnerUser = UserStore?.getUser?.(partnerId);
    const partnerUsername = partnerUser?.username || partnerId;
    const [cleanNote, anthemText] = (badgeNote || "").split("||").map(s => s?.trim());

    // Milestone calculation
    const [, , sinceDateA] = (rawRel.color_a || "").split(":");
    const [, , sinceDateB] = (rawRel.color_b || "").split(":");
    const effectiveDate = sinceDateA || sinceDateB || rawRel.created_at;
    let daysTogether = 1;
    if (effectiveDate) {
        const start = new Date(effectiveDate).getTime();
        daysTogether = Math.max(1, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)));
    }
    const levelInfo = calculateRelationshipLevel(daysTogether);

    const avatarUrl = partnerUser?.avatar
        ? `https://cdn.discordapp.com/avatars/${partnerId}/${partnerUser.avatar}.webp?size=80`
        : `https://cdn.discordapp.com/embed/avatars/${parseInt(partnerId || "0") % 6}.png`;

    return (
        <div className="hl-tooltip-bubble" style={{ "--badge-color": badgeColor || "#ff4081" } as any}>
            {/* Header with Avatar and Title */}
            <div className="hl-tooltip-header">
                <img src={avatarUrl} alt={partnerUsername} className="hl-tooltip-avatar" />
                <div className="hl-tooltip-info">
                    <div className="hl-tooltip-title">
                        @{partnerUsername}'s {formattedRole}
                    </div>
                    <div className="hl-tooltip-badges-row">
                        <div
                            className="hl-tooltip-level-pill"
                            style={{
                                backgroundColor: `${levelInfo.color}22`,
                                color: levelInfo.color,
                                borderColor: `${levelInfo.color}55`,
                            }}
                        >
                            <RelationshipIcon type={levelInfo.iconType} size={11} customColor={levelInfo.color} />
                            <span>Lv.{levelInfo.level} · {levelInfo.title}</span>
                        </div>
                        <div className="hl-tooltip-streak-pill">
                            <ClockIcon size={11} color="#f59e0b" />
                            <span>{daysTogether}d</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Couple Note Quote Block */}
            {cleanNote && (
                <div className="hl-tooltip-note">
                    “{cleanNote}”
                </div>
            )}

            {/* Couple Anthem Row */}
            {anthemText && (
                <div className="hl-tooltip-anthem">
                    <MusicIcon size={11} color="#fbbf24" />
                    <span>{anthemText}</span>
                </div>
            )}
        </div>
    );
}
