export type RelationshipStatus = "pending" | "accepted";
export type RelationshipCategory = "romantic" | "friendship" | "custom";

export interface RelationshipTypeDefinition {
    id: string;
    label: string;
    description: string;
    reciprocal: string;
    reciprocalLabel: string;
    iconColor: string;
    category: RelationshipCategory;
}

export const ROMANTIC_TYPES = ["wife", "husband", "girlfriend", "boyfriend"];

export const RELATIONSHIP_TYPES: RelationshipTypeDefinition[] = [
    {
        id: "wife",
        label: "Wife",
        description: "Set this person as your wife",
        reciprocal: "husband",
        reciprocalLabel: "Husband",
        iconColor: "#f59e0b",
        category: "romantic",
    },
    {
        id: "husband",
        label: "Husband",
        description: "Set this person as your husband",
        reciprocal: "wife",
        reciprocalLabel: "Wife",
        iconColor: "#eab308",
        category: "romantic",
    },
    {
        id: "girlfriend",
        label: "Girlfriend",
        description: "Set this person as your girlfriend",
        reciprocal: "boyfriend",
        reciprocalLabel: "Boyfriend",
        iconColor: "#f43f5e",
        category: "romantic",
    },
    {
        id: "boyfriend",
        label: "Boyfriend",
        description: "Set this person as your boyfriend",
        reciprocal: "girlfriend",
        reciprocalLabel: "Girlfriend",
        iconColor: "#38bdf8",
        category: "romantic",
    },
    {
        id: "bestfriend",
        label: "Best Friend",
        description: "Set this person as your best friend",
        reciprocal: "bestfriend",
        reciprocalLabel: "Best Friend",
        iconColor: "#fbbf24",
        category: "friendship",
    },
    {
        id: "duo",
        label: "Gaming Duo",
        description: "Set this person as your gaming duo partner",
        reciprocal: "duo",
        reciprocalLabel: "Gaming Duo",
        iconColor: "#10b981",
        category: "friendship",
    },
    {
        id: "friend",
        label: "Friend",
        description: "Set this person as your friend",
        reciprocal: "friend",
        reciprocalLabel: "Friend",
        iconColor: "#10b981",
        category: "friendship",
    },
    {
        id: "custom",
        label: "Custom",
        description: "Define a custom relationship label",
        reciprocal: "custom",
        reciprocalLabel: "Custom",
        iconColor: "#a855f7",
        category: "custom",
    },
];

export interface Relationship {
    id: string;
    user_a: string;
    user_b: string;
    type: string;
    reciprocal_type: string;
    status: RelationshipStatus;
    custom_label: string | null;
    custom_icon: string | null;
    custom_reciprocal: string | null;
    icon_a?: string | null;
    color_a?: string | null;
    note_a?: string | null;
    icon_b?: string | null;
    color_b?: string | null;
    note_b?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface ResolvedRelationship {
    raw: Relationship;
    otherUserId: string;
    theirLabel: string;
    myLabel: string;
    icon: string;
    color: string;
    iconColor?: string;
    note: string;
    hoverText: string;
    subtext: string;
    iAmRequester: boolean;
    status: RelationshipStatus;
    daysTogether?: number;
    theme?: string;
    animation?: string;
    glowSpread?: number;
    glowIntensity?: number;
    glowColor?: string;
    opacity?: number;
    saturation?: number;
    brightness?: number;
}

export interface DiscordUser {
    id: string;
    username: string;
    discriminator?: string;
    globalName?: string;
    avatar?: string;
    bot?: boolean;
}
