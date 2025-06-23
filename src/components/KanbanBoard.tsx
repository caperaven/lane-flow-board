
import React, { useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Grid,
  Container,
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  ExpandLess,
} from '@mui/icons-material';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

export interface BeforeDropEvent {
  itemId: string;
  sourceColumn: string;
  sourceSwimLane: string;
  targetColumn: string;
  targetSwimLane: string;
  canDrop: boolean;
}

export interface DropEvent {
  itemId: string;
  sourceColumn: string;
  sourceSwimLane: string;
  targetColumn: string;
  targetSwimLane: string;
  item: KanbanItem;
}

interface KanbanBoardProps {
  items: KanbanItem[];
  columns: KanbanColumn[];
  swimLanes: KanbanSwimLane[];
  onItemMove?: (itemId: string, newColumn: string, newSwimLane: string) => void;
  onBeforeDrop?: (event: BeforeDropEvent) => boolean;
  onDrop?: (event: DropEvent) => void;
}

const DraggableKanbanItem: React.FC<{ item: KanbanItem }> = ({ item }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        p: 2,
        mb: 1,
        cursor: 'grab',
        borderLeft: 4,
        borderLeftColor: 
          item.priority === 'high' ? 'error.main' : 
          item.priority === 'medium' ? 'warning.main' : 
          'success.main',
        '&:hover': {
          boxShadow: 2,
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
        {item.title}
      </Typography>
      {item.description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {item.description}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {item.priority && (
          <Chip
            label={item.priority.toUpperCase()}
            size="small"
            color={getPriorityColor(item.priority) as any}
          />
        )}
        {item.assignee && (
          <Chip
            label={item.assignee}
            size="small"
            variant="outlined"
          />
        )}
      </Box>
    </Paper>
  );
};

const VirtualizedItemList = ({ cellItems }: { cellItems: KanbanItem[] }) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: cellItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  if (cellItems.length === 0) return null;

  return (
    <SortableContext items={cellItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
      <Box
        ref={parentRef}
        sx={{
          height: 400,
          overflow: 'auto',
          contain: 'strict',
        }}
      >
        <Box
          sx={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => (
            <Box
              key={virtualItem.key}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
                p: 1,
              }}
            >
              <DraggableKanbanItem item={cellItems[virtualItem.index]} />
            </Box>
          ))}
        </Box>
      </Box>
    </SortableContext>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  items,
  columns,
  swimLanes,
  onItemMove,
  onBeforeDrop,
  onDrop,
}) => {
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());
  const [collapsedSwimLanes, setCollapsedSwimLanes] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

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

  const findItemById = (id: string) => {
    return items.find(item => item.id === id);
  };

  const getDropZoneFromCoordinates = (x: number, y: number) => {
    // This is a simplified approach - in a real implementation you'd want more sophisticated drop zone detection
    const element = document.elementFromPoint(x, y);
    const dropZone = element?.closest('[data-drop-zone]');
    if (dropZone) {
      const column = dropZone.getAttribute('data-column');
      const swimLane = dropZone.getAttribute('data-swim-lane');
      return { column, swimLane };
    }
    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const draggedItem = findItemById(active.id as string);
    if (!draggedItem) return;

    // Get target location from the over element's data attributes
    const overElement = over.data.current;
    const targetColumn = overElement?.sortable?.containerId?.split('-')[0];
    const targetSwimLane = overElement?.sortable?.containerId?.split('-')[1];

    if (!targetColumn || !targetSwimLane) return;

    // Create before drop event
    const beforeDropEvent: BeforeDropEvent = {
      itemId: draggedItem.id,
      sourceColumn: draggedItem.column,
      sourceSwimLane: draggedItem.swimLane,
      targetColumn,
      targetSwimLane,
      canDrop: true,
    };

    // Check if drop is allowed
    const canDrop = onBeforeDrop ? onBeforeDrop(beforeDropEvent) : true;
    
    if (!canDrop) {
      console.log('Drop not allowed');
      return;
    }

    // If drop is allowed, proceed with the drop
    const dropEvent: DropEvent = {
      itemId: draggedItem.id,
      sourceColumn: draggedItem.column,
      sourceSwimLane: draggedItem.swimLane,
      targetColumn,
      targetSwimLane,
      item: draggedItem,
    };

    // Call the drop event handler
    if (onDrop) {
      onDrop(dropEvent);
    }

    // Call the legacy move handler for backwards compatibility
    if (onItemMove) {
      onItemMove(draggedItem.id, targetColumn, targetSwimLane);
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Typography variant="h3" component="h1" gutterBottom color="primary" fontWeight="bold">
        Kanban Board ({items.length} items)
      </Typography>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <Paper sx={{ overflow: 'hidden' }}>
          {/* Column Headers */}
          <Box sx={{ display: 'flex', bgcolor: 'primary.light', borderBottom: 2, borderColor: 'primary.main' }}>
            <Box sx={{ width: 200, p: 2, borderRight: 1, borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight="bold">Swim Lanes</Typography>
            </Box>
            {columns.map((column) => (
              <Box
                key={column.id}
                sx={{
                  width: collapsedColumns.has(column.id) ? 64 : 'calc((100% - 200px) / ' + columns.length + ')',
                  p: 2,
                  borderRight: 1,
                  borderColor: 'divider',
                  bgcolor: column.color || 'primary.light',
                  transition: 'width 0.3s',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => toggleColumn(column.id)}
                  >
                    {collapsedColumns.has(column.id) ? <ChevronRight /> : <ExpandMore />}
                  </IconButton>
                  {!collapsedColumns.has(column.id) && (
                    <Typography variant="h6" fontWeight="bold">{column.title}</Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Swim Lanes and Items */}
          <Box sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
            {swimLanes.map((swimLane) => (
              <Box key={swimLane.id}>
                <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
                  <Box
                    sx={{
                      width: 200,
                      p: 2,
                      borderRight: 1,
                      borderColor: 'divider',
                      bgcolor: swimLane.color || 'warning.light',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleSwimLane(swimLane.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton size="small">
                        {collapsedSwimLanes.has(swimLane.id) ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                      <Typography variant="subtitle1" fontWeight="bold">{swimLane.title}</Typography>
                    </Box>
                  </Box>
                  
                  {columns.map((column) => {
                    const cellItems = getItemsForCell(column.id, swimLane.id);
                    return (
                      <Box
                        key={`${swimLane.id}-${column.id}`}
                        data-drop-zone
                        data-column={column.id}
                        data-swim-lane={swimLane.id}
                        sx={{
                          width: collapsedColumns.has(column.id) ? 64 : 'calc((100% - 200px) / ' + columns.length + ')',
                          p: collapsedColumns.has(column.id) ? 1 : 2,
                          minHeight: collapsedSwimLanes.has(swimLane.id) ? 64 : 200,
                          borderRight: 1,
                          borderColor: 'divider',
                          bgcolor: 'grey.50',
                          transition: 'all 0.3s',
                        }}
                      >
                        {!collapsedSwimLanes.has(swimLane.id) && !collapsedColumns.has(column.id) && (
                          <Box sx={{ height: '100%' }}>
                            {cellItems.length > 0 && (
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                {cellItems.length} item{cellItems.length !== 1 ? 's' : ''}
                              </Typography>
                            )}
                            <VirtualizedItemList cellItems={cellItems} />
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </DndContext>
    </Container>
  );
};

export default KanbanBoard;
