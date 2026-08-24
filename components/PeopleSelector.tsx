import { React } from "@webpack/common";
import { findStoreLazy } from "@webpack";
import { DiscordUser, ResolvedRelationship } from "../types";
import { PersonCard, PersonCardSkeleton } from "./PersonCard";
import { SearchIcon } from "../icons";
import { getRelationshipWith, useRelationshipStore } from "../stores/RelationshipStore";

const RelationshipStore = findStoreLazy("RelationshipStore");

/** Get Discord friends from Discord's own RelationshipStore */
function useFriends(myId?: string): DiscordUser[] {
    return React.useMemo(() => {
        try {
            // Discord's RelationshipStore has getFriendIDs() and getRelationships()
            const friendIds: string[] = RelationshipStore.getFriendIDs?.() ?? [];
            const UserStore = (globalThis as any).webpackChunkdiscord_app
                ? null
                : null;

            // Access user objects from Discord's UserStore via Vencord's webpack
            const { UserStore: US } = require("@webpack/common");
            const meId = myId || US.getCurrentUser()?.id;
            return friendIds
                .map((id: string) => US.getUser(id))
                .filter((u: any) => u && !u.bot && u.id !== meId && u.id !== US.getCurrentUser()?.id)
                .map((u: any) => ({
                    id:            u.id,
                    username:      u.username,
                    globalName:    u.globalName ?? u.global_name ?? null,
                    discriminator: u.discriminator ?? "0",
                    avatar:        u.avatar ?? null,
                    bot:           u.bot ?? false,
                })) as DiscordUser[];
        } catch {
            return [];
        }
    }, [myId]);
}

interface PeopleSelectorProps {
    myDiscordId?: string;
    selectedUser?: DiscordUser | null;
    onSelect: (user: DiscordUser) => void;
}

export function PeopleSelector({ myDiscordId, selectedUser, onSelect }: PeopleSelectorProps) {
    const [query,          setQuery]         = React.useState("");
    const [deferredQuery,  setDeferredQuery] = React.useState("");
    const [keyboardIndex,  setKeyboardIndex] = React.useState(-1);
    const [loading,        setLoading]       = React.useState(true);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef  = React.useRef<HTMLDivElement>(null);
    const { relationships, myDiscordId: myId } = useRelationshipStore();

    const friends = useFriends(myDiscordId);

    // Simulate brief load for skeleton feel
    React.useEffect(() => {
        const t = setTimeout(() => setLoading(false), 300);
        return () => clearTimeout(t);
    }, []);

    // Debounce the query for filtering
    React.useEffect(() => {
        const t = setTimeout(() => setDeferredQuery(query), 120);
        return () => clearTimeout(t);
    }, [query]);

    // Auto-focus search
    React.useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const filtered = React.useMemo(() => {
        if (!deferredQuery) return friends;
        const q = deferredQuery.toLowerCase();
        return friends.filter(u => {
            const name = (u.globalName ?? u.username).toLowerCase();
            return name.includes(q) || u.username.toLowerCase().includes(q);
        });
    }, [friends, deferredQuery]);

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setKeyboardIndex(i => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setKeyboardIndex(i => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && keyboardIndex >= 0) {
            e.preventDefault();
            const user = filtered[keyboardIndex];
            if (user) onSelect(user);
        }
    }

    // Reset keyboard index on filter change
    React.useEffect(() => setKeyboardIndex(-1), [deferredQuery]);

    const getExistingRel = (userId: string): ResolvedRelationship | null => {
        if (!myId) return null;
        return getRelationshipWith(userId);
    };

    // Section: friends with existing relationships come first
    const withRel    = filtered.filter(u => getExistingRel(u.id) !== null);
    const withoutRel = filtered.filter(u => getExistingRel(u.id) === null);
    const sorted     = [...withRel, ...withoutRel];

    return (
        <div onKeyDown={handleKeyDown}>
            <div className="hl-search-wrap">
                <SearchIcon className="hl-search-icon" size={14} />
                <input
                    ref={inputRef}
                    className="hl-search"
                    placeholder="Search friends…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    aria-label="Search friends"
                    autoComplete="off"
                    spellCheck={false}
                />
            </div>

            <div className="hl-person-list" ref={listRef} role="listbox" aria-label="Friends">
                {loading ? (
                    Array.from({ length: 5 }, (_, i) => <PersonCardSkeleton key={i} index={i} />)
                ) : sorted.length === 0 ? (
                    <div className="hl-empty">
                        <div className="hl-empty-icon-badge">
                            <SearchIcon size={20} color="var(--text-muted)" />
                        </div>
                        <p className="hl-empty-title">No friends found</p>
                        <p className="hl-empty-text">
                            {query ? "Try a different search term." : "You don't appear to have any Discord friends yet."}
                        </p>
                    </div>
                ) : (
                    <>
                        {withRel.length > 0 && (
                            <>
                                <div className="hl-section-header">Existing Relationships</div>
                                {withRel.map((u, i) => (
                                    <PersonCard
                                        key={u.id}
                                        user={u}
                                        existingRelationship={getExistingRel(u.id)}
                                        isKeyboardFocused={keyboardIndex === i}
                                        onClick={() => onSelect(u)}
                                        animationDelay={i * 40}
                                    />
                                ))}
                                {withoutRel.length > 0 && <div className="hl-section-header">Friends</div>}
                            </>
                        )}
                        {withoutRel.map((u, i) => (
                            <PersonCard
                                key={u.id}
                                user={u}
                                existingRelationship={null}
                                isKeyboardFocused={keyboardIndex === withRel.length + i}
                                onClick={() => onSelect(u)}
                                animationDelay={(withRel.length + i) * 40}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
