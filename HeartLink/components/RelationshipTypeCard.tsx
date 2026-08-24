import { React } from "@webpack/common";
import { RelationshipTypeDefinition } from "../types";
import { RelationshipIcon, CheckIcon, PencilIcon } from "../icons";
import { ItemCustomization } from "./CustomizationEditor";

interface RelationshipTypeCardProps {
    type: RelationshipTypeDefinition;
    isSelected: boolean;
    customization?: ItemCustomization;
    onSelect: () => void;
    onCustomize?: (e: React.MouseEvent) => void;
    animationDelay?: number;
}

export function RelationshipTypeCard({
    type,
    isSelected,
    customization,
    onSelect,
    onCustomize,
    animationDelay = 0,
}: RelationshipTypeCardProps) {
    const iconType    = customization?.customIcon    || type.id;
    const rawColor    = customization?.customColor   || type.iconColor;
    const [badgeColor, customIconColor] = (rawColor || "").split(":");
    const iconColor   = customIconColor || badgeColor || type.iconColor;
    const label       = customization?.theirRole     || type.label;
    const description = customization?.customDescription || type.description;

    return (
        <div
            className={`hl-type-card ${isSelected ? "hl-type-card--selected" : ""}`}
            onClick={onSelect}
            role="checkbox"
            aria-checked={isSelected}
            tabIndex={0}
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <div className="hl-type-icon-badge" style={{ backgroundColor: `${badgeColor || type.iconColor}22`, color: iconColor }}>
                <RelationshipIcon type={iconType} size={18} customColor={iconColor} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p className="hl-type-name" style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
                        {label}
                    </p>
                    {isSelected && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {onCustomize && (
                                <button
                                    className="hl-type-edit-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCustomize(e);
                                    }}
                                    title="Customize icon, color & description"
                                >
                                    <PencilIcon size={11} />
                                </button>
                            )}
                            <span className="hl-type-check">
                                <CheckIcon size={11} />
                            </span>
                        </div>
                    )}
                </div>
                <p
                    className="hl-type-desc"
                    style={{
                        margin: "2px 0 0",
                        fontSize: 11,
                        color: "var(--text-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {description}
                </p>
            </div>
        </div>
    );
}
