import { Modal, openModal, React, showToast, Toasts, UserStore } from "@webpack/common";
import ErrorBoundary from "@components/ErrorBoundary";
import {
    getIncomingRequests,
    getOutgoingRequests,
    getActiveRelationships,
    useRelationshipStore,
    toggleMuteUser,
    getMutedUsers,
} from "../stores/RelationshipStore";
import {
    acceptRelationshipRequest,
    deleteRelationship,
    updateRelationshipCustomization,
} from "../api/supabase";
import { ResolvedRelationship } from "../types";
import {
    CheckIcon, XMarkIcon, TrashIcon, ClockIcon, HeartIcon, RelationshipIcon,
    EnvelopeIcon, PaperPlaneIcon, BellIcon, BellSlashIcon, PencilIcon, ArrowLeftIcon,
    HeartLinkLogoIcon
} from "../icons";
import { CustomizationEditor, ItemCustomization } from "./CustomizationEditor";
import { openRelationshipDetailModal } from "./RelationshipDetailModal";
import { openRelationshipModal } from "./RelationshipModal";

type Tab = "active" | "incoming" | "outgoing";

function getAvatarUrl(userId: string, avatarHash: string | null): string {
    if (avatarHash) return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.webp?size=80`;
    const def = parseInt(userId || "0") % 6;
    return `https://cdn.discordapp.com/embed/avatars/${def}.png`;
}

function getUserInfo(userId: string) {
    try {
        const user = UserStore?.getUser?.(userId);
        if (!user) return { name: userId, avatar: null, username: userId };
        return {
            name: user.username || userId,
            avatar: user.avatar ?? null,
            username: user.username || userId,
        };
    } catch {
        return { name: userId, avatar: null, username: userId };
    }
}

interface RequestCardProps {
    rel: ResolvedRelationship;
    onAction: () => void;
    onEdit?: (rel: ResolvedRelationship) => void;
}

function IncomingCard({ rel, onAction }: RequestCardProps) {
    const [loading, setLoading] = React.useState(false);
    const [isMuted, setIsMuted] = React.useState(false);
    const info = getUserInfo(rel.otherUserId);

    React.useEffect(() => {
        getMutedUsers().then(muted => setIsMuted(muted.includes(rel.otherUserId)));
    }, [rel.otherUserId]);

    async function accept() {
        setLoading(true);
        try {
            await acceptRelationshipRequest(rel.raw.id);
            showToast(`You are now ${rel.myLabel} with @${info.username}!`, Toasts.Type.SUCCESS);
            onAction();
        } catch (e: any) {
            showToast(`Failed to accept: ${e.message}`, Toasts.Type.FAILURE);
            setLoading(false);
        }
    }

    async function decline() {
        setLoading(true);
        try {
            await deleteRelationship(rel.raw.id);
            showToast("Request declined.", Toasts.Type.MESSAGE);
            onAction();
        } catch (e: any) {
            showToast(`Failed to decline: ${e.message}`, Toasts.Type.FAILURE);
            setLoading(false);
        }
    }

    async function handleToggleMute() {
        const nowMuted = await toggleMuteUser(rel.otherUserId);
        setIsMuted(nowMuted);
        showToast(
            nowMuted
                ? `Muted popup notifications from @${info.username}.`
                : `Unmuted notifications from @${info.username}.`,
            Toasts.Type.MESSAGE
        );
    }

    return (
        <div className="hl-request-card">
            <img
                className="hl-avatar"
                src={getAvatarUrl(rel.otherUserId, info.avatar)}
                alt={info.name}
                style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }}
            />
            <div className="hl-request-info">
                <div className="hl-request-label">
                    <RelationshipIcon type={rel.icon} size={14} customColor={rel.color} />
                    <span>@{info.username}</span>
                </div>
                <div className="hl-request-sublabel">
                    wants you as their {rel.theirLabel} · You will be {rel.myLabel}
                </div>
                {rel.note && (
                    <div style={{ fontSize: 11, color: "var(--interactive-hover, #ffffff)", marginTop: 2, fontStyle: "italic" }}>
                        "{rel.note}"
                    </div>
                )}
            </div>
            <div className="hl-request-actions">
                <button
                    className="hl-btn hl-btn--primary hl-btn--sm"
                    onClick={accept}
                    disabled={loading}
                    title="Accept"
                >
                    {loading ? <span className="hl-btn-spinner" /> : <><CheckIcon size={12} /> Accept</>}
                </button>
                <button
                    className="hl-btn hl-btn--secondary hl-btn--sm"
                    onClick={decline}
                    disabled={loading}
                    title="Decline"
                >
                    <XMarkIcon size={12} />
                </button>
                <button
                    className="hl-btn hl-btn--ghost hl-btn--sm"
                    onClick={handleToggleMute}
                    title={isMuted ? "Unmute notifications" : "Mute notifications"}
                    style={{ color: isMuted ? "var(--status-warning-text)" : "var(--text-muted)" }}
                >
                    {isMuted ? <BellSlashIcon size={13} color="var(--status-warning-text)" /> : <BellIcon size={13} />}
                </button>
            </div>
        </div>
    );
}

function OutgoingCard({ rel, onAction }: RequestCardProps) {
    const [loading, setLoading] = React.useState(false);
    const info = getUserInfo(rel.otherUserId);

    async function cancel() {
        setLoading(true);
        try {
            await deleteRelationship(rel.raw.id);
            showToast("Request cancelled.", Toasts.Type.MESSAGE);
            onAction();
        } catch (e: any) {
            showToast(`Failed to cancel: ${e.message}`, Toasts.Type.FAILURE);
            setLoading(false);
        }
    }

    return (
        <div className="hl-request-card">
            <img
                className="hl-avatar"
                src={getAvatarUrl(rel.otherUserId, info.avatar)}
                alt={info.name}
                style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }}
            />
            <div className="hl-request-info">
                <div className="hl-request-label">
                    <RelationshipIcon type={rel.icon} size={14} customColor={rel.color} />
                    <span>{rel.theirLabel} request sent</span>
                </div>
                <div className="hl-request-sublabel">
                    Waiting for @{info.username} to accept · <ClockIcon size={10} /> Pending
                </div>
                {rel.note && (
                    <div style={{ fontSize: 11, color: "var(--interactive-hover, #ffffff)", marginTop: 2, fontStyle: "italic" }}>
                        "{rel.note}"
                    </div>
                )}
            </div>
            <div className="hl-request-actions">
                <button
                    className="hl-btn hl-btn--secondary hl-btn--sm"
                    onClick={cancel}
                    disabled={loading}
                    title="Cancel request"
                >
                    {loading ? <span className="hl-btn-spinner" /> : <XMarkIcon size={12} />}
                </button>
            </div>
        </div>
    );
}

function DeleteConfirmModal({
    modalProps,
    username,
    role,
    onConfirm,
}: {
    modalProps: any;
    username: string;
    role: string;
    onConfirm: () => Promise<void> | void;
}) {
    const [loading, setLoading] = React.useState(false);

    return (
        <Modal
            {...modalProps}
            title="End Relationship"
            size="sm"
        >
            <div style={{ padding: "10px 0 6px" }}>
                <p style={{ margin: "0 0 16px", fontSize: "14px", color: "var(--text-normal)", lineHeight: "1.5" }}>
                    Are you sure you want to remove your <strong>{role}</strong> relationship with <strong>@{username}</strong>?
                    <br />
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "inline-block", marginTop: "6px" }}>
                        Both users' badges and milestones will be removed immediately.
                    </span>
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                    <button
                        className="hl-btn hl-btn--secondary"
                        onClick={modalProps.onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="hl-btn"
                        style={{ backgroundColor: "var(--status-danger, #ed4245)", color: "#ffffff", fontWeight: 700 }}
                        disabled={loading}
                        onClick={async () => {
                            setLoading(true);
                            try {
                                await onConfirm();
                                modalProps.onClose();
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        {loading ? <span className="hl-btn-spinner" /> : "Remove Relationship"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function ActiveCard({ rel, onAction, onEdit }: RequestCardProps) {
    const [loading, setLoading] = React.useState(false);
    const info = getUserInfo(rel.otherUserId);

    function remove() {
        openModal(props => (
            <ErrorBoundary noop>
                <DeleteConfirmModal
                    modalProps={props}
                    username={info.username}
                    role={rel.theirLabel}
                    onConfirm={async () => {
                        setLoading(true);
                        try {
                            await deleteRelationship(rel.raw.id);
                            showToast("Relationship removed.", Toasts.Type.MESSAGE);
                            onAction();
                        } catch (e: any) {
                            showToast(`Failed to remove: ${e.message}`, Toasts.Type.FAILURE);
                            setLoading(false);
                        }
                    }}
                />
            </ErrorBoundary>
        ));
    }

    return (
        <div className="hl-request-card" style={{ maxWidth: "100%", boxSizing: "border-box" }}>
            <img
                className="hl-avatar"
                src={getAvatarUrl(rel.otherUserId, info.avatar)}
                alt={info.name}
                style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0 }}
            />
            <div className="hl-request-info" style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                <div className="hl-request-label" style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, maxWidth: "100%" }}>
                    <div
                        className={`hl-badge-embossed ${rel.theme && rel.theme !== "isometric" ? `hl-theme-${rel.theme}` : ""} ${rel.animation && rel.animation !== "none" ? `hl-anim-${rel.animation}` : ""}`}
                        style={{
                            "--badge-color": rel.color,
                            "--badge-glow-spread": `${rel.glowSpread ?? 0}px`,
                            "--badge-glow-intensity": rel.glowIntensity ?? 0.6,
                            "--badge-glow-color": rel.glowColor || rel.color,
                            opacity: rel.opacity ?? 1,
                            filter: `saturate(${rel.saturation ?? 1}) brightness(${rel.brightness ?? 1})`,
                            cursor: "pointer",
                            maxWidth: "100%",
                            boxSizing: "border-box",
                        } as any}
                        onClick={() => openRelationshipDetailModal(rel.raw, rel.otherUserId, UserStore?.getCurrentUser?.()?.id || null)}
                        title="Click to view relationship details & milestone"
                    >
                        <RelationshipIcon type={rel.icon} size={12} customColor={rel.iconColor || "#ffffff"} />
                        <span className="hl-badge-text" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
                            @{info.username}'s {rel.theirLabel}
                        </span>
                    </div>
                </div>

                {rel.note ? (
                    <div style={{ fontSize: 12, color: "var(--interactive-hover, #ffffff)", margin: "3px 0 1px", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        "{rel.note}"
                    </div>
                ) : null}

                <div className="hl-request-sublabel" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    Connected with @{info.username}
                </div>
            </div>
            <div className="hl-request-actions">
                {onEdit && (
                    <button
                        className="hl-btn hl-btn--secondary hl-btn--sm"
                        onClick={() => onEdit(rel)}
                        title="Customize icon, color & your note"
                    >
                        <PencilIcon size={12} />
                    </button>
                )}
                <button
                    className="hl-btn hl-btn--danger hl-btn--sm"
                    onClick={remove}
                    disabled={loading}
                    title="Remove relationship"
                >
                    {loading ? <span className="hl-btn-spinner" /> : <TrashIcon size={12} />}
                </button>
            </div>
        </div>
    );
}

interface RelationshipRequestsProps {
    modalProps: any;
    initialTab?: Tab;
}

export function RelationshipRequests({ modalProps, initialTab = "active" }: RelationshipRequestsProps) {
    const store = useRelationshipStore();
    const { myDiscordId, relationships, loading: storeLoading } = store;
    const [tab, setTab] = React.useState<Tab>(initialTab);
    const [editingRel, setEditingRel] = React.useState<ResolvedRelationship | null>(null);
    const [customValues, setCustomValues] = React.useState<ItemCustomization | null>(null);
    const [, setTick] = React.useState(0);

    const forceRefresh = () => setTick(t => t + 1);

    const active = getActiveRelationships();
    const incoming = getIncomingRequests();
    const outgoing = getOutgoingRequests();

    const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number; }[] = [
        { id: "active",   label: "Active",   icon: <HeartIcon size={14} color="#ffffff" />, count: active.length   },
        { id: "incoming", label: "Incoming", icon: <EnvelopeIcon size={14} color="#ffffff" />, count: incoming.length },
        { id: "outgoing", label: "Outgoing", icon: <PaperPlaneIcon size={14} color="#ffffff" />, count: outgoing.length },
    ];

    function handleStartEdit(rel: ResolvedRelationship) {
        setEditingRel(rel);
        const isEditingUserA = rel.otherUserId === rel.raw.user_a;
        const rawBadgeColor = isEditingUserA
            ? (rel.raw.color_a || rel.color)
            : (rel.raw.color_b || rel.color);

        const [, , sinceDateA] = (rel.raw.color_a || "").split(":");
        const [, , sinceDateB] = (rel.raw.color_b || "").split(":");
        const existingSinceDate = sinceDateA || sinceDateB || "";

        setCustomValues({
            typeId: rel.icon,
            theirRole: rel.theirLabel,
            yourRole: rel.myLabel,
            customIcon: rel.icon,
            customColor: rawBadgeColor,
            customBadgeColor: rel.color,
            customIconColor: rel.iconColor || "#ffffff",
            customSinceDate: existingSinceDate,
            customOpacity: rel.opacity ?? 1,
            customSaturation: rel.saturation ?? 1,
            customBrightness: rel.brightness ?? 1,
            customGlowSpread: rel.glowSpread ?? 0,
            customGlowIntensity: rel.glowIntensity ?? 0.6,
            customGlowColor: rel.glowColor || rel.color,
            customTheme: rel.theme || "isometric",
            customAnimation: rel.animation || "none",
            customDescription: rel.note,
        });
    }

    async function handleSaveCustomization() {
        if (!editingRel || !customValues || !myDiscordId) return;
        try {
            const isEditingUserA = editingRel.otherUserId === editingRel.raw.user_a;
            const sinceDate = customValues.customSinceDate || "";
            const glowSpr = Math.round(customValues.customGlowSpread ?? (editingRel.glowSpread ?? 0));
            const glowInt = (customValues.customGlowIntensity ?? (editingRel.glowIntensity ?? 0.6)).toFixed(2);
            const glowCol = customValues.customGlowColor || editingRel.glowColor || customValues.customBadgeColor || editingRel.color;
            const fxString = `${(customValues.customOpacity ?? 1).toFixed(2)},${(customValues.customSaturation ?? 1).toFixed(2)},${(customValues.customBrightness ?? 1).toFixed(2)},${glowSpr},${glowInt},${glowCol}`;
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
            forceRefresh();
        } catch (e: any) {
            showToast(`Failed to save: ${e.message}`, Toasts.Type.FAILURE);
        }
    }

    const titleNode = (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <HeartLinkLogoIcon size={20} />
            <span>HeartLink Hub</span>
        </div>
    );

    return (
        <Modal
            {...modalProps}
            title={titleNode}
            subtitle="Manage, customize, and view your relationships"
            size="md"
        >
            <ErrorBoundary noop>
                <div className="hl-custom-scroll" style={{ padding: "8px 2px", maxHeight: "420px", overflowY: "auto", overflowX: "hidden" }}>
                    {editingRel && customValues ? (
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                <button className="hl-btn hl-btn--ghost hl-btn--sm" onClick={() => setEditingRel(null)}>
                                    <ArrowLeftIcon size={12} /> Back
                                </button>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--header-primary)" }}>
                                    Customize @{getUserInfo(editingRel.otherUserId).username}'s {editingRel.theirLabel}
                                </span>
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
                    ) : (
                        <>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
                                <div className="hl-tabs" style={{ margin: 0, flex: 1 }}>
                                    {tabs.map(t => (
                                        <button
                                            key={t.id}
                                            className={`hl-tab ${tab === t.id ? "hl-tab--active" : ""}`}
                                            onClick={() => setTab(t.id)}
                                        >
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                                                {t.icon}
                                                {t.label}
                                            </span>
                                            {t.count > 0 && (
                                                <span className="hl-tab-badge">{t.count}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className="hl-btn hl-btn--primary hl-btn--sm"
                                    onClick={() => {
                                        const meId = myDiscordId || UserStore?.getCurrentUser?.()?.id;
                                        modalProps.onClose();
                                        if (meId) {
                                            setTimeout(() => openRelationshipModal(meId), 50);
                                        }
                                    }}
                                    style={{ padding: "7px 14px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}
                                >
                                    + New Request
                                </button>
                            </div>

                            <div className="hl-tab-content">
                                {tab === "active" && active.length === 0 && (
                                    <div className="hl-empty">
                                        <div className="hl-empty-icon-badge">
                                            <HeartIcon size={24} color="#ffffff" />
                                        </div>
                                        <p className="hl-empty-title">No active relationships</p>
                                        <p className="hl-empty-text">
                                            Accepted relationships appear here. Right-click any friend in Discord to send a request!
                                        </p>
                                    </div>
                                )}

                                {tab === "incoming" && incoming.length === 0 && (
                                    <div className="hl-empty">
                                        <div className="hl-empty-icon-badge">
                                            <EnvelopeIcon size={24} color="#ffffff" />
                                        </div>
                                        <p className="hl-empty-title">No incoming requests</p>
                                        <p className="hl-empty-text">
                                            When someone sends you a relationship request, it will appear here.
                                        </p>
                                    </div>
                                )}

                                {tab === "outgoing" && outgoing.length === 0 && (
                                    <div className="hl-empty">
                                        <div className="hl-empty-icon-badge">
                                            <PaperPlaneIcon size={24} color="#ffffff" />
                                        </div>
                                        <p className="hl-empty-title">No outgoing requests</p>
                                        <p className="hl-empty-text">
                                            Pending requests you've sent will appear here until accepted.
                                        </p>
                                    </div>
                                )}

                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    {tab === "active" && active.map(r => (
                                        <ActiveCard key={r.raw.id} rel={r} onAction={forceRefresh} onEdit={handleStartEdit} />
                                    ))}
                                    {tab === "incoming" && incoming.map(r => (
                                        <IncomingCard key={r.raw.id} rel={r} onAction={forceRefresh} />
                                    ))}
                                    {tab === "outgoing" && outgoing.map(r => (
                                        <OutgoingCard key={r.raw.id} rel={r} onAction={forceRefresh} />
                                    ))}
                                </div>

                                {/* Creator Tribute Footer */}
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 5,
                                    marginTop: 14,
                                    paddingTop: 10,
                                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                                    fontSize: 11,
                                    color: "var(--text-muted, #949ba4)",
                                    flexWrap: "wrap",
                                }}>
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
                        </>
                    )}
                </div>
            </ErrorBoundary>
        </Modal>
    );
}

export function openRelationshipRequests() {
    openModal(props => (
        <ErrorBoundary>
            <RelationshipRequests modalProps={props} />
        </ErrorBoundary>
    ));
}
