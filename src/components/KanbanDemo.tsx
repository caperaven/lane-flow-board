
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
    { id: 'devops', title: 'DevOps Team', color: '#f3e5f5' },
    { id: 'mobile', title: 'Mobile Team', color: '#e0f2f1' },
  ];

  // Generate 1000 items for testing virtualization
  const generateItems = (): KanbanItem[] => {
    const items: KanbanItem[] = [];
    const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const assignees = [
      'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 
      'Alex Brown', 'Emily Davis', 'Chris Lee', 'Anna Taylor',
      'David Miller', 'Lisa Garcia', 'Tom Anderson', 'Maria Lopez'
    ];
    
    const taskTemplates = [
      { title: 'User Authentication', description: 'Implement login and registration functionality' },
      { title: 'API Endpoints', description: 'Create REST API for user management' },
      { title: 'UI Components', description: 'Build reusable React components' },
      { title: 'Database Schema', description: 'Design and implement database structure' },
      { title: 'Performance Testing', description: 'Load testing and optimization' },
      { title: 'Mobile Responsive', description: 'Ensure app works on mobile devices' },
      { title: 'Security Audit', description: 'Review and fix security vulnerabilities' },
      { title: 'Bug Fixes', description: 'Resolve reported issues and bugs' },
      { title: 'Code Review', description: 'Review code quality and standards' },
      { title: 'Documentation', description: 'Write technical documentation' },
    ];

    for (let i = 1; i <= 1000; i++) {
      const template = taskTemplates[i % taskTemplates.length];
      const swimLane = swimLanes[i % swimLanes.length];
      const column = columns[i % columns.length];
      const priority = priorities[i % priorities.length];
      const assignee = assignees[i % assignees.length];

      items.push({
        id: `item-${i}`,
        title: `${template.title} #${i}`,
        description: template.description,
        assignee,
        priority,
        swimLane: swimLane.id,
        column: column.id,
      });
    }

    return items;
  };

  const items = generateItems();

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
