import { Relationship } from "../types";

const SUPABASE_URL = "https://jlrukywcliudfjpjnhjk.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpscnVreXdjbGl1ZGZqcGpuaGprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyNjUyNzIsImV4cCI6MjEwMjg0MTI3Mn0.4eTwqFtpev_Nj_hFaoih2oek9Ho2dn95AJT-yrzztpA";

try {
    (window as any).VencordNative?.csp?.requestAddOverride?.(
        "https://jlrukywcliudfjpjnhjk.supabase.co",
        ["connect-src", "img-src"],
        "HeartLink"
    );
} catch {}

async function restRequest<T = any>(
    endpoint: string,
    options: {
        method?: string;
        body?: any;
        headers?: Record<string, string>;
    } = {}
): Promise<T> {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers: Record<string, string> = {
        "apikey": SUPABASE_ANON,
        "Authorization": `Bearer ${SUPABASE_ANON}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
        ...options.headers,
    };

    const res = await fetch(url, {
        method: options.method ?? "GET",
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
        let errMessage = `Request failed (${res.status})`;
        try {
            const errData = await res.json();
            errMessage = errData.message || errData.msg || errData.error_description || errData.details || errMessage;
        } catch {
            try {
                const text = await res.text();
                if (text) errMessage = text;
            } catch {}
        }
        throw new Error(errMessage);
    }

    if (res.status === 204) return null as any;
    return await res.json();
}

export async function fetchMyRelationships(myDiscordId: string): Promise<Relationship[]> {
    try {
        const data = await restRequest<Relationship[]>(
            `relationships?or=(status.eq.accepted,user_a.eq.${myDiscordId},user_b.eq.${myDiscordId})&order=updated_at.desc&limit=500`
        );
        return data ?? [];
    } catch (e: any) {
        console.error("[HeartLink] fetch error:", e);
        return [];
    }
}

export async function sendRelationshipRequest(params: {
    user_a: string;
    user_b: string;
    type: string;
    reciprocal_type: string;
    custom_label?: string;
    custom_icon?: string;
    custom_reciprocal?: string;
}): Promise<Relationship> {
    const rows = await restRequest<Relationship[]>("relationships", {
        method: "POST",
        body: {
            user_a: params.user_a,
            user_b: params.user_b,
            type: params.type,
            reciprocal_type: params.reciprocal_type,
            status: "pending",
            custom_label: params.custom_label ?? null,
            custom_icon: params.custom_icon ?? null,
            custom_reciprocal: params.custom_reciprocal ?? null,
            icon_a: params.custom_icon ?? null,
            note_a: params.custom_reciprocal ?? null,
        },
    });

    if (!rows || rows.length === 0) {
        throw new Error("Failed to create relationship request");
    }
    return rows[0];
}

export async function acceptRelationshipRequest(relationshipId: string): Promise<Relationship> {
    const rows = await restRequest<Relationship[]>(
        `relationships?id=eq.${relationshipId}&status=eq.pending`,
        {
            method: "PATCH",
            body: {
                status: "accepted",
                updated_at: new Date().toISOString(),
            },
        }
    );

    if (!rows || rows.length === 0) {
        throw new Error("Failed to accept relationship");
    }
    return rows[0];
}

export async function updateRelationshipCustomization(
    relationshipId: string,
    params: {
        custom_icon?: string | null;
        custom_label?: string | null;
        custom_reciprocal?: string | null;
        icon_a?: string | null;
        color_a?: string | null;
        note_a?: string | null;
        icon_b?: string | null;
        color_b?: string | null;
        note_b?: string | null;
        created_at?: string | null;
    }
): Promise<Relationship> {
    const rows = await restRequest<Relationship[]>(
        `relationships?id=eq.${relationshipId}`,
        {
            method: "PATCH",
            body: {
                ...params,
                updated_at: new Date().toISOString(),
            },
        }
    );

    if (!rows || rows.length === 0) {
        throw new Error("Failed to update customization");
    }
    return rows[0];
}

export async function deleteRelationship(relationshipId: string): Promise<void> {
    await restRequest(`relationships?id=eq.${relationshipId}`, {
        method: "DELETE",
    });
}

export async function sendLovePoke(relationshipId: string, senderId: string): Promise<void> {
    try {
        const pokeTime = Date.now();
        await restRequest(`relationships?id=eq.${relationshipId}`, {
            method: "PATCH",
            body: {
                custom_icon: `poke:${senderId}:${pokeTime}`,
                updated_at: new Date().toISOString(),
            },
        });
    } catch (e) {
        console.error("[HeartLink] sendLovePoke error:", e);
    }
}
