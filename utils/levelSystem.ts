export interface RelationshipLevelInfo {
    level: number;
    title: string;
    iconType: string;
    color: string;
    currentXp: number;
    nextLevelXp: number;
    progressPercent: number;
    daysTogether: number;
    streakDays: number;
}

export function calculateRelationshipLevel(daysTogether: number = 1): RelationshipLevelInfo {
    const days = Math.max(1, daysTogether);

    let level = 1;
    let title = "First Sparks";
    let iconType = "sparkles";
    let color = "#38bdf8";
    let minDays = 0;
    let maxDays = 7;

    if (days >= 365) {
        level = Math.min(100, 50 + Math.floor((days - 365) / 10));
        title = "Mythic Immortals";
        iconType = "star";
        color = "#8547c6"; // Discord Nitro Purple
        minDays = 365;
        maxDays = 365 + 365;
    } else if (days >= 180) {
        level = 25 + Math.floor(((days - 180) / (365 - 180)) * 25);
        title = "Eternal Royalty";
        iconType = "crown";
        color = "#f1c40f"; // Discord Gold
        minDays = 180;
        maxDays = 365;
    } else if (days >= 90) {
        level = 15 + Math.floor(((days - 90) / (180 - 90)) * 10);
        title = "Soul Bond";
        iconType = "infinity";
        color = "#5865f2"; // Discord Blurple
        minDays = 90;
        maxDays = 180;
    } else if (days >= 30) {
        level = 10 + Math.floor(((days - 30) / (90 - 30)) * 5);
        title = "Inseparable";
        iconType = "ring";
        color = "#eb459e"; // Discord Fuchsia
        minDays = 30;
        maxDays = 90;
    } else if (days >= 7) {
        level = 5 + Math.floor(((days - 7) / (30 - 7)) * 5);
        title = "Sweethearts";
        iconType = "heart";
        color = "#57f287"; // Discord Green
        minDays = 7;
        maxDays = 30;
    } else {
        level = Math.max(1, Math.floor((days / 7) * 4) + 1);
        title = "First Sparks";
        iconType = "sparkles";
        color = "#5865f2"; // Discord Blurple
        minDays = 0;
        maxDays = 7;
    }

    const currentXp = days - minDays;
    const nextLevelXp = Math.max(1, maxDays - minDays);
    const progressPercent = Math.min(100, Math.max(5, Math.round((currentXp / nextLevelXp) * 100)));

    return {
        level,
        title,
        iconType,
        color,
        currentXp,
        nextLevelXp,
        progressPercent,
        daysTogether: days,
        streakDays: days,
    };
}
