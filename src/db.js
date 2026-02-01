import Dexie from 'dexie';

// Create the database
export const db = new Dexie('TodoAppDB');

// Define database schema
db.version(7).stores({
  lists: '++id, name, createdAt',
  tasks: '++id, listId, text, notes, completed, priority, dueDate, tags, starred, categoryId, createdAt, updatedAt, completedAt',
  categories: '++id, name, color, icon, createdAt'
});

// Default categories with colors and icons
const defaultCategories = [
  { name: 'Work', color: '#4dabf7', icon: '💼' },
  { name: 'Personal', color: '#69db7c', icon: '🏠' },
  { name: 'Shopping', color: '#ffa94d', icon: '🛒' },
  { name: 'Health', color: '#ff6b6b', icon: '❤️' },
  { name: 'Learning', color: '#9775fa', icon: '📚' }
];

// Initialize with default list and categories if database is empty
export const initializeDB = async () => {
  const listsCount = await db.lists.count();
  if (listsCount === 0) {
    await db.lists.add({
      name: 'Personal',
      createdAt: new Date().toISOString()
    });
  }
  
  // Initialize default categories
  const categoriesCount = await db.categories.count();
  if (categoriesCount === 0) {
    for (const cat of defaultCategories) {
      await db.categories.add({
        ...cat,
        createdAt: new Date().toISOString()
      });
    }
  }
};

// Lists CRUD operations
export const listsDB = {
  getAll: () => db.lists.toArray(),
  
  add: (name) => db.lists.add({
    name,
    createdAt: new Date().toISOString()
  }),
  
  update: (id, changes) => db.lists.update(id, changes),
  
  delete: async (id) => {
    // Delete all tasks in this list first
    await db.tasks.where('listId').equals(id).delete();
    // Then delete the list
    return db.lists.delete(id);
  }
};

// Tasks CRUD operations
export const tasksDB = {
  getByListId: (listId) => db.tasks.where('listId').equals(listId).toArray(),
  
  add: (listId, text, priority = 'medium', dueDate = null, tags = [], notes = '', categoryId = null) => db.tasks.add({
    listId,
    text,
    notes,
    completed: false,
    priority,
    dueDate,
    tags,
    starred: false,
    categoryId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null
  }),

  update: (id, changes) => db.tasks.update(id, {
    ...changes,
    updatedAt: new Date().toISOString()
  }),

  delete: (id) => db.tasks.delete(id),

  deleteCompleted: (listId) => db.tasks
    .where('listId').equals(listId)
    .and(task => task.completed)
    .delete()
};

// Categories CRUD operations
export const categoriesDB = {
  getAll: () => db.categories.toArray(),
  
  add: (name, color, icon = '📁') => db.categories.add({
    name,
    color,
    icon,
    createdAt: new Date().toISOString()
  }),
  
  update: (id, changes) => db.categories.update(id, changes),
  
  delete: async (id) => {
    // Set categoryId to null for tasks with this category
    const tasksWithCategory = await db.tasks.where('categoryId').equals(id).toArray();
    for (const task of tasksWithCategory) {
      await db.tasks.update(task.id, { categoryId: null });
    }
    return db.categories.delete(id);
  }
};

export default db;
