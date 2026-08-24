import { React } from "@webpack/common";
import { DiscordUser, ResolvedRelationship } from "../types";
import { ClockIcon, RelationshipIcon } from "../icons";

function getAvatarUrl(user: DiscordUser): string | null {
    if (!user.avatar) return null;
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=80`;
}

function getInitial(user: DiscordUser): string {
    const name = user.globalName ?? user.username;
    return name.charAt(0).toUpperCase();
}

function getDisplayName(user: DiscordUser): string {
    return user.globalName ?? user.username;
}

interface PersonCardProps {
    user: DiscordUser;
    isSelected?: boolean;
    isKeyboardFocused?: boolean;
    existingRelationship?: ResolvedRelationship | null;
    onClick: () => void;
    animationDelay?: number;
}

export function PersonCard({
    user,
    isSelected,
    isKeyboardFocused,
    existingRelationship,
    onClick,
    animationDelay = 0,
}: PersonCardProps) {
    const avatarUrl = getAvatarUrl(user);
    const displayName = getDisplayName(user);

    let className = "hl-person-card";
    if (isSelected) className += " hl-person-card--selected";
    if (isKeyboardFocused) className += " hl-person-card--keyboard-focused";

    return (
        <button
            className={className}
            onClick={onClick}
            aria-selected={isSelected}
            style={{ animationDelay: `${animationDelay}ms` }}
            tabIndex={0}
        >
            <div className="hl-avatar-wrap">
                {avatarUrl ? (
                    <img
                        className="hl-avatar"
                        src={avatarUrl}
                        alt={displayName}
                        loading="lazy"
                    />
                ) : (
                    <div className="hl-avatar-placeholder">
                        {getInitial(user)}
                    </div>
                )}
            </div>

            <div className="hl-person-info">
                <span className="hl-person-name">{displayName}</span>
                <span className="hl-person-username">@{user.username}</span>
            </div>

            {existingRelationship && (
                <div className={`hl-person-badge hl-person-badge--${existingRelationship.status === "accepted" ? "active" : "pending"}`}>
                    {existingRelationship.status === "accepted" ? (
                        <>
                            <RelationshipIcon type={existingRelationship.icon} size={11} />
                            <span>{existingRelationship.myLabel}</span>
                        </>
                    ) : (
                        <>
                            <ClockIcon size={10} />
                            <span>Pending</span>
                        </>
                    )}
                </div>
            )}
        </button>
    );
}

/** Skeleton loader for PersonCard */
export function PersonCardSkeleton({ index }: { index: number; }) {
    return (
        <div className="hl-skeleton-person" style={{ animationDelay: `${index * 60}ms` }}>
            <div className="hl-skeleton hl-skeleton-avatar" />
            <div className="hl-skeleton-text-wrap">
                <div className="hl-skeleton hl-skeleton-text" style={{ width: `${60 + (index % 3) * 15}%` }} />
                <div className="hl-skeleton hl-skeleton-text" style={{ width: "40%" }} />
            </div>
        </div>
    );
}
