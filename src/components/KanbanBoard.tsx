
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Chip,
  Card,
  CardContent,
  Grid,
  Divider,
  Stack,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  KeyboardArrowRight,
  KeyboardArrowDown,
} from '@mui/icons-material';

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
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  const renderKanbanItem = (item: KanbanItem) => (
    <Card
      key={item.id}
      sx={{
        mb: 1,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 3,
        },
        borderLeft: `4px solid ${getPriorityColor(item.priority)}`,
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          {item.title}
        </Typography>
        {item.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {item.description}
          </Typography>
        )}
        <Stack direction="row" spacing={1} alignItems="center">
          {item.priority && (
            <Chip
              label={item.priority.toUpperCase()}
              size="small"
              sx={{
                backgroundColor: getPriorityColor(item.priority),
                color: 'white',
                fontSize: '0.7rem',
                height: '20px',
              }}
            />
          )}
          {item.assignee && (
            <Chip
              label={item.assignee}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: '20px' }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Kanban Board
      </Typography>
      
      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        {/* Column Headers */}
        <Box sx={{ display: 'flex', backgroundColor: '#e3f2fd', borderBottom: '2px solid #1976d2' }}>
          <Box sx={{ width: '200px', p: 2, borderRight: '1px solid #ddd' }}>
            <Typography variant="h6" fontWeight="bold">
              Swim Lanes
            </Typography>
          </Box>
          {columns.map((column) => (
            <Box
              key={column.id}
              sx={{
                flex: collapsedColumns.has(column.id) ? '0 0 60px' : 1,
                p: 2,
                borderRight: '1px solid #ddd',
                backgroundColor: column.color || '#e3f2fd',
                transition: 'flex 0.3s ease',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() => toggleColumn(column.id)}
                  sx={{ p: 0.5 }}
                >
                  {collapsedColumns.has(column.id) ? (
                    <KeyboardArrowRight />
                  ) : (
                    <KeyboardArrowDown />
                  )}
                </IconButton>
                {!collapsedColumns.has(column.id) && (
                  <Typography variant="h6" fontWeight="bold">
                    {column.title}
                  </Typography>
                )}
              </Stack>
            </Box>
          ))}
        </Box>

        {/* Swim Lanes and Items */}
        {swimLanes.map((swimLane) => (
          <Box key={swimLane.id}>
            {/* Swim Lane Header */}
            <Box
              sx={{
                display: 'flex',
                backgroundColor: swimLane.color || '#fff3e0',
                borderBottom: '1px solid #ddd',
              }}
            >
              <Box
                sx={{
                  width: '200px',
                  p: 2,
                  borderRight: '1px solid #ddd',
                  cursor: 'pointer',
                }}
                onClick={() => toggleSwimLane(swimLane.id)}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton size="small" sx={{ p: 0.5 }}>
                    {collapsedSwimLanes.has(swimLane.id) ? (
                      <ExpandMore />
                    ) : (
                      <ExpandLess />
                    )}
                  </IconButton>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {swimLane.title}
                  </Typography>
                </Stack>
              </Box>
              
              {/* Column cells for this swim lane */}
              {columns.map((column) => (
                <Box
                  key={`${swimLane.id}-${column.id}`}
                  sx={{
                    flex: collapsedColumns.has(column.id) ? '0 0 60px' : 1,
                    p: collapsedColumns.has(column.id) ? 1 : 2,
                    borderRight: '1px solid #ddd',
                    minHeight: collapsedSwimLanes.has(swimLane.id) ? '60px' : '200px',
                    backgroundColor: '#fafafa',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Collapse in={!collapsedSwimLanes.has(swimLane.id)}>
                    {!collapsedColumns.has(column.id) && (
                      <Box sx={{ minHeight: '150px' }}>
                        {getItemsForCell(column.id, swimLane.id).map(renderKanbanItem)}
                      </Box>
                    )}
                  </Collapse>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

export default KanbanBoard;
