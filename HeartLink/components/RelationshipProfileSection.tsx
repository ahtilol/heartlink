import { React, showToast, Toasts, UserStore } from "@webpack/common";
import {
    useRelationshipStore,
    getAcceptedRelationshipsForUser,
    getAllRelationshipsWith,
} from "../stores/RelationshipStore";
import {
    acceptRelationshipRequest,
    deleteRelationship,
    updateRelationshipCustomization,
} from "../api/supabase";
import { openRelationshipModal } from "./RelationshipModal";
import { CustomizationEditor, ItemCustomization } from "./CustomizationEditor";
import { DiscordUser, ResolvedRelationship } from "../types";
import { HeartIcon, PencilIcon, CheckIcon, XMarkIcon, ClockIcon, RelationshipIcon, SparklesIcon } from "../icons";

interface ProfileSectionProps {
    userId: string;
}

function toDiscordUser(u: any): DiscordUser {
    return {
        id: u.id,
        username: u.username,
        discriminator: u.discriminator,
        globalName: u.globalName ?? u.username,
        avatar: u.avatar,
    };
}

export function RelationshipProfileSection({ userId }: ProfileSectionProps) {
    const store = useRelationshipStore();
    const { myDiscordId } = store;
    const [actionLoading, setActionLoading] = React.useState<string | null>(null);
    const [editingRel, setEditingRel]       = React.useState<ResolvedRelationship | null>(null);
    const [customValues, setCustomValues]   = React.useState<ItemCustomization | null>(null);

    // 1. All accepted relationships of THIS target user (who they are connected to)
    const userAcceptedRels = getAcceptedRelationshipsForUser(userId);

    // 2. Viewer's direct interactions with this user (pending requests)
    const myDirectRels = myDiscordId ? getAllRelationshipsWith(userId) : [];
    const incomingPending = myDirectRels.filter(r => r.status === "pending" && !r.iAmRequester);
    const outgoingPending = myDirectRels.filter(r => r.status === "pending" && r.iAmRequester);

    // Don't show on own profile view in this section
    if (!myDiscordId || userId === myDiscordId) return null;

    function openSetRel() {
        const u = UserStore.getUser(userId);
        if (!u) return;
        openRelationshipModal(myDiscordId!, toDiscordUser(u));
    }

    async function handleAccept(rel: ResolvedRelationship) {
        setActionLoading(rel.raw.id);
        try {
            await acceptRelationshipRequest(rel.raw.id);
            showToast(`You accepted the ${rel.myLabel} relationship!`, Toasts.Type.SUCCESS);
        } catch (e: any) {
            showToast(`Failed to accept: ${e.message}`, Toasts.Type.FAILURE);
        } finally {
            setActionLoading(null);
        }
    }

    async function handleDecline(rel: ResolvedRelationship) {
        setActionLoading(rel.raw.id);
        try {
            await deleteRelationship(rel.raw.id);
            showToast("Relationship request declined.", Toasts.Type.MESSAGE);
        } catch (e: any) {
            showToast(`Failed: ${e.message}`, Toasts.Type.FAILURE);
        } finally {
            setActionLoading(null);
        }
    }

    function handleStartEdit(rel: ResolvedRelationship) {
        setEditingRel(rel);
        const isEditingUserA = rel.otherUserId === rel.raw.user_a;
        const rawBadgeColor = isEditingUserA
            ? (rel.raw.color_a || (rel.raw.custom_icon?.includes(":") ? rel.raw.custom_icon.substring(rel.raw.custom_icon.indexOf(":") + 1) : "") || rel.color)
            : (rel.raw.color_b || (rel.raw.custom_icon?.includes(":") ? rel.raw.custom_icon.substring(rel.raw.custom_icon.indexOf(":") + 1) : "") || rel.color);

        const [badgeColor, customIconColor, customSinceDate, rawFx, customTheme, customAnimation] = (rawBadgeColor || "").split(":");
        const [op, sat, bright] = (rawFx || "1,1,1").split(",").map(v => parseFloat(v) || 1);

        const [, , sinceDateA] = (rel.raw.color_a || "").split(":");
        const [, , sinceDateB] = (rel.raw.color_b || "").split(":");
        const existingSinceDate = customSinceDate || sinceDateA || sinceDateB || "";

        setCustomValues({
            typeId: rel.icon,
            theirRole: rel.theirLabel,
            yourRole: rel.myLabel,
            customIcon: rel.icon,
            customColor: rawBadgeColor,
            customBadgeColor: badgeColor || rel.color,
            customIconColor: customIconColor || rel.iconColor || "#ffffff",
            customSinceDate: existingSinceDate,
            customOpacity: op,
            customSaturation: sat,
            customBrightness: bright,
            customTheme: customTheme || "isometric",
            customAnimation: customAnimation || "none",
            customDescription: rel.note,
        });
    }

    async function handleSaveCustomization() {
        if (!editingRel || !customValues || !myDiscordId) return;
        try {
            const isEditingUserA = editingRel.otherUserId === editingRel.raw.user_a;
            const sinceDate = customValues.customSinceDate || "";
            const fxString = `${(customValues.customOpacity ?? 1).toFixed(2)},${(customValues.customSaturation ?? 1).toFixed(2)},${(customValues.customBrightness ?? 1).toFixed(2)}`;
            const combinedColor = customValues.customColor || `${customValues.customBadgeColor || editingRel.color}:${customValues.customIconColor || editingRel.iconColor || "#ffffff"}:${sinceDate}:${fxString}:${customValues.customTheme || "isometric"}:${customValues.customAnimation || "none"}`;
            const patch: any = {};

            if (sinceDate && !isNaN(new Date(sinceDate).getTime())) {
                patch.created_at = new Date(sinceDate).toISOString();
            }

            if (isEditingUserA) {
                patch.icon_a = customValues.customIcon || editingRel.icon;
                patch.color_a = combinedColor;
                patch.note_a = customValues.customDescription || "";
            } else {
                patch.icon_b = customValues.customIcon || editingRel.icon;
                patch.color_b = combinedColor;
                patch.note_b = customValues.customDescription || "";
            }

            await updateRelationshipCustomization(editingRel.raw.id, patch);
            showToast("Relationship customization saved!", Toasts.Type.SUCCESS);
            setEditingRel(null);
        } catch (e: any) {
            showToast(`Failed to save: ${e.message}`, Toasts.Type.FAILURE);
        }
    }

    // Inline edit mode inside profile
    if (editingRel && customValues) {
        return (
            <div className="hl-profile-section" style={{ padding: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--header-primary)" }}>
                        Customize {editingRel.theirLabel} Badge
                    </span>
                    <button className="hl-btn hl-btn--ghost hl-btn--sm" onClick={() => setEditingRel(null)}>
                        Cancel
                    </button>
                </div>
                <CustomizationEditor
                    typeId={editingRel.icon}
                    defaultTargetRole={editingRel.theirLabel}
                    defaultSourceRole={editingRel.myLabel}
                    defaultIcon={editingRel.icon}
                    defaultColor={editingRel.color}
                    defaultDescription={editingRel.note}
                    value={customValues}
                    onChange={setCustomValues}
                    onClose={handleSaveCustomization}
                />
            </div>
        );
    }

    return (
        <div className="hl-profile-section">
            <div className="hl-profile-section-header">
                <HeartIcon size={12} color="#f43f5e" />
                <span className="hl-profile-section-title">HeartLink Relationships</span>
            </div>

            {/* 1. Active Relationships of THIS User */}
            {userAcceptedRels.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                    {userAcceptedRels.map(rel => {
                        const partnerUser = UserStore.getUser(rel.otherUserId);
                        const partnerUsername = partnerUser?.username || rel.otherUserId;
                        const roleTitle = `@${partnerUsername}'s ${rel.theirLabel}`;

                        // Can only edit if the viewing user is one of the partners in THIS relationship
                        const isParticipant = myDiscordId && (myDiscordId === rel.raw.user_a || myDiscordId === rel.raw.user_b);

                        return (
                            <div key={rel.raw.id} className="hl-profile-relationship" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                                    <div
                                        className={`hl-profile-icon-badge ${rel.theme && rel.theme !== "isometric" ? `hl-theme-${rel.theme}` : ""} ${rel.animation && rel.animation !== "none" ? `hl-anim-${rel.animation}` : ""}`}
                                        style={{
                                            backgroundColor: `${rel.color || "#5865f2"}22`,
                                            color: rel.color || "#5865f2",
                                            "--badge-color": rel.color || "#5865f2",
                                            "--badge-glow-spread": `${rel.glowSpread ?? 0}px`,
                                            "--badge-glow-intensity": rel.glowIntensity ?? 0.6,
                                            "--badge-glow-color": rel.glowColor || rel.color || "#5865f2",
                                            opacity: rel.opacity ?? 1,
                                            filter: `saturate(${rel.saturation ?? 1}) brightness(${rel.brightness ?? 1})`,
                                        } as any}
                                    >
                                        <RelationshipIcon type={rel.icon} size={15} customColor={rel.iconColor || rel.color} />
                                    </div>
                                    <div className="hl-profile-rel-info">
                                        <div className="hl-profile-rel-label" style={{ fontSize: 13, fontWeight: 700, color: "var(--header-primary)" }}>
                                            {roleTitle}
                                        </div>
                                        {rel.note ? (() => {
                                            const [mainNote, anthemText] = (rel.note || "").split("||").map(s => s?.trim());
                                            return (
                                                <>
                                                    {mainNote && (
                                                        <div style={{ fontSize: 11, color: "var(--interactive-hover, #ffffff)", fontStyle: "italic" }}>
                                                            "{mainNote}"
                                                        </div>
                                                    )}
                                                    {anthemText && (
                                                        <div style={{ fontSize: 10.5, color: "#fbbf24", fontWeight: 600, marginTop: 2 }}>
                                                            🎵 {anthemText}
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })() : null}
                                        <div className="hl-profile-rel-username" style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                                            <span>Connected with @{partnerUsername}</span>
                                            {rel.daysTogether && rel.daysTogether > 0 ? (
                                                <span>· Together {rel.daysTogether}d</span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                                {isParticipant && (
                                    <button
                                        className="hl-type-edit-btn"
                                        onClick={() => handleStartEdit(rel)}
                                        title="Customize icon, color & your note"
                                    >
                                        <PencilIcon size={11} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Single / Unlinked State for this User */
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 10px",
                    background: "var(--background-secondary-alt, #1e1f22)",
                    borderRadius: 6,
                    border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))",
                    fontSize: 12,
                    color: "var(--text-muted, #949ba4)",
                    marginBottom: 8,
                }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                    <span>Single · No Active Relationship</span>
                </div>
            )}

            {/* 2. Incoming Pending Requests from this User */}
            {incomingPending.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                    {incomingPending.map(rel => (
                        <div key={rel.raw.id} className="hl-profile-pending-box" style={{
                            padding: "8px 10px",
                            background: "var(--background-secondary)",
                            borderRadius: 6,
                            border: "1px solid rgba(245, 158, 11, 0.3)"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                <RelationshipIcon type={rel.icon} size={13} customColor="#f59e0b" />
                                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--header-primary)" }}>
                                    Request: Wants you as their {rel.theirLabel}
                                </span>
                            </div>
                            {rel.note && (
                                <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", marginBottom: 6 }}>
                                    "{rel.note}"
                                </div>
                            )}
                            <div style={{ display: "flex", gap: 6 }}>
                                <button
                                    className="hl-btn hl-btn--primary hl-btn--sm"
                                    onClick={() => handleAccept(rel)}
                                    disabled={actionLoading === rel.raw.id}
                                    style={{ flex: 1, justifyContent: "center" }}
                                >
                                    <CheckIcon size={11} /> Accept
                                </button>
                                <button
                                    className="hl-btn hl-btn--secondary hl-btn--sm"
                                    onClick={() => handleDecline(rel)}
                                    disabled={actionLoading === rel.raw.id}
                                >
                                    <XMarkIcon size={11} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 3. Outgoing Pending Requests to this User */}
            {outgoingPending.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                    {outgoingPending.map(rel => (
                        <div key={rel.raw.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button className="hl-profile-btn hl-profile-btn--pending" style={{ flex: 1 }} disabled>
                                <ClockIcon size={12} /> {rel.theirLabel} Request Pending…
                            </button>
                            <button
                                className="hl-btn hl-btn--secondary hl-btn--sm"
                                onClick={() => handleDecline(rel)}
                                title="Cancel Request"
                            >
                                <XMarkIcon size={11} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 4. Action Button: Send Request / Connect */}
            {incomingPending.length === 0 && outgoingPending.length === 0 && (
                <div className="hl-profile-btn-wrap">
                    <button className="hl-profile-btn" onClick={openSetRel} style={{ width: "100%" }}>
                        <HeartIcon size={13} color="#f43f5e" />
                        {userAcceptedRels.length > 0 ? "Send Relationship Request" : "Send Relationship Request"}
                    </button>
                </div>
            )}
        </div>
    );
}
