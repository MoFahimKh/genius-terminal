"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { TrendingTokensStrip } from "@/components/common/TrendingTokensStrip";
import { DragHandle } from "@/components/common/DragHandle";
import { RightSidebar } from "@/components/sidebar/RightSidebar";
import { TokenStats } from "@/components/stats/TokenStats";
import { TableSection } from "@/components/tables/TableSection";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useVerticalSplit } from "@/hooks/useVerticalSplit";
import { TokenEventsProvider } from "@/context/TokenEventsContext";
import { CollapseToggle } from "./common/CollapseToggle";

const SIDEBAR_WIDTH = 365;

type TerminalViewProps = {
  address?: string;
  networkId?: number;
};

export const TerminalView = ({ address, networkId }: TerminalViewProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const { containerRef, topHeightPercent, isDragging, handleResizeStart } =
    useVerticalSplit();

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-y-auto text-white md:overflow-hidden">
      <TrendingTokensStrip />
      <TokenEventsProvider address={address} networkId={networkId}>
        <div className="flex h-full min-h-0 w-full flex-1 flex-col md:flex-row">
          <div
            className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto md:overflow-hidden"
          >
            <div
              ref={containerRef}
              className="grid h-full w-full flex-1 min-w-0"
              style={{
                gridTemplateColumns: "1fr",
                gridTemplateRows: `minmax(0, ${topHeightPercent}%) minmax(0, ${100 - topHeightPercent}%)`,
                gridTemplateAreas: '"stats" "table"',
                transition: isDragging
                  ? "none"
                  : "grid-template-rows 0.1s ease",
              }}
            >
              <div
                className="relative h-full min-h-0 w-full min-w-0"
                style={{
                  gridArea: "stats",
                  pointerEvents: isDragging ? "none" : "auto",
                }}
              >
                <TokenStats />
                <DragHandle onMouseDown={handleResizeStart} />
              </div>
              <div
                className="invisible-scroll h-full min-h-0 w-full min-w-0"
                style={{
                  gridArea: "table",
                  pointerEvents: isDragging ? "none" : "auto",
                }}
              >
                <TableSection />
              </div>
            </div>
            {isDragging && (
              <div className="fixed inset-0 z-[9999] cursor-row-resize bg-transparent" />
            )}
            {isMobile && (
              <div className="border-t border-white/10 pb-4 pt-3">
                <div className="flex justify-center">
                  <CollapseToggle.vertical
                    isCollapsed={isSidebarCollapsed}
                    onClick={toggleSidebar}
                  />
                </div>
                {!isSidebarCollapsed && (
                  <div className="mt-3">
                    <RightSidebar />
                  </div>
                )}
              </div>
            )}
          </div>

          {!isMobile && (
            <motion.div
              className="hidden h-full overflow-hidden md:block"
              initial={false}
              animate={{
                width: isSidebarCollapsed ? 0 : SIDEBAR_WIDTH,
                opacity: isSidebarCollapsed ? 0 : 1,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ flexShrink: 0 }}
              aria-hidden={isSidebarCollapsed}
            >
              <div className={`${isSidebarCollapsed ? "pointer-events-none" : ""} h-full`}>
                <RightSidebar />
              </div>
            </motion.div>
          )}
        </div>
      </TokenEventsProvider>

      {!isMobile && (
        <div
          className="absolute top-1/2 hidden -translate-y-1/2 md:block"
          style={{ right: isSidebarCollapsed ? 16 : SIDEBAR_WIDTH - 14 }}
        >
          <CollapseToggle.horizontal
            isCollapsed={isSidebarCollapsed}
            onClick={toggleSidebar}
          />
        </div>
      )}
    </div>
  );
};
