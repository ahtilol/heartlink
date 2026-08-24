import {
    VoiceStateStore,
    SelectedChannelStore,
    UserStore,
    UserSettingsProtoStore,
    UserSettingsActionCreators,
    showToast,
    Toasts,
} from "@webpack/common";
import { getAllRelationshipsWith } from "../stores/RelationshipStore";
import { triggerInteractionEffect } from "./lovePokeEffects";

let isInCallWithPartner = false;
let activeCallPartnerId: string | null = null;
let originalCustomStatus: { text: string; emojiName?: string; emojiId?: string } | null = null;
let callStartTime: number | null = null;
let statusSetByHeartLink = false;

export function initAutoCallStatus(settings: any) {
    function checkVoiceCallStatus() {
        if (!settings.store.autoCallStatus) {
            if (isInCallWithPartner) {
                handlePartnerCallEnded(settings);
            }
            return;
        }

        const me = UserStore?.getCurrentUser?.();
        if (!me) return;

        const acceptedRels = getAllRelationshipsWith(me.id).filter(r => r.status === "accepted");
        if (!acceptedRels || acceptedRels.length === 0) {
            if (isInCallWithPartner) {
                handlePartnerCallEnded(settings);
            }
            return;
        }

        const voiceChannelId = SelectedChannelStore?.getVoiceChannelId?.();
        if (!voiceChannelId) {
            if (isInCallWithPartner) {
                handlePartnerCallEnded(settings);
            }
            return;
        }

        const voiceStates = VoiceStateStore?.getVoiceStatesForChannel?.(voiceChannelId) || {};
        const activePartnerRel = acceptedRels.find(r => {
            const partnerId = r.otherUserId;
            return (voiceStates as any)[partnerId] != null || Object.keys(voiceStates).includes(partnerId);
        });

        if (activePartnerRel) {
            if (!isInCallWithPartner || activeCallPartnerId !== activePartnerRel.otherUserId) {
                handlePartnerCallStarted(activePartnerRel, me, settings);
            }
        } else {
            if (isInCallWithPartner) {
                handlePartnerCallEnded(settings);
            }
        }
    }

    try {
        VoiceStateStore?.addChangeListener?.(checkVoiceCallStatus);
        SelectedChannelStore?.addChangeListener?.(checkVoiceCallStatus);
        // Initial check
        setTimeout(checkVoiceCallStatus, 2000);
    } catch (e) {
        console.warn("[HeartLink] Failed to register voice listeners", e);
    }

    return () => {
        try {
            VoiceStateStore?.removeChangeListener?.(checkVoiceCallStatus);
            SelectedChannelStore?.removeChangeListener?.(checkVoiceCallStatus);
            if (isInCallWithPartner) {
                handlePartnerCallEnded(settings);
            }
        } catch (e) {
            console.warn("[HeartLink] Cleanup error in autoCallStatus", e);
        }
    };
}

function handlePartnerCallStarted(partnerRel: any, me: any, settings: any) {
    isInCallWithPartner = true;
    activeCallPartnerId = partnerRel.otherUserId;
    callStartTime = Date.now();

    const partnerUser = UserStore?.getUser?.(partnerRel.otherUserId);
    const partnerName = partnerUser?.username || "my love";

    // Save previous custom status if not already saved
    try {
        const currentStatus = (UserSettingsProtoStore as any)?.getCustomStatus?.() || (UserSettingsActionCreators?.PreloadedUserSettingsActionCreators as any)?.getCurrentValue?.()?.status?.customStatus;
        if (currentStatus && !statusSetByHeartLink) {
            originalCustomStatus = {
                text: currentStatus.text || "",
                emojiName: currentStatus.emojiName || "",
                emojiId: currentStatus.emojiId || "",
            };
        }
    } catch (e) {
        console.warn("[HeartLink] Could not read existing status", e);
    }

    // Format new custom status text
    const customTemplate = settings.store.customCallStatusText || "In a call with the love of my life 💕";
    const statusText = customTemplate
        .replace("{partner}", partnerName)
        .replace("{role}", partnerRel.theirLabel || "partner");

    try {
        const Preloaded = UserSettingsActionCreators?.PreloadedUserSettingsActionCreators;
        if (Preloaded?.updateAsync) {
            Preloaded.updateAsync(
                "status",
                (s: any) => {
                    s.customStatus = {
                        text: statusText,
                        emojiName: "💕",
                        emojiId: null,
                        expiresAtMs: "0",
                    };
                },
                0
            );
            statusSetByHeartLink = true;
        }
    } catch (err) {
        console.error("[HeartLink] Failed to apply auto call status", err);
    }

    // Fun toast & sparkle celebration
    showToast(`💕 Connected in call with @${partnerName}! Status updated ✨`, Toasts.Type.SUCCESS);
    triggerInteractionEffect(me.username || "You", partnerName, "sparkles");
}

function handlePartnerCallEnded(settings: any) {
    if (!isInCallWithPartner) return;

    const partnerUser = activeCallPartnerId ? UserStore?.getUser?.(activeCallPartnerId) : null;
    const partnerName = partnerUser?.username || "partner";
    const durationSec = callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : 0;

    // Restore previous custom status
    if (statusSetByHeartLink) {
        try {
            const Preloaded = UserSettingsActionCreators?.PreloadedUserSettingsActionCreators;
            if (Preloaded?.updateAsync) {
                Preloaded.updateAsync(
                    "status",
                    (s: any) => {
                        if (originalCustomStatus && originalCustomStatus.text) {
                            s.customStatus = {
                                text: originalCustomStatus.text,
                                emojiName: originalCustomStatus.emojiName || null,
                                emojiId: originalCustomStatus.emojiId || null,
                                expiresAtMs: "0",
                            };
                        } else {
                            s.customStatus = null;
                        }
                    },
                    0
                );
            }
        } catch (err) {
            console.error("[HeartLink] Failed to restore previous status", err);
        }
    }

    // Show nice summary toast if call lasted > 10 seconds
    if (durationSec >= 10) {
        const mins = Math.floor(durationSec / 60);
        const secs = durationSec % 60;
        const timeFormatted = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
        showToast(`💖 Call with @${partnerName} ended (${timeFormatted}). Status restored!`, Toasts.Type.MESSAGE);
    }

    isInCallWithPartner = false;
    activeCallPartnerId = null;
    originalCustomStatus = null;
    callStartTime = null;
    statusSetByHeartLink = false;
}
