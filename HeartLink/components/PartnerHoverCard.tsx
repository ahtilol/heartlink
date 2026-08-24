import { React, UserStore, PresenceStore, ChannelStore } from "@webpack/common";
import { ResolvedRelationship } from "../types";
import { RelationshipIcon, HeartIcon, SparklesIcon, MusicIcon, GamepadIcon, ClockIcon, EnvelopeIcon } from "../icons";
import { calculateRelationshipLevel } from "../utils/levelSystem";
import { getInteractionForRole, triggerInteractionEffect } from "../utils/lovePokeEffects";
import { sendLovePoke } from "../api/supabase";

interface PartnerHoverCardProps {
    partnerId: string;
    rawRel: any;
    formattedRole: string;
    badgeIcon: string;
    badgeColor: string;
    iconColor: string;
    badgeNote: string;
    myDiscordId: string | null;
    onClose?: () => void;
}

export function PartnerHoverCard({
    partnerId,
    rawRel,
    formattedRole,
    badgeIcon,
    badgeColor,
    iconColor,
    badgeNote,
    myDiscordId,
    onClose,
}: PartnerHoverCardProps) {
    const [poking, setPoking] = React.useState(false);
    const partnerUser = UserStore?.getUser?.(partnerId);
    const partnerUsername = partnerUser?.username || partnerId;
    const partnerGlobalName = partnerUser?.globalName || partnerUser?.username || "Friend";

    // Role-specific interaction (e.g. Love Poke, High Five, Game Ping)
    const [, , , , , , customInteraction] = (rawRel?.color_a || rawRel?.color_b || "").split(":");
    const interactionMeta = getInteractionForRole(formattedRole, customInteraction);

    // 1. Live Discord Presence Status & Activities
    const status = PresenceStore?.getStatus?.(partnerId) || "offline";
    const activities = PresenceStore?.getActivities?.(partnerId) || [];

    // Find rich activities (Spotify, Game, Custom Status)
    const customStatus = activities.find((a: any) => a.type === 4);
    const spotifyActivity = activities.find((a: any) => a.name?.toLowerCase() === "spotify" || a.type === 2);
    const gameActivity = activities.find((a: any) => a.type === 0);

    // 2. Milestone calculation
    const [, , sinceDateA] = (rawRel.color_a || "").split(":");
    const [, , sinceDateB] = (rawRel.color_b || "").split(":");
    const effectiveDate = sinceDateA || sinceDateB || rawRel.created_at;

    let daysTogether = 1;
    if (effectiveDate) {
        const start = new Date(effectiveDate).getTime();
        daysTogether = Math.max(1, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)));
    }

    const levelInfo = calculateRelationshipLevel(daysTogether);

    // Extract Song Anthem if embedded in note (Format: Note || Song)
    const [mainNote, anthemText] = (badgeNote || "").split("||").map(s => s?.trim());

    async function handlePoke(e: React.MouseEvent) {
        e.stopPropagation();
        if (poking || !myDiscordId) return;
        setPoking(true);
        try {
            const myUser = UserStore?.getCurrentUser?.();
            const myName = myUser?.username || "Someone";
            await sendLovePoke(rawRel.id, myDiscordId);
            triggerInteractionEffect(myName, partnerUsername, interactionMeta.id);
        } catch (err) {
            console.error("[HeartLink] Poke error:", err);
        } finally {
            setPoking(false);
        }
    }

    const statusDotColor =
        status === "online" ? "#23a55a" :
        status === "idle" ? "#f0b232" :
        status === "dnd" ? "#f23f43" : "#80848e";

    const avatarUrl = partnerUser?.avatar
        ? `https://cdn.discordapp.com/avatars/${partnerId}/${partnerUser.avatar}.webp?size=80`
        : `https://cdn.discordapp.com/embed/avatars/${parseInt(partnerId || "0") % 6}.png`;

    return (
        <div
            className="hl-hover-card-bubble"
            style={{ "--badge-color": badgeColor || "#ff4081" } as any}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Top Glow & Header */}
            <div className="hl-hover-header">
                <div style={{ position: "relative", display: "inline-block" }}>
                    <img
                        src={avatarUrl}
                        alt={partnerUsername}
                        className="hl-hover-avatar"
                    />
                    <span
                        className="hl-hover-status-dot"
                        style={{ backgroundColor: statusDotColor }}
                        title={`Status: ${status}`}
                    />
                </div>

                <div className="hl-hover-user-info">
                    <div className="hl-hover-display-name">
                        {partnerGlobalName}
                    </div>
                    <div className="hl-hover-username">
                        @{partnerUsername}
                    </div>
                </div>

                {/* Level Pill */}
                <div
                    className="hl-hover-level-pill"
                    style={{ backgroundColor: `${levelInfo.color}22`, color: levelInfo.color, border: `1px solid ${levelInfo.color}55` }}
                    title={`Relationship Milestone Level: ${levelInfo.level} (${levelInfo.title})`}
                >
                    <RelationshipIcon type={levelInfo.iconType} size={11} customColor={levelInfo.color} />
                    <span>Lv.{levelInfo.level}</span>
                </div>
            </div>

            {/* 3D Role Badge */}
            <div style={{ margin: "8px 0 6px" }}>
                <div
                    className="hl-badge-embossed"
                    style={{ "--badge-color": badgeColor || "#ff4081", width: "100%", justifyContent: "center" } as any}
                >
                    <RelationshipIcon type={badgeIcon} size={14} customColor={iconColor} />
                    <span className="hl-badge-text">
                        @{partnerUsername}'s {formattedRole}
                    </span>
                </div>
            </div>

            {/* Milestone & Streak Bar */}
            <div className="hl-hover-milestone-box">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "var(--header-primary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <ClockIcon size={12} color="#f59e0b" />
                        <span>Together for {daysTogether} day{daysTogether > 1 ? "s" : ""}</span>
                    </div>
                    <span style={{ color: levelInfo.color }}>{levelInfo.title}</span>
                </div>
                <div className="hl-hover-progress-track">
                    <div
                        className="hl-hover-progress-fill"
                        style={{ width: `${levelInfo.progressPercent}%`, backgroundColor: levelInfo.color }}
                    />
                </div>
            </div>

            {/* Live Discord Activity (Spotify / Game / Custom Status) */}
            {spotifyActivity ? (
                <div className="hl-hover-activity-item hl-hover-spotify">
                    <MusicIcon size={13} color="#1db954" />
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1db954" }}>Listening to Spotify</div>
                        <div style={{ fontSize: 11, color: "var(--text-normal)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {spotifyActivity.details} · {spotifyActivity.state}
                        </div>
                    </div>
                </div>
            ) : gameActivity ? (
                <div className="hl-hover-activity-item hl-hover-game">
                    <GamepadIcon size={13} color="#5865f2" />
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: "#5865f2" }}>Playing {gameActivity.name}</div>
                        {gameActivity.details && (
                            <div style={{ fontSize: 11, color: "var(--text-normal)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {gameActivity.details}
                            </div>
                        )}
                    </div>
                </div>
            ) : customStatus?.state ? (
                <div className="hl-hover-activity-item">
                    <EnvelopeIcon size={12} color="#949ba4" />
                    <div style={{ fontSize: 11, color: "var(--text-normal)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        "{customStatus.state}"
                    </div>
                </div>
            ) : null}

            {/* Special Anthem / Song */}
            {anthemText && (
                <div className="hl-hover-anthem-box">
                    <MusicIcon size={12} color="#fbbf24" />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        Anthem: <strong>{anthemText}</strong>
                    </span>
                </div>
            )}

            {/* Custom Status / Note */}
            {mainNote && (
                <div className="hl-hover-note-box">
                    "{mainNote}"
                </div>
            )}

            {/* Quick Interactive Actions */}
            <div className="hl-hover-actions">
                <button
                    className="hl-btn hl-btn--sm hl-hover-poke-btn"
                    style={{
                        background: interactionMeta.gradient,
                        boxShadow: `0 2px 10px ${interactionMeta.primaryColor}55`,
                        color: "#ffffff",
                    }}
                    onClick={handlePoke}
                    disabled={poking}
                    title={`Send a ${interactionMeta.label} with live animations`}
                >
                    <RelationshipIcon type={interactionMeta.icon} size={12} customColor="#ffffff" className={poking ? "hl-heart-pulse" : ""} />
                    <span>{poking ? "Sending…" : interactionMeta.buttonText}</span>
                </button>
            </div>
        </div>
    );
}
