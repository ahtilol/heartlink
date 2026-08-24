import { Modal, openModal, React, UserStore, showToast, Toasts } from "@webpack/common";
import ErrorBoundary from "@components/ErrorBoundary";
import { Relationship } from "../types";
import { RelationshipIcon, HeartIcon, PencilIcon, ArrowLeftIcon, SparklesIcon, FireIcon, MusicIcon, HeartLinkLogoIcon } from "../icons";
import { CustomizationEditor, ItemCustomization } from "./CustomizationEditor";
import { updateRelationshipCustomization, sendLovePoke } from "../api/supabase";
import { openRelationshipRequests } from "./RelationshipRequests";
import { calculateRelationshipLevel } from "../utils/levelSystem";
import { getInteractionForRole, triggerInteractionEffect } from "../utils/lovePokeEffects";

interface RelationshipDetailModalProps {
    modalProps: any;
    rawRel: Relationship;
    userId: string; // The user whose badge was clicked
    myDiscordId: string | null;
}

export function RelationshipDetailModal({ modalProps, rawRel, userId, myDiscordId }: RelationshipDetailModalProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [customValues, setCustomValues] = React.useState<ItemCustomization | null>(null);
    const [pokeSent, setPokeSent] = React.useState(false);

    const isUserA = rawRel.user_a === userId;
    const partnerId = isUserA ? rawRel.user_b : rawRel.user_a;

    const thisUser = UserStore?.getUser?.(userId);
    const partnerUser = UserStore?.getUser?.(partnerId);

    const thisUsername = thisUser?.username || userId;
    const partnerUsername = partnerUser?.username || partnerId;

    // Is the current viewer the partner or self?
    const viewerIsPartner = myDiscordId && (partnerId === myDiscordId);
    const viewerIsSelf = myDiscordId && (userId === myDiscordId);
    const isParticipant = Boolean(viewerIsPartner || viewerIsSelf);

    let roleName: string;
    let reciprocalRoleName: string;
    let badgeIcon: string;
    let rawBadgeColor: string;
    let badgeNote: string;

    if (isUserA) {
        // User A (e.g. Husband)
        roleName           = rawRel.reciprocal_type === "custom" ? (rawRel.custom_reciprocal || "Custom") : rawRel.reciprocal_type;
        reciprocalRoleName = rawRel.type === "custom" ? (rawRel.custom_label || "Custom") : rawRel.type;
        badgeIcon          = rawRel.icon_a  || rawRel.custom_icon?.split(":")[0]  || "crown";
        rawBadgeColor      = rawRel.color_a || (rawRel.custom_icon?.includes(":") ? rawRel.custom_icon.substring(rawRel.custom_icon.indexOf(":") + 1) : "") || "#eab308";
        badgeNote          = rawRel.note_a  || "";
    } else {
        // User B (e.g. Wife)
        roleName           = rawRel.type === "custom" ? (rawRel.custom_label || "Custom") : rawRel.type;
        reciprocalRoleName = rawRel.reciprocal_type === "custom" ? (rawRel.custom_reciprocal || "Custom") : rawRel.reciprocal_type;
        badgeIcon          = rawRel.icon_b  || rawRel.custom_icon?.split(":")[0]  || "gem";
        rawBadgeColor      = rawRel.color_b || (rawRel.custom_icon?.includes(":") ? rawRel.custom_icon.substring(rawRel.custom_icon.indexOf(":") + 1) : "") || "#f59e0b";
        badgeNote          = rawRel.note_b  || "";
    }

    const [badgeColor, customIconColor, customSinceDate, rawFx, customTheme, customAnimation, customInteraction] = (rawBadgeColor || "").split(":");
    const iconColor = customIconColor || "#ffffff";
    const fxParts = (rawFx || "1,1,1,0,0.6").split(",");
    const op = parseFloat(fxParts[0]) || 1;
    const sat = parseFloat(fxParts[1]) || 1;
    const bright = parseFloat(fxParts[2]) || 1;
    const glowSpread = parseFloat(fxParts[3]) || 0;
    const glowIntensity = parseFloat(fxParts[4]) || 0.6;
    const glowColor = fxParts[5] || badgeColor || "#ff4081";

    const formattedRole = roleName ? (roleName.charAt(0).toUpperCase() + roleName.slice(1)) : "Partner";
    const formattedReciprocal = reciprocalRoleName ? (reciprocalRoleName.charAt(0).toUpperCase() + reciprocalRoleName.slice(1)) : "Partner";

    // Extract Song Anthem if embedded (Format: Note || Song)
    const [mainNote, anthemText] = (badgeNote || "").split("||").map(s => s?.trim());

    // Role-specific interaction meta (e.g. Love Poke for romantic, High Five for besties, Game Ping for duos)
    const interactionMeta = getInteractionForRole(formattedRole, customValues?.customInteraction || customInteraction);

    // Primary Statement
    let mainHeading: string;
    let subHeading: string;

    if (viewerIsPartner) {
        mainHeading = `I am your ${formattedRole}`;
        subHeading  = `You are my ${formattedReciprocal} · Connected with @${thisUsername}`;
    } else if (viewerIsSelf) {
        mainHeading = `You are @${partnerUsername}'s ${formattedRole}`;
        subHeading  = `@${partnerUsername} is your ${formattedReciprocal}`;
    } else {
        mainHeading = `@${thisUsername} is @${partnerUsername}'s ${formattedRole}`;
        subHeading  = `@${partnerUsername} is your ${formattedReciprocal}`;
    }

    // Calculate Days Together Milestone (using custom anniversary date if provided)
    const [, , sinceDateA] = (rawRel.color_a || "").split(":");
    const [, , sinceDateB] = (rawRel.color_b || "").split(":");
    const effectiveStartDate = customSinceDate || sinceDateA || sinceDateB || rawRel.created_at;
    let daysTogether = 1;
    let formattedStartDate = "";
    if (effectiveStartDate) {
        const start = new Date(effectiveStartDate);
        const diffDays = Math.max(1, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
        daysTogether = diffDays;
        formattedStartDate = start.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    }

    const levelInfo = calculateRelationshipLevel(daysTogether);

    function handleStartEdit() {
        setCustomValues({
            typeId: badgeIcon,
            theirRole: formattedRole,
            yourRole: formattedReciprocal,
            customIcon: badgeIcon,
            customColor: rawBadgeColor,
            customBadgeColor: badgeColor,
            customIconColor: iconColor,
            customSinceDate: customSinceDate || sinceDateA || sinceDateB || "",
            customOpacity: op,
            customSaturation: sat,
            customBrightness: bright,
            customGlowSpread: glowSpread,
            customGlowIntensity: glowIntensity,
            customGlowColor: glowColor,
            customTheme: customTheme || "isometric",
            customAnimation: customAnimation || "none",
            customInteraction: customInteraction || interactionMeta.id,
            customDescription: badgeNote,
        });
        setIsEditing(true);
    }

    async function handleSaveCustomization() {
        if (!customValues) return;
        try {
            const glowSpr = Math.round(customValues.customGlowSpread ?? glowSpread);
            const glowInt = (customValues.customGlowIntensity ?? glowIntensity).toFixed(2);
            const glowCol = customValues.customGlowColor || glowColor || customValues.customBadgeColor || badgeColor;
            const fxString = `${(customValues.customOpacity ?? 1).toFixed(2)},${(customValues.customSaturation ?? 1).toFixed(2)},${(customValues.customBrightness ?? 1).toFixed(2)},${glowSpr},${glowInt},${glowCol}`;
            const combinedColor = customValues.customColor || `${customValues.customBadgeColor || badgeColor}:${customValues.customIconColor || iconColor}:${customValues.customSinceDate || ""}:${fxString}:${customValues.customTheme || "isometric"}:${customValues.customAnimation || "none"}:${customValues.customInteraction || interactionMeta.id}`;
            const patch: any = {};
            const sinceDate = customValues.customSinceDate;
            if (sinceDate && !isNaN(new Date(sinceDate).getTime())) {
                patch.created_at = new Date(sinceDate).toISOString();
            }

            if (isUserA) {
                patch.icon_a = customValues.customIcon || badgeIcon;
                patch.color_a = combinedColor;
                patch.note_a = customValues.customDescription || "";
            } else {
                patch.icon_b = customValues.customIcon || badgeIcon;
                patch.color_b = combinedColor;
                patch.note_b = customValues.customDescription || "";
            }

            await updateRelationshipCustomization(rawRel.id, patch);
            showToast("Relationship customization saved!", Toasts.Type.SUCCESS);
            setIsEditing(false);
            modalProps.onClose();
        } catch (e: any) {
            showToast(`Failed to save: ${e.message}`, Toasts.Type.FAILURE);
        }
    }

    async function handleSendInteraction(e: React.MouseEvent<HTMLButtonElement>) {
        if (!myDiscordId) return;
        setPokeSent(true);
        try {
            await sendLovePoke(rawRel.id, myDiscordId);
            const myUser = UserStore?.getCurrentUser?.();
            triggerInteractionEffect(
                myUser?.username || "You",
                partnerUsername,
                interactionMeta.id
            );
        } catch (err) {
            console.error(err);
        } finally {
            setTimeout(() => setPokeSent(false), 2500);
        }
    }

    const titleNode = (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <HeartLinkLogoIcon size={20} />
            <span style={{ fontSize: 15, fontWeight: 700 }}>HeartLink Relationship</span>
        </div>
    );

    return (
        <Modal
            {...modalProps}
            title={titleNode}
            size="md"
        >
            <ErrorBoundary noop>
                <div style={{ padding: "4px 0" }}>
                    {isEditing && customValues ? (
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                <button className="hl-btn hl-btn--ghost hl-btn--sm" onClick={() => setIsEditing(false)}>
                                    <ArrowLeftIcon size={12} /> Back
                                </button>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--header-primary)" }}>
                                    Customize {formattedRole} Badge
                                </span>
                            </div>
                            <CustomizationEditor
                                typeId={badgeIcon}
                                defaultTargetRole={formattedRole}
                                defaultSourceRole={formattedReciprocal}
                                defaultIcon={badgeIcon}
                                defaultColor={rawBadgeColor}
                                defaultDescription={badgeNote}
                                value={customValues}
                                onChange={setCustomValues}
                                onClose={handleSaveCustomization}
                            />
                        </div>
                    ) : (
                        <div className="hl-discord-embed-card" style={{ "--badge-color": badgeColor || "#ff4081" } as any}>
                            {/* Discord Embed Top Author */}
                            <div className="hl-embed-author">
                                <RelationshipIcon type={badgeIcon} size={14} customColor={iconColor} />
                                <span>HeartLink Verified Partnership</span>
                            </div>

                            {/* Discord Embed Header with Inline Badge */}
                            <div className="hl-embed-header-row" style={{ marginBottom: 14 }}>
                                <div className="hl-embed-title-group">
                                    <div className="hl-embed-title" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7, fontSize: 17, fontWeight: 800 }}>
                                        {viewerIsPartner ? (
                                            <>
                                                <span>I am your</span>
                                                <span
                                                    className={`hl-badge-embossed ${customTheme && customTheme !== "isometric" && customTheme !== "none" ? `hl-theme-${customTheme}` : ""} ${customAnimation && customAnimation !== "none" ? `hl-anim-${customAnimation}` : ""}`}
                                                    style={{
                                                        "--badge-color": badgeColor || "#ff4081",
                                                        opacity: op,
                                                        filter: `saturate(${sat}) brightness(${bright})`,
                                                    } as any}
                                                >
                                                    <RelationshipIcon type={badgeIcon} size={13} customColor={iconColor} />
                                                    <span className="hl-badge-text">{formattedRole}</span>
                                                </span>
                                            </>
                                        ) : viewerIsSelf ? (
                                            <>
                                                <span>You are @{partnerUsername}'s</span>
                                                <span
                                                    className={`hl-badge-embossed ${customTheme && customTheme !== "isometric" && customTheme !== "none" ? `hl-theme-${customTheme}` : ""} ${customAnimation && customAnimation !== "none" ? `hl-anim-${customAnimation}` : ""}`}
                                                    style={{
                                                        "--badge-color": badgeColor || "#ff4081",
                                                        opacity: op,
                                                        filter: `saturate(${sat}) brightness(${bright})`,
                                                    } as any}
                                                >
                                                    <RelationshipIcon type={badgeIcon} size={13} customColor={iconColor} />
                                                    <span className="hl-badge-text">{formattedRole}</span>
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span>@{thisUsername} is @{partnerUsername}'s</span>
                                                <span
                                                    className={`hl-badge-embossed ${customTheme && customTheme !== "isometric" && customTheme !== "none" ? `hl-theme-${customTheme}` : ""} ${customAnimation && customAnimation !== "none" ? `hl-anim-${customAnimation}` : ""}`}
                                                    style={{
                                                        "--badge-color": badgeColor || "#ff4081",
                                                        opacity: op,
                                                        filter: `saturate(${sat}) brightness(${bright})`,
                                                    } as any}
                                                >
                                                    <RelationshipIcon type={badgeIcon} size={13} customColor={iconColor} />
                                                    <span className="hl-badge-text">{formattedRole}</span>
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="hl-embed-description" style={{ marginTop: 3 }}>
                                        {subHeading}
                                    </div>
                                </div>
                            </div>

                            {/* Connected Discord Avatars Showcase */}
                            <div className="hl-detail-avatars-showcase">
                                <div className="hl-detail-avatar-col">
                                    <div className="hl-detail-avatar-wrapper">
                                        <img
                                            src={
                                                thisUser?.avatar
                                                    ? `https://cdn.discordapp.com/avatars/${userId}/${thisUser.avatar}.webp?size=128`
                                                    : `https://cdn.discordapp.com/embed/avatars/${parseInt(userId || "0") % 6}.png`
                                            }
                                            alt={thisUsername}
                                            className="hl-detail-avatar-img"
                                        />
                                    </div>
                                    <span className="hl-detail-avatar-name">@{thisUsername}</span>
                                </div>

                                <div className="hl-detail-bridge-center">
                                    <div className="hl-detail-beam-left" />
                                    <div className="hl-detail-heart-bubble">
                                        <RelationshipIcon type={badgeIcon} size={15} customColor={iconColor || "#ffffff"} className="hl-heart-pulse" />
                                    </div>
                                    <div className="hl-detail-beam-right" />
                                </div>

                                <div className="hl-detail-avatar-col">
                                    <div className="hl-detail-avatar-wrapper">
                                        <img
                                            src={
                                                partnerUser?.avatar
                                                    ? `https://cdn.discordapp.com/avatars/${partnerId}/${partnerUser.avatar}.webp?size=128`
                                                    : `https://cdn.discordapp.com/embed/avatars/${parseInt(partnerId || "0") % 6}.png`
                                            }
                                            alt={partnerUsername}
                                            className="hl-detail-avatar-img"
                                        />
                                    </div>
                                    <span className="hl-detail-avatar-name">@{partnerUsername}</span>
                                </div>
                            </div>

                            {/* Discord Embed Fields Grid */}
                            <div className="hl-embed-fields-grid">
                                {/* Field 1: Anniversary & Duration */}
                                <div className="hl-embed-field">
                                    <div className="hl-embed-field-label">ANNIVERSARY & DURATION</div>
                                    <div className="hl-embed-field-value">
                                        <span>Together {daysTogether} {daysTogether === 1 ? "day" : "days"}</span>
                                        <span className="hl-streak-chip">
                                            <FireIcon size={12} color="#f97316" />
                                            <span>{daysTogether}d</span>
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted, #949ba4)", marginTop: 2 }}>
                                        {formattedStartDate ? `Since ${formattedStartDate}` : "Active Partnership"}
                                    </div>
                                </div>

                                {/* Field 2: Bond Level & XP */}
                                <div className="hl-embed-field">
                                    <div className="hl-embed-field-label">BOND LEVEL & PROGRESS</div>
                                    <div className="hl-embed-field-value">
                                        <span style={{ color: levelInfo.color || "var(--brand-experiment, #5865f2)", fontWeight: 800 }}>Lv.{levelInfo.level} · {levelInfo.title}</span>
                                        <span style={{ fontSize: 11, color: "var(--text-muted, #949ba4)" }}>{Math.round(levelInfo.progressPercent)}%</span>
                                    </div>
                                    <div className="hl-detail-progress-track" style={{ marginTop: 6 }}>
                                        <div
                                            className="hl-detail-progress-fill"
                                            style={{
                                                width: `${levelInfo.progressPercent}%`,
                                                background: `linear-gradient(90deg, var(--brand-experiment, #5865f2) 0%, ${levelInfo.color || "#8547c6"} 100%)`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Field 3: Anthem Audio Bar */}
                            {anthemText && (
                                <div className="hl-detail-anthem-bar">
                                    <div className="hl-equalizer">
                                        <span className="hl-equalizer-bar" />
                                        <span className="hl-equalizer-bar" />
                                        <span className="hl-equalizer-bar" />
                                        <span className="hl-equalizer-bar" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                                        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(251, 191, 36, 0.9)", fontWeight: 800 }}>
                                            Our Anthem
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {anthemText}
                                        </div>
                                    </div>
                                    <MusicIcon size={14} color="#fbbf24" />
                                </div>
                            )}

                            {/* Field 4: Discord Quote Block */}
                            {mainNote && (
                                <div className="hl-discord-quote-block">
                                    <span className="hl-quote-text">“{mainNote}”</span>
                                </div>
                            )}

                            {/* Discord Embed Footer */}
                            <div className="hl-embed-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: 6 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span>HeartLink Certified Bond</span>
                                    <span>•</span>
                                    <span>{daysTogether}d Connected</span>
                                </div>
                                <div style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}>
                                    <span>Developed by</span>
                                    <a
                                        href="https://ahti.lol/"
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: "var(--brand-experiment, #5865f2)", fontWeight: 700, textDecoration: "none" }}
                                    >
                                        &lt;@930813224088141855&gt;
                                    </a>
                                    <span>for his wife Kiki</span>
                                    <span style={{ color: "var(--header-primary, #f2f3f5)", fontWeight: 600 }}>&lt;@1212171442691776584&gt;</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {isParticipant ? (
                                <div className="hl-detail-actions" style={{ marginTop: 14 }}>
                                    <button
                                        className="hl-btn hl-detail-poke-btn"
                                        onClick={handleSendInteraction}
                                        disabled={pokeSent}
                                        title={`Send a ${interactionMeta.label} with live animations`}
                                    >
                                        <RelationshipIcon type={badgeIcon} size={15} customColor="#ffffff" className={pokeSent ? "hl-heart-pulse" : ""} />
                                        <span>{pokeSent ? `${interactionMeta.label} Sent!` : interactionMeta.buttonText}</span>
                                    </button>
                                    <button
                                        className="hl-btn hl-btn--secondary"
                                        onClick={handleStartEdit}
                                        style={{ padding: "8px 16px", fontWeight: 700 }}
                                    >
                                        <PencilIcon size={13} /> Customize
                                    </button>
                                    <button
                                        className="hl-btn hl-btn--ghost"
                                        onClick={() => {
                                            modalProps.onClose();
                                            openRelationshipRequests();
                                        }}
                                        style={{ padding: "8px 14px", fontWeight: 600 }}
                                    >
                                        Hub
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: 12 }}>
                                    <button
                                        className="hl-btn hl-btn--secondary"
                                        onClick={modalProps.onClose}
                                        style={{ padding: "8px 28px", fontWeight: 700 }}
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </ErrorBoundary>
        </Modal>
    );
}

export function openRelationshipDetailModal(rawRel: Relationship, userId: string, myDiscordId: string | null) {
    openModal(props => (
        <ErrorBoundary>
            <RelationshipDetailModal
                modalProps={props}
                rawRel={rawRel}
                userId={userId}
                myDiscordId={myDiscordId}
            />
        </ErrorBoundary>
    ));
}
