
import React from 'react';
import KanbanBoard, { KanbanItem, KanbanColumn, KanbanSwimLane } from './KanbanBoard';

const KanbanDemo = () => {
  const columns: KanbanColumn[] = [
    { id: 'backlog', title: 'Backlog', color: '#ffebee' },
    { id: 'todo', title: 'To Do', color: '#e3f2fd' },
    { id: 'inprogress', title: 'In Progress', color: '#fff3e0' },
    { id: 'review', title: 'Review', color: '#f3e5f5' },
    { id: 'done', title: 'Done', color: '#e8f5e8' },
  ];

  const swimLanes: KanbanSwimLane[] = [
    { id: 'frontend', title: 'Frontend Team', color: '#e1f5fe' },
    { id: 'backend', title: 'Backend Team', color: '#fce4ec' },
    { id: 'design', title: 'Design Team', color: '#f9fbe7' },
    { id: 'qa', title: 'QA Team', color: '#fff8e1' },
  ];

  const items: KanbanItem[] = [
    {
      id: '1',
      title: 'User Authentication',
      description: 'Implement login and registration functionality',
      assignee: 'John Doe',
      priority: 'high',
      swimLane: 'frontend',
      column: 'inprogress',
    },
    {
      id: '2',
      title: 'API Endpoints',
      description: 'Create REST API for user management',
      assignee: 'Jane Smith',
      priority: 'high',
      swimLane: 'backend',
      column: 'todo',
    },
    {
      id: '3',
      title: 'UI Mockups',
      description: 'Design dashboard layout and components',
      assignee: 'Mike Johnson',
      priority: 'medium',
      swimLane: 'design',
      column: 'review',
    },
    {
      id: '4',
      title: 'Database Schema',
      description: 'Design and implement database structure',
      assignee: 'Sarah Wilson',
      priority: 'high',
      swimLane: 'backend',
      column: 'done',
    },
    {
      id: '5',
      title: 'Component Library',
      description: 'Build reusable React components',
      assignee: 'Alex Brown',
      priority: 'medium',
      swimLane: 'frontend',
      column: 'backlog',
    },
    {
      id: '6',
      title: 'Test Automation',
      description: 'Set up automated testing framework',
      assignee: 'Emily Davis',
      priority: 'low',
      swimLane: 'qa',
      column: 'todo',
    },
    {
      id: '7',
      title: 'Performance Testing',
      description: 'Load testing and optimization',
      assignee: 'Chris Lee',
      priority: 'medium',
      swimLane: 'qa',
      column: 'backlog',
    },
    {
      id: '8',
      title: 'Mobile Responsive',
      description: 'Ensure app works on mobile devices',
      assignee: 'Anna Taylor',
      priority: 'high',
      swimLane: 'frontend',
      column: 'review',
    },
  ];

  const handleItemMove = (itemId: string, newColumn: string, newSwimLane: string) => {
    console.log(`Moving item ${itemId} to column ${newColumn} in swim lane ${newSwimLane}`);
    // Here you would typically update your state or make an API call
  };

  return (
    <KanbanBoard
      items={items}
      columns={columns}
      swimLanes={swimLanes}
      onItemMove={handleItemMove}
    />
  );
};

export default KanbanDemo;
