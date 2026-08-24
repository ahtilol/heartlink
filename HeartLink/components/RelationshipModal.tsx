import { Modal, openModal, React, showToast, Toasts, UserStore } from "@webpack/common";
import ErrorBoundary from "@components/ErrorBoundary";
import { DiscordUser, RelationshipTypeDefinition, ROMANTIC_TYPES } from "../types";
import { PeopleSelector } from "./PeopleSelector";
import { RelationshipTypeSelector } from "./RelationshipTypeSelector";
import { ItemCustomization } from "./CustomizationEditor";
import { HeartIcon, ArrowLeftIcon, PaperPlaneIcon, RelationshipIcon, ShieldHeartIcon, CheckIcon, HeartLinkLogoIcon } from "../icons";
import { sendRelationshipRequest } from "../api/supabase";

type Step = "people" | "type" | "confirm";

interface RelationshipModalProps {
    modalProps: any;
    myDiscordId: string;
    /** If opened from a profile, pre-select this user */
    preselectedUser?: DiscordUser;
}

function StepIndicator({ step }: { step: Step; }) {
    const steps: { id: Step; label: string; }[] = [
        { id: "people",  label: "Choose Friend" },
        { id: "type",    label: "Relationships" },
        { id: "confirm", label: "Confirm" },
    ];
    const current = steps.findIndex(s => s.id === step);

    return (
        <div className="hl-steps" style={{ marginBottom: 12 }}>
            {steps.map((s, i) => (
                <React.Fragment key={s.id}>
                    {i > 0 && (
                        <div className={`hl-step-connector ${i <= current ? "hl-step-connector--done" : ""}`} />
                    )}
                    <div className="hl-step">
                        <div className={`hl-step-dot hl-step-dot--${i < current ? "done" : i === current ? "active" : "inactive"}`}>
                            {i < current ? <CheckIcon size={10} color="#ffffff" /> : i + 1}
                        </div>
                        <span className={`hl-step-label ${i === current ? "hl-step-label--active" : ""}`}>
                            {s.label}
                        </span>
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
}

export function RelationshipModal({ modalProps, myDiscordId, preselectedUser }: RelationshipModalProps) {
    const [step,           setStep]           = React.useState<Step>(preselectedUser ? "type" : "people");
    const [selectedUser,   setSelectedUser]   = React.useState<DiscordUser | null>(preselectedUser ?? null);
    const [selectedTypes,  setSelectedTypes]  = React.useState<RelationshipTypeDefinition[]>([]);
    const [customizations, setCustomizations] = React.useState<Record<string, ItemCustomization>>({});
    const [sending,        setSending]        = React.useState(false);
    const [error,          setError]          = React.useState<string | null>(null);

    function handleNext() {
        if (step === "people") {
            if (!selectedUser) {
                setError("Please select a friend first.");
                return;
            }
            setError(null);
            setStep("type");
        } else if (step === "type") {
            if (selectedTypes.length === 0) {
                setError("Please select at least one relationship type.");
                return;
            }
            setError(null);
            setStep("confirm");
        }
    }

    async function handleSend() {
        if (!selectedUser || selectedTypes.length === 0) return;
        setSending(true);
        setError(null);

        try {
            for (const t of selectedTypes) {
                const custom = customizations[t.id];
                const rawIcon = custom?.customIcon || t.id;
                const rawColor = custom?.customColor || t.iconColor;
                const customIconField = `${rawIcon}:${rawColor}`;
                const noteDescription = custom?.customDescription || "";

                if (t.id === "custom") {
                    await sendRelationshipRequest({
                        user_a:            myDiscordId,
                        user_b:            selectedUser.id,
                        type:              "custom",
                        reciprocal_type:   "custom",
                        custom_label:      custom?.theirRole || "Custom",
                        custom_reciprocal: custom?.yourRole  || "Partner",
                        custom_icon:       customIconField,
                    });
                } else {
                    await sendRelationshipRequest({
                        user_a:            myDiscordId,
                        user_b:            selectedUser.id,
                        type:              t.id,
                        reciprocal_type:   t.reciprocal,
                        custom_label:      custom?.theirRole || t.label,
                        custom_reciprocal: noteDescription || (custom?.yourRole || t.reciprocal),
                        custom_icon:       customIconField,
                    });
                }
            }

            const name = selectedUser.username || "them";
            const msg = selectedTypes.length === 1
                ? `Request sent to @${name} for "${selectedTypes[0].label}"!`
                : `${selectedTypes.length} relationship requests sent to @${name}!`;

            showToast(msg, Toasts.Type.SUCCESS);
            modalProps.onClose();
        } catch (e: any) {
            console.error("[HeartLink] Send request error:", e);
            setError(e.message || "Failed to send request. Please try again.");
            setSending(false);
        }
    }

    const modalTitle = (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <HeartLinkLogoIcon size={20} />
            <span>
                {step === "people"
                    ? "Choose a Friend"
                    : step === "type"
                        ? `Set Relationship with @${selectedUser?.username || "friend"}`
                        : "Confirm Relationship Request"}
            </span>
        </div>
    );

    const modalSubtitle = step === "people"
        ? "Select the friend you want to connect with"
        : step === "type"
            ? "Pick one or more relationship roles and customize each one"
            : "Review the requests you are about to send";

    return (
        <Modal
            {...modalProps}
            title={modalTitle}
            subtitle={modalSubtitle}
            size="md"
        >
            <ErrorBoundary noop>
                <div style={{ padding: "8px 0" }}>
                    <StepIndicator step={step} />

                    {error && (
                        <div className="hl-error" style={{ marginBottom: 10 }}>
                            {error}
                        </div>
                    )}

                    {step === "people" && (
                        <div>
                            <PeopleSelector
                                selectedUser={selectedUser}
                                onSelect={u => {
                                    setSelectedUser(u);
                                    setError(null);
                                }}
                            />
                        </div>
                    )}

                    {step === "type" && (
                        <div className="hl-custom-scroll" style={{ maxHeight: "310px", overflowY: "auto", overflowX: "hidden", paddingRight: 4 }}>
                            <RelationshipTypeSelector
                                selectedTypes={selectedTypes}
                                onToggleType={type => {
                                    setError(null);
                                    setSelectedTypes(prev => {
                                        const exists = prev.some(t => t.id === type.id);
                                        if (exists) {
                                            return prev.filter(t => t.id !== type.id);
                                        } else {
                                            // Max 1 romantic
                                            if (ROMANTIC_TYPES.includes(type.id)) {
                                                const nonRomantic = prev.filter(t => !ROMANTIC_TYPES.includes(t.id));
                                                return [...nonRomantic, type];
                                            }
                                            return [...prev, type];
                                        }
                                    });
                                }}
                                customizations={customizations}
                                onUpdateCustomization={(typeId, custom) => {
                                    setCustomizations(prev => ({ ...prev, [typeId]: custom }));
                                }}
                            />
                        </div>
                    )}

                    {step === "confirm" && (
                        <div>
                            <div className="hl-confirm-summary">
                                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                                    You are sending relationship requests to:
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                                    <div className="hl-avatar-badge-wrap">
                                        <img
                                            className="hl-avatar"
                                            src={
                                                selectedUser?.avatar
                                                    ? `https://cdn.discordapp.com/avatars/${selectedUser.id}/${selectedUser.avatar}.webp?size=64`
                                                    : `https://cdn.discordapp.com/embed/avatars/${parseInt(selectedUser?.id || "0") % 6}.png`
                                            }
                                            alt={selectedUser?.username}
                                            style={{ width: 44, height: 44, borderRadius: "50%" }}
                                        />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--header-primary)" }}>
                                            @{selectedUser?.username}
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                            ID: {selectedUser?.id}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--header-secondary)", marginBottom: 8 }}>
                                    Selected Roles ({selectedTypes.length}):
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {selectedTypes.map(t => {
                                        const custom = customizations[t.id];
                                        const theirRole = custom?.theirRole || t.label;
                                        const yourRole = custom?.yourRole || t.reciprocal;
                                        const activeIcon = custom?.customIcon || t.id;
                                        const activeColor = custom?.customColor || t.iconColor;
                                        const [badgeColor, customIconColor] = (activeColor || "").split(":");
                                        const iconColor = customIconColor || "#ffffff";
                                        const desc = custom?.customDescription;

                                        return (
                                            <div
                                                key={t.id}
                                                className="hl-type-card hl-type-card--selected"
                                                style={{ cursor: "default" }}
                                            >
                                                <div
                                                    className="hl-badge-embossed"
                                                    style={{
                                                        "--badge-color": badgeColor || "#ff4081",
                                                    } as any}
                                                >
                                                    <RelationshipIcon type={activeIcon} size={14} customColor={iconColor} />
                                                </div>
                                                <div className="hl-type-info" style={{ flex: 1 }}>
                                                    <div className="hl-type-name">
                                                        @{selectedUser?.username}'s {theirRole}
                                                    </div>
                                                    <div className="hl-type-reciprocal">
                                                        {desc ? `"${desc}" · ` : ""}You will be: <strong>{yourRole}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{ marginTop: 14, fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                                    <ShieldHeartIcon size={14} color="#f43f5e" />
                                    <span>They must accept this request before the badges appear on Discord.</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                        {step === "people" && (
                            <>
                                <button className="hl-btn hl-btn--secondary" onClick={modalProps.onClose}>
                                    Cancel
                                </button>
                                <button
                                    className="hl-btn hl-btn--primary"
                                    disabled={!selectedUser}
                                    onClick={handleNext}
                                >
                                    Continue →
                                </button>
                            </>
                        )}

                        {step === "type" && (
                            <>
                                {!preselectedUser && (
                                    <button className="hl-btn hl-btn--ghost" onClick={() => { setStep("people"); setError(null); }}>
                                        <ArrowLeftIcon size={12} /> Back
                                    </button>
                                )}
                                <button className="hl-btn hl-btn--secondary" onClick={modalProps.onClose}>
                                    Cancel
                                </button>
                                <button
                                    className="hl-btn hl-btn--primary"
                                    disabled={selectedTypes.length === 0}
                                    onClick={handleNext}
                                >
                                    Continue {selectedTypes.length > 0 ? `(${selectedTypes.length})` : ""} →
                                </button>
                            </>
                        )}

                        {step === "confirm" && (
                            <>
                                <button
                                    className="hl-btn hl-btn--ghost"
                                    onClick={() => { setStep("type"); setError(null); }}
                                    disabled={sending}
                                >
                                    <ArrowLeftIcon size={12} /> Back
                                </button>
                                <button
                                    className="hl-btn hl-btn--secondary"
                                    onClick={modalProps.onClose}
                                    disabled={sending}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="hl-btn hl-btn--primary"
                                    onClick={handleSend}
                                    disabled={sending}
                                >
                                    {sending ? (
                                        <><span className="hl-btn-spinner" /> Sending…</>
                                    ) : (
                                        <><PaperPlaneIcon size={13} /> Send Request{selectedTypes.length > 1 ? "s" : ""}</>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </ErrorBoundary>
        </Modal>
    );
}

export function openRelationshipModal(myDiscordId: string, preselectedUser?: DiscordUser) {
    openModal(props => (
        <ErrorBoundary>
            <RelationshipModal
                modalProps={props}
                myDiscordId={myDiscordId}
                preselectedUser={preselectedUser}
            />
        </ErrorBoundary>
    ));
}
