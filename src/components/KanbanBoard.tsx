
import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
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
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useDroppable,
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

const DroppableCell: React.FC<{
  columnId: string;
  swimLaneId: string;
  items: KanbanItem[];
  isCollapsed: boolean;
  columnWidth: string;
  children: React.ReactNode;
}> = ({ columnId, swimLaneId, items, isCollapsed, columnWidth, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${columnId}-${swimLaneId}`,
    data: {
      column: columnId,
      swimLane: swimLaneId,
    },
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        width: columnWidth,
        p: isCollapsed ? 1 : 2,
        minHeight: 200,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: isOver ? 'action.hover' : 'grey.50',
        transition: 'all 0.3s',
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
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

  // Calculate column widths
  const swimLaneWidth = 200;
  const collapsedColumnWidth = 64;
  const expandedColumns = columns.filter(col => !collapsedColumns.has(col.id));
  const collapsedColumnCount = columns.length - expandedColumns.length;
  const availableWidth = `calc(100% - ${swimLaneWidth}px - ${collapsedColumnCount * collapsedColumnWidth}px)`;
  const expandedColumnWidth = expandedColumns.length > 0 ? `calc(${availableWidth} / ${expandedColumns.length})` : '0px';

  const getColumnWidth = (columnId: string) => {
    return collapsedColumns.has(columnId) ? `${collapsedColumnWidth}px` : expandedColumnWidth;
  };

  // Create a single sortable context for all items to enable cross-column dragging
  const allItemIds = useMemo(() => items.map(item => item.id), [items]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('Drag end event:', { active: active.id, over: over?.id, overData: over?.data?.current });
    
    if (!over) {
      console.log('No drop target found');
      return;
    }

    const draggedItem = findItemById(active.id as string);
    if (!draggedItem) {
      console.log('Dragged item not found:', active.id);
      return;
    }

    // Get target location from the droppable's data
    const overData = over.data.current;
    const targetColumn = overData?.column;
    const targetSwimLane = overData?.swimLane;

    if (!targetColumn || !targetSwimLane) {
      console.log('No valid drop target found', { targetColumn, targetSwimLane, overData });
      return;
    }

    // Don't do anything if dropping in the same location
    if (draggedItem.column === targetColumn && draggedItem.swimLane === targetSwimLane) {
      console.log('Dropped in same location, no action needed');
      return;
    }

    console.log(`Attempting to move item ${draggedItem.id} from ${draggedItem.column}/${draggedItem.swimLane} to ${targetColumn}/${targetSwimLane}`);

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
        <SortableContext items={allItemIds} strategy={verticalListSortingStrategy}>
          <Paper sx={{ overflow: 'hidden' }}>
            {/* Column Headers */}
            <Box sx={{ display: 'flex', bgcolor: 'primary.light', borderBottom: 2, borderColor: 'primary.main' }}>
              <Box sx={{ width: `${swimLaneWidth}px`, p: 2, borderRight: 1, borderColor: 'divider', flexShrink: 0 }}>
                <Typography variant="h6" fontWeight="bold">Swim Lanes</Typography>
              </Box>
              {columns.map((column) => (
                <Box
                  key={column.id}
                  sx={{
                    width: getColumnWidth(column.id),
                    p: 2,
                    borderRight: 1,
                    borderColor: 'divider',
                    bgcolor: column.color || 'primary.light',
                    transition: 'width 0.3s',
                    flexShrink: 0,
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
                        width: `${swimLaneWidth}px`,
                        p: 2,
                        borderRight: 1,
                        borderColor: 'divider',
                        bgcolor: swimLane.color || 'warning.light',
                        cursor: 'pointer',
                        flexShrink: 0,
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
                      const isColumnCollapsed = collapsedColumns.has(column.id);
                      const isSwimLaneCollapsed = collapsedSwimLanes.has(swimLane.id);
                      
                      return (
                        <DroppableCell
                          key={`${swimLane.id}-${column.id}`}
                          columnId={column.id}
                          swimLaneId={swimLane.id}
                          items={cellItems}
                          isCollapsed={isColumnCollapsed}
                          columnWidth={getColumnWidth(column.id)}
                        >
                          {!isSwimLaneCollapsed && !isColumnCollapsed && (
                            <Box sx={{ height: '100%', maxHeight: 400, overflow: 'auto' }}>
                              {cellItems.length > 0 && (
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                  {cellItems.length} item{cellItems.length !== 1 ? 's' : ''}
                                </Typography>
                              )}
                              {cellItems.map((item) => (
                                <DraggableKanbanItem key={item.id} item={item} />
                              ))}
                            </Box>
                          )}
                        </DroppableCell>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </SortableContext>
      </DndContext>
    </Container>
  );
};

export default KanbanBoard;
