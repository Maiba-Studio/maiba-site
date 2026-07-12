"use client";

import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import type { SocialLink } from "@/lib/data";
import { SOCIAL_ICON_PRESETS, SocialIconRenderer } from "@/lib/social-icons";

export default function SocialLinksEditor({
  links,
  onChange,
}: {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}) {
  const update = (index: number, patch: Partial<SocialLink>) => {
    const next = [...links];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const add = () => {
    onChange([
      ...links,
      { label: "", href: "", icon: "", iconId: "website", showLabel: true },
    ]);
  };

  const remove = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= links.length) return;
    const next = [...links];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-3">
        <label className="text-xs tracking-widest uppercase text-malamaya">
          Social / Contact Links
        </label>
        <button
          type="button"
          onClick={add}
          className="text-xs text-maiba-red hover:text-maiba-red/80 transition-colors tracking-widest uppercase"
        >
          + Add Link
        </button>
      </div>

      <div className="space-y-3">
        {links.map((link, i) => (
          <div key={i} className="border border-malamaya-border/20 rounded-sm overflow-hidden min-w-0">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/[0.02] border-b border-malamaya-border/10">
              <GripVertical className="w-3.5 h-3.5 text-malamaya-border/60 flex-shrink-0" strokeWidth={1.5} />
              <div className="w-6 h-6 flex items-center justify-center text-foreground flex-shrink-0">
                <SocialIconRenderer
                  iconId={link.iconId || ""}
                  customIconUrl={link.icon}
                  size={14}
                />
              </div>
              <span className="text-xs text-malamaya-light truncate flex-1 min-w-0">
                {link.label || "Untitled link"}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  className="w-6 h-6 flex items-center justify-center text-malamaya hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title="Move up"
                >
                  <ChevronUp className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === links.length - 1}
                  className="w-6 h-6 flex items-center justify-center text-malamaya hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >
                  <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="text-xs tracking-widest uppercase text-malamaya mb-2 block">
                    Label
                  </label>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => update(i, { label: e.target.value })}
                    className="admin-input"
                    placeholder="Display name"
                  />
                </div>
                <div className="min-w-0">
                  <label className="text-xs tracking-widest uppercase text-malamaya mb-2 block">
                    URL
                  </label>
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => update(i, { href: e.target.value })}
                    className="admin-input"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label className="text-xs tracking-widest uppercase text-malamaya mb-2 block">
                  Icon
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center border border-malamaya-border/30 rounded-sm bg-midnight/50 flex-shrink-0 text-foreground">
                    <SocialIconRenderer
                      iconId={link.iconId || ""}
                      customIconUrl={link.icon}
                      size={18}
                    />
                  </div>
                  <select
                    value={link.iconId || "custom"}
                    onChange={(e) => update(i, { iconId: e.target.value })}
                    className="admin-input flex-1 min-w-0"
                  >
                    {SOCIAL_ICON_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                    <option value="custom">Custom Image URL</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-malamaya-light">
                <input
                  type="checkbox"
                  checked={link.showLabel !== false}
                  onChange={(e) => update(i, { showLabel: e.target.checked })}
                  className="accent-maiba-red"
                />
                Show label next to icon on the public site
              </label>

              {(link.iconId === "custom" || (!link.iconId && link.icon)) && (
                <div className="min-w-0">
                  <label className="text-xs tracking-widest uppercase text-malamaya mb-2 block">
                    Custom Icon URL
                  </label>
                  <input
                    type="text"
                    value={link.icon}
                    onChange={(e) => update(i, { icon: e.target.value })}
                    className="admin-input"
                    placeholder="https://example.com/icon.svg"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => remove(i)}
                className="text-[10px] text-maiba-red/60 hover:text-maiba-red tracking-widest uppercase transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {links.length === 0 && (
          <p className="text-malamaya-border text-sm">No links yet.</p>
        )}
      </div>
    </div>
  );
}
