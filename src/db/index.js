import Dexie from 'dexie'

export const db = new Dexie('YuzuNotebook')

// 数据库版本1（旧版本 - 已废弃）
db.version(1).stores({
  notes: '++id, title, content, images, createdAt, updatedAt',
  todos: '++id, text, dueDate, completed, createdAt',
  settings: 'id, username, avatar, darkMode'
}).upgrade(async (tx) => {
  // 迁移：清除旧数据，重建表结构
  await tx.table('notes').clear()
  await tx.table('settings').clear()
})

// 数据库版本2（当前版本）
db.version(2).stores({
  notes: '++id, title, content, createdAt, updatedAt',
  todos: '++id, text, dueDate, completed, createdAt',
  settings: 'id, username, avatar'
})

// 初始化默认设置
db.on('populate', (tx) => {
  tx.settings.add({
    id: 1,
    username: '用户',
    avatar: ''
  })
})

export default db