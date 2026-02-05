'use client';

import { useState } from 'react';

import { TrendingTokensStrip } from '@/components/common/TrendingTokensStrip';
import { DragHandle } from '@/components/common/DragHandle';
import { PanelCollapseToggle } from '@/components/common/PanelCollapseToggle';
import { RightSidebar } from '@/components/sidebar/RightSidebar';
import { TokenStats } from '@/components/stats/TokenStats';
import { TableSection } from '@/components/tables/TableSection';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useVerticalSplit } from '@/hooks/useVerticalSplit';

const SIDEBAR_WIDTH = 288;

export const TerminalView = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const { containerRef, topHeightPercent, isDragging, handleResizeStart } = useVerticalSplit();

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-y-auto text-white md:overflow-hidden">
      <TrendingTokensStrip />
      <div className="flex h-full min-h-0 w-full flex-1 flex-col md:flex-row">
        <div className="flex h-full w-full flex-1 flex-col overflow-y-auto md:overflow-hidden">
          <div
            ref={containerRef}
            className="grid h-full w-full flex-1"
            style={{
              gridTemplateColumns: '1fr',
              gridTemplateRows: `minmax(0, ${topHeightPercent}%) minmax(0, ${100 - topHeightPercent}%)`,
              gridTemplateAreas: '"stats" "table"',
              transition: isDragging ? 'none' : 'grid-template-rows 0.1s ease',
            }}>
            <div className="relative h-full min-h-0 w-full" style={{ gridArea: 'stats', pointerEvents: isDragging ? 'none' : 'auto' }}>
              <TokenStats />
              <DragHandle onMouseDown={handleResizeStart} />
            </div>
            <div className="invisible-scroll h-full min-h-0 w-full" style={{ gridArea: 'table', pointerEvents: isDragging ? 'none' : 'auto' }}>
              <TableSection />
            </div>
          </div>
          {isDragging && <div className="fixed inset-0 z-[9999] cursor-row-resize bg-transparent" />}
          {isMobile && (
            <div className="border-t border-white/10 pb-4 pt-3">
              <div className="flex justify-center">
                <PanelCollapseToggle isCollapsed={isSidebarCollapsed} onClick={toggleSidebar} />
              </div>
              {!isSidebarCollapsed && (
                <div className="mt-3">
                  <RightSidebar />
                </div>
              )}
            </div>
          )}
        </div>

        {!isMobile && !isSidebarCollapsed && (
          <div className="ml-auto hidden h-full w-[18rem] flex-shrink-0 overflow-hidden md:block">
            <RightSidebar />
          </div>
        )}
      </div>

      {!isMobile && (
        <div
          className="absolute top-1/2 hidden -translate-y-1/2 md:block"
          style={{ right: isSidebarCollapsed ? 16 : SIDEBAR_WIDTH - 28 }}>
          <PanelCollapseToggle isCollapsed={isSidebarCollapsed} onClick={toggleSidebar} />
        </div>
      )}
    </div>
  );
};
