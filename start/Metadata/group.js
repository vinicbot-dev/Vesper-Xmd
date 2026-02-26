const GroupDB = {
  addMessage: (groupJid, userJid) => {
    db.run(
      `INSERT INTO messages (group_jid, user_jid, count) 
       VALUES (?, ?, 1) 
       ON CONFLICT(group_jid, user_jid) 
       DO UPDATE SET count = count + 1`,
      [groupJid, userJid],
      (err) => {
        if (err) console.error('Error inserting message:', err);
      }
    );
  },

  getActiveUsers: (groupJid) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT user_jid AS jid, count 
         FROM messages 
         WHERE group_jid = ? 
         ORDER BY count DESC`,
        [groupJid],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }
};


module.exports = GroupDB;