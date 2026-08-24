import { Menu, showToast, Toasts, UserStore, React } from "@webpack/common";
import ErrorBoundary from "@components/ErrorBoundary";
import {
    getIncomingRequests,
    getOutgoingRequests,
    getActiveRelationships,
} from "../stores/RelationshipStore";
import {
    acceptRelationshipRequest,
    deleteRelationship,
} from "../api/supabase";
import { openRelationshipModal } from "./RelationshipModal";
import { openRelationshipRequests } from "./RelationshipRequests";
import { HeartIcon, EnvelopeIcon, PaperPlaneIcon, PlusIcon, RelationshipIcon, CheckIcon, XMarkIcon, PencilIcon } from "../icons";
import { ResolvedRelationship } from "../types";

export function HeartLinkMenu({ onClose }: { onClose: () => void; }) {
    const active   = getActiveRelationships();
    const incoming = getIncomingRequests();
    const outgoing = getOutgoingRequests();
    const me = UserStore?.getCurrentUser?.();

    async function handleAccept(rel: ResolvedRelationship) {
        try {
            await acceptRelationshipRequest(rel.raw.id);
            const user = UserStore?.getUser?.(rel.otherUserId);
            const name = user?.username || rel.otherUserId;
            showToast(`You are now ${rel.myLabel} with @${name}!`, Toasts.Type.SUCCESS);
            onClose();
        } catch (e: any) {
            showToast(`Failed to accept: ${e.message}`, Toasts.Type.FAILURE);
        }
    }

    async function handleDecline(rel: ResolvedRelationship) {
        try {
            await deleteRelationship(rel.raw.id);
            showToast("Request declined.", Toasts.Type.MESSAGE);
            onClose();
        } catch (e: any) {
            showToast(`Failed to decline: ${e.message}`, Toasts.Type.FAILURE);
        }
    }

    async function handleCancel(rel: ResolvedRelationship) {
        try {
            await deleteRelationship(rel.raw.id);
            showToast("Request cancelled.", Toasts.Type.MESSAGE);
            onClose();
        } catch (e: any) {
            showToast(`Failed to cancel: ${e.message}`, Toasts.Type.FAILURE);
        }
    }

    return (
        <Menu.Menu navId="heartlink-titlebar-menu" onClose={onClose}>
            {/* Header / Info */}
            <Menu.MenuGroup label="HeartLink">
                <Menu.MenuItem
                    id="hl-open-hub"
                    label="Open HeartLink Hub"
                    icon={() => <HeartIcon size={16} color="#f43f5e" />}
                    action={() => {
                        onClose();
                        openRelationshipRequests();
                    }}
                />
                <Menu.MenuItem
                    id="hl-send-request"
                    label="Send Relationship Request..."
                    icon={() => <PlusIcon size={16} color="var(--brand-experiment, #5865f2)" />}
                    action={() => {
                        onClose();
                        if (me?.id) openRelationshipModal(me.id);
                    }}
                />
            </Menu.MenuGroup>

            {/* Incoming Requests */}
            {incoming.length > 0 && (
                <Menu.MenuGroup label={`Incoming Requests (${incoming.length})`}>
                    {incoming.map(rel => {
                        const user = UserStore?.getUser?.(rel.otherUserId);
                        const username = user?.username || rel.otherUserId;

                        return (
                            <Menu.MenuItem
                                key={`inc-${rel.raw.id}`}
                                id={`inc-${rel.raw.id}`}
                                label={`@${username} (${rel.theirLabel})`}
                                subtext={rel.note ? `"${rel.note}"` : undefined}
                                icon={() => <RelationshipIcon type={rel.icon} size={15} customColor={rel.color} />}
                            >
                                <Menu.MenuItem
                                    id={`accept-${rel.raw.id}`}
                                    label="Accept Request"
                                    color="brand"
                                    action={() => handleAccept(rel)}
                                />
                                <Menu.MenuItem
                                    id={`decline-${rel.raw.id}`}
                                    label="Decline Request"
                                    color="danger"
                                    action={() => handleDecline(rel)}
                                />
                            </Menu.MenuItem>
                        );
                    })}
                </Menu.MenuGroup>
            )}

            {/* Active Relationships */}
            {active.length > 0 && (
                <Menu.MenuGroup label={`Active Relationships (${active.length})`}>
                    {active.map(rel => {
                        const user = UserStore?.getUser?.(rel.otherUserId);
                        const username = user?.username || rel.otherUserId;

                        return (
                            <Menu.MenuItem
                                key={`act-${rel.raw.id}`}
                                id={`act-${rel.raw.id}`}
                                label={`@${username}'s ${rel.theirLabel}`}
                                subtext={rel.note ? `"${rel.note}"` : undefined}
                                icon={() => <RelationshipIcon type={rel.icon} size={15} customColor={rel.color} />}
                                action={() => {
                                    onClose();
                                    openRelationshipRequests();
                                }}
                            />
                        );
                    })}
                </Menu.MenuGroup>
            )}

            {/* Outgoing Requests */}
            {outgoing.length > 0 && (
                <Menu.MenuGroup label={`Outgoing Pending (${outgoing.length})`}>
                    {outgoing.map(rel => {
                        const user = UserStore?.getUser?.(rel.otherUserId);
                        const username = user?.username || rel.otherUserId;

                        return (
                            <Menu.MenuItem
                                key={`out-${rel.raw.id}`}
                                id={`out-${rel.raw.id}`}
                                label={`@${username} (Pending ${rel.theirLabel})`}
                                subtext="Click to cancel"
                                color="danger"
                                icon={() => <PaperPlaneIcon size={14} color="var(--text-muted)" />}
                                action={() => handleCancel(rel)}
                            />
                        );
                    })}
                </Menu.MenuGroup>
            )}
        </Menu.Menu>
    );
}
