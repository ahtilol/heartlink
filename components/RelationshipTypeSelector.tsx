import { React } from "@webpack/common";
import { RELATIONSHIP_TYPES, RelationshipTypeDefinition, ROMANTIC_TYPES } from "../types";
import { RelationshipTypeCard } from "./RelationshipTypeCard";
import { CustomizationEditor, ItemCustomization } from "./CustomizationEditor";
import { ArrowLeftIcon } from "../icons";

interface RelationshipTypeSelectorProps {
    selectedTypes: RelationshipTypeDefinition[];
    customizations: Record<string, ItemCustomization>;
    onToggleType: (type: RelationshipTypeDefinition) => void;
    onUpdateCustomization: (typeId: string, custom: ItemCustomization) => void;
}

export function RelationshipTypeSelector({
    selectedTypes,
    customizations,
    onToggleType,
    onUpdateCustomization,
}: RelationshipTypeSelectorProps) {
    const [editingTypeId, setEditingTypeId] = React.useState<string | null>(null);

    const editingDef = RELATIONSHIP_TYPES.find(t => t.id === editingTypeId);

    function handleCardClick(type: RelationshipTypeDefinition) {
        const isSelected = selectedTypes.some(t => t.id === type.id);
        onToggleType(type);
        if (!isSelected && type.id === "custom") {
            setEditingTypeId("custom");
        }
    }

    if (editingTypeId && editingDef) {
        const currentCustom = customizations[editingTypeId] || { typeId: editingTypeId };
        return (
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <button className="hl-btn hl-btn--ghost hl-btn--sm" onClick={() => setEditingTypeId(null)}>
                        <ArrowLeftIcon size={12} /> Back to options
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--header-primary)" }}>
                        Customize {editingDef.label}
                    </span>
                </div>
                <CustomizationEditor
                    typeId={editingDef.id}
                    defaultTargetRole={editingDef.label}
                    defaultSourceRole={editingDef.reciprocalLabel}
                    defaultIcon={editingDef.id}
                    defaultColor={editingDef.iconColor}
                    defaultDescription={editingDef.description}
                    value={currentCustom}
                    onChange={(custom) => onUpdateCustomization(editingDef.id, custom)}
                    onClose={() => setEditingTypeId(null)}
                />
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, padding: "0 2px" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--header-secondary)" }}>
                    Select 1 or more options (max 1 romantic):
                </span>
                {selectedTypes.length > 0 && (
                    <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: "var(--brand-experiment)",
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: 10
                    }}>
                        {selectedTypes.length} selected
                    </span>
                )}
            </div>

            <div className="hl-type-grid">
                {RELATIONSHIP_TYPES.map((type, i) => {
                    const isSelected = selectedTypes.some(t => t.id === type.id);
                    return (
                        <RelationshipTypeCard
                            key={type.id}
                            type={type}
                            isSelected={isSelected}
                            customization={customizations[type.id]}
                            onSelect={() => handleCardClick(type)}
                            onCustomize={() => setEditingTypeId(type.id)}
                            animationDelay={i * 30}
                        />
                    );
                })}
            </div>
        </div>
    );
}
