import React from "react";
import { DEFAULT_TAG_COLORS } from "@taking-note/shared";

interface TagColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const TagColorPicker: React.FC<TagColorPickerProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {DEFAULT_TAG_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-7 h-7 rounded-full border-2 transition-transform ${
              value.toLowerCase() === color.toLowerCase()
                ? "border-black scale-110 shadow-sm"
                : "border-transparent hover:scale-105"
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-zinc-200 cursor-pointer p-0.5 bg-white"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          pattern="^#[0-9A-Fa-f]{6}$"
          className="flex-1 px-3 py-1.5 text-xs font-mono border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>
    </div>
  );
};
