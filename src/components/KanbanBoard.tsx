import React, { useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';

export interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
  swimLane: string;
  column: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
}

export interface KanbanSwimLane {
  id: string;
  title: string;
  color?: string;
}

interface KanbanBoardProps {
  items: KanbanItem[];
  columns: KanbanColumn[];
  swimLanes: KanbanSwimLane[];
  onItemMove?: (itemId: string, newColumn: string, newSwimLane: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  items,
  columns,
  swimLanes,
  onItemMove,
}) => {
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());
  const [collapsedSwimLanes, setCollapsedSwimLanes] = useState<Set<string>>(new Set());

  const toggleColumn = (columnId: string) => {
    const newCollapsed = new Set(collapsedColumns);
    if (newCollapsed.has(columnId)) {
      newCollapsed.delete(columnId);
    } else {
      newCollapsed.add(columnId);
    }
    setCollapsedColumns(newCollapsed);
  };

  const toggleSwimLane = (swimLaneId: string) => {
    const newCollapsed = new Set(collapsedSwimLanes);
    if (newCollapsed.has(swimLaneId)) {
      newCollapsed.delete(swimLaneId);
    } else {
      newCollapsed.add(swimLaneId);
    }
    setCollapsedSwimLanes(newCollapsed);
  };

  const getItemsForCell = (columnId: string, swimLaneId: string) => {
    return items.filter(item => item.column === columnId && item.swimLane === swimLaneId);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderKanbanItem = (item: KanbanItem) => (
    <Card
      key={item.id}
      className="mb-2 cursor-pointer hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: item.priority === 'high' ? '#ef4444' : item.priority === 'medium' ? '#f97316' : '#22c55e' }}
    >
      <CardContent className="p-3">
        <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
        {item.description && (
          <p className="text-xs text-gray-600 mb-2">{item.description}</p>
        )}
        <div className="flex flex-wrap gap-1">
          {item.priority && (
            <Badge variant="secondary" className={`text-white text-xs ${getPriorityColor(item.priority)}`}>
              {item.priority.toUpperCase()}
            </Badge>
          )}
          {item.assignee && (
            <Badge variant="outline" className="text-xs">
              {item.assignee}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const VirtualizedItemList = ({ cellItems }: { cellItems: KanbanItem[] }) => {
    const parentRef = React.useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
      count: cellItems.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 120, // Estimated height of each item
      overscan: 5,
    });

    if (cellItems.length === 0) return null;

    return (
      <div
        ref={parentRef}
        className="h-[400px] overflow-auto"
        style={{
          contain: 'strict',
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className="p-2">
                {renderKanbanItem(cellItems[virtualItem.index])}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">
        Kanban Board ({items.length} items)
      </h1>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Column Headers */}
        <div className="flex bg-blue-50 border-b-2 border-blue-200">
          <div className="w-48 p-4 border-r border-gray-200">
            <h2 className="text-lg font-semibold">Swim Lanes</h2>
          </div>
          {columns.map((column) => (
            <div
              key={column.id}
              className={`${
                collapsedColumns.has(column.id) ? 'w-16' : 'flex-1'
              } p-4 border-r border-gray-200 transition-all duration-300`}
              style={{ backgroundColor: column.color || '#e3f2fd' }}
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleColumn(column.id)}
                  className="p-1 h-6 w-6"
                >
                  {collapsedColumns.has(column.id) ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                {!collapsedColumns.has(column.id) && (
                  <h3 className="text-lg font-semibold">{column.title}</h3>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Swim Lanes and Items */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          {swimLanes.map((swimLane) => (
            <div key={swimLane.id}>
              {/* Swim Lane Header */}
              <div
                className="flex border-b border-gray-200"
                style={{ backgroundColor: swimLane.color || '#fff3e0' }}
              >
                <div
                  className="w-48 p-4 border-r border-gray-200 cursor-pointer"
                  onClick={() => toggleSwimLane(swimLane.id)}
                >
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6"
                    >
                      {collapsedSwimLanes.has(swimLane.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <h3 className="text-base font-semibold">{swimLane.title}</h3>
                  </div>
                </div>
                
                {/* Column cells for this swim lane */}
                {columns.map((column) => {
                  const cellItems = getItemsForCell(column.id, swimLane.id);
                  return (
                    <div
                      key={`${swimLane.id}-${column.id}`}
                      className={`${
                        collapsedColumns.has(column.id) ? 'w-16' : 'flex-1'
                      } ${
                        collapsedColumns.has(column.id) ? 'p-2' : 'p-4'
                      } ${
                        collapsedSwimLanes.has(swimLane.id) ? 'h-16' : 'min-h-[200px]'
                      } border-r border-gray-200 bg-gray-50 transition-all duration-300`}
                    >
                      {!collapsedSwimLanes.has(swimLane.id) && !collapsedColumns.has(column.id) && (
                        <div className="h-full">
                          {cellItems.length > 0 && (
                            <div className="mb-2 text-xs text-gray-500">
                              {cellItems.length} item{cellItems.length !== 1 ? 's' : ''}
                            </div>
                          )}
                          <VirtualizedItemList cellItems={cellItems} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default KanbanBoard;
