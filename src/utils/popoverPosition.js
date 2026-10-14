export function getPopoverPosition(anchor, panel, viewport, align = "start") {
  const margin = 12;
  const gap = 8;
  const below = Math.max(0, viewport.height - anchor.bottom - gap - margin);
  const above = Math.max(0, anchor.top - gap - margin);
  const opensAbove = panel.height > below && above > below;
  const maxHeight = opensAbove ? above : below;
  const height = Math.min(panel.height, maxHeight);
  const preferredTop = opensAbove ? anchor.top - gap - height : anchor.bottom + gap;
  const preferredLeft = align === "end" ? anchor.right - panel.width : anchor.left;

  return {
    top: Math.max(margin, Math.min(preferredTop, viewport.height - margin - height)),
    left: Math.max(margin, Math.min(preferredLeft, viewport.width - margin - panel.width)),
    maxHeight,
  };
}
