const mysqlPool = require("../config/mysql_database"); // Assuming you're using MySQL pool

async function updatePendingCoins(userId, coins) {
  const query = `
        UPDATE user_data 
        SET pending_coin = pending_coin + :coins 
        WHERE id = :userId
    `;
  const params = { coins, userId };
  await mysqlPool.execute(query, params);
  console.log(`Added ${coins} pending coins to User ID: ${userId}`);
}

async function distributeCoinsToParents(parentId, level = 1) {
  if (level > 18 || parentId === null) {
    return;
  }

  // Add 5 pending coins to the parent at this level
  await updatePendingCoins(parentId, 5);
  console.log(
    `Added 5 pending coins to User ID: ${parentId} at Level: ${level}`
  );

  // Get parent's parent and repeat up to 18 levels
  const query = `
        SELECT parent_id 
        FROM user_data 
        WHERE id = :parentId
    `;
  const [rows] = await mysqlPool.execute(query, { parentId });
  const parent = rows[0];

  if (parent && parent.parent_id) {
    await distributeCoinsToParents(parent.parent_id, level + 1);
  }
}

async function hasBothChildren(userId) {
  const query = `
        SELECT leftchild_id, rightchild_id 
        FROM user_data 
        WHERE id = :userId
    `;
  const [rows] = await mysqlPool.execute(query, { userId });
  const user = rows[0];
  return user && user.leftchild_id !== null && user.rightchild_id !== null;
}

async function findNextAvailableParent() {
  // Initialize a queue with the root user
  const rootQuery = `
        SELECT id 
        FROM user_data 
        WHERE parent_id IS NULL
    `;
  const [rootRows] = await mysqlPool.execute(rootQuery);
  const root = rootRows[0];

  if (!root) {
    // If no root exists, return null (root creation handled separately)
    return null;
  }

  const queue = [];
  queue.push(root.id);

  while (queue.length > 0) {
    const currentParentId = queue.shift();

    // Check if current parent has less than two children
    const parentQuery = `
            SELECT leftchild_id, rightchild_id 
            FROM user_data 
            WHERE id = :id
        `;
    const [parentRows] = await mysqlPool.execute(parentQuery, {
      id: currentParentId,
    });
    const parent = parentRows[0];

    if (!parent) {
      console.log(`Parent with ID ${currentParentId} not found.`);
      continue; // Skip if parent not found
    }

    if (parent.leftchild_id === null || parent.rightchild_id === null) {
      console.log(`Available parent found: ID ${currentParentId}`);
      return currentParentId; // Return current parent ID with available slot
    }

    // Enqueue left and right children
    if (parent.leftchild_id !== null) {
      queue.push(parent.leftchild_id);
      console.log(`Enqueued left child ID: ${parent.leftchild_id}`);
    }
    if (parent.rightchild_id !== null) {
      queue.push(parent.rightchild_id);
      console.log(`Enqueued right child ID: ${parent.rightchild_id}`);
    }
  }

  return null; // All parents have two children
}
async function findAvailableParentByReferral(referralCode) {
  console.log(
    `Looking for available parent for referral code: ${referralCode}`
  );

  // Fetch the user based on the referral code
  const userQuery = `
      SELECT id as parent_id
      FROM user_data 
      WHERE referral_code = ?`;
  const [userRows] = await mysqlPool.execute(userQuery, [referralCode]);

  // Check if the referred user exists
  let currentUser = userRows[0];
  if (!currentUser) {
    console.log(`Referred user with referral_code ${referralCode} not found.`);
    return null; // No user found for the given referral code
  }

  console.log("Found referred user:", currentUser);

  // Traverse the parent-child hierarchy
  while (currentUser) {
    const userId = currentUser.parent_id; // Use the correct parent ID

    if (!userId || userId === 0) {
      console.log("Invalid or null parent_id. Breaking the loop.");
      break;
    }

    console.log(`Checking user ID ${userId} for available slots...`);

    // Check the user's children for available slots
    const childQuery = `
          SELECT leftchild_id, rightchild_id 
          FROM user_data 
          WHERE id = ?`;
    const [childRows] = await mysqlPool.execute(childQuery, [userId]);
    const user = childRows[0];

    if (!user) {
      console.log(`User with ID ${userId} not found in child records.`);
      break;
    }

    // Check for available slots
    if (user.leftchild_id === null) {
      console.log(`Available slot found: Left child of User ID ${userId}`);
      return { parentId: userId, position: "leftchild_id" };
    }

    if (user.rightchild_id === null) {
      console.log(`Available slot found: Right child of User ID ${userId}`);
      return { parentId: userId, position: "rightchild_id" };
    }

    // Move up to the parent if no slots are found
    const parentQuery = `
              SELECT id, parent_id 
              FROM user_data 
              WHERE id = ?`;
    const [parentRows] = await mysqlPool.execute(parentQuery, [userId]);
    currentUser = parentRows[0];

    if (!currentUser) {
      console.log(`No parent found for User ID ${userId}.`);
      break; // Stop if there are no more parents
    }
  }

  console.log(
    `No available slot found in the referral chain for referral_code ${referralCode}.`
  );
  return null; // Return null if no slots are available
}

async function addUser(
  referralCode,
  referralBy = null,
  userId = null,
  additionalFields = {}
) {
  // Generate a unique user ID if not provided
  if (!userId) {
    userId = "USER" + uuidv4();
  }

  const connection = await mysqlPool.getConnection();

  // Maximum number of retries for transaction
  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await connection.beginTransaction();

      // Count users
      const countQuery = `SELECT COUNT(*) as count FROM user_data`;
      const [countRows] = await connection.execute(countQuery);
      const count = countRows[0].count;

      // Insert the root user if no user_data exist
      if (count === 0) {
        console.log("Inserting root user...");

        const insertRootUserQuery = `
              INSERT INTO user_data (user_id, referral_code, parent_id, referral_by, is_active)
              VALUES (:user_id, :referral_code, NULL, NULL, TRUE)
            `;

        await connection.execute(insertRootUserQuery, {
          user_id: userId,
          referral_code: referralCode,
        });

        await connection.commit();
        console.log(`Root user ${referralCode} added with ID: ${userId}`);
        return userId; // Root user doesn't need a parent, so we're done here.
      }

      // Determine parent ID based on referral or level-order traversal
      let parentId = null;
      let position = null;

      if (referralBy) {
        // Find parent by referral code
        const parentInfo = await findAvailableParentByReferral(referralBy);
        if (parentInfo) {
          parentId = parentInfo.parentId;
          position = parentInfo.position;
        } else {
          // Fall back to level-order traversal if no valid referral found
          const parentNode = await findNextAvailableParent(connection);
          parentId = parentNode.parentId;
          position = parentNode.position;
        }
      } else {
        // Level-order traversal to find next available parent
        const parentNode = await findNextAvailableParent(connection);
        parentId = parentNode.parentId;
        position = parentNode.position;
      }

      if (!parentId) {
        throw new Error("No available parent found. The tree might be full.");
      }

      // Prepare for inserting new user
      const insertFields = [
        "user_id",
        "referral_code",
        "parent_id",
        "referral_by",
      ];
      const insertValues = {
        user_id: userId,
        referral_code: referralCode,
        parent_id: parentId,
        referral_by: referralBy,
      };

      // Handle additional fields
      for (const [key, value] of Object.entries(additionalFields)) {
        insertFields.push(key);
        insertValues[key] = value;
      }

      const placeholders = insertFields.map((field) => `:${field}`).join(", ");
      const insertFieldsStr = insertFields.join(", ");

      const insertQuery = `
              INSERT INTO user_data (${insertFieldsStr}) 
              VALUES (${placeholders})
            `;
      const [insertResult] = await connection.execute(
        insertQuery,
        insertValues
      );
      const newUserId = insertResult.insertId;

      console.log(
        `User ${referralCode} added with ID: ${newUserId} under Parent ID: ${parentId}`
      );

      // Update parent's child record
      const updateChildQuery = `
              UPDATE user_data 
              SET ${position} = :childId 
              WHERE id = :parentId
            `;
      await connection.execute(updateChildQuery, {
        childId: newUserId,
        parentId,
      });

      // Update pending coins and activate parent if necessary
      await updatePendingCoins(parentId, 10);
      await distributeCoinsToParents(parentId, 1);

      const bothChildren = await hasBothChildren(parentId);
      if (bothChildren) {
        await updatePendingCoins(parentId, 100);
        await connection.execute(
          `UPDATE user_data SET is_active = TRUE WHERE id = :parentId`,
          { parentId }
        );
      }

      // Commit the transaction
      await connection.commit();
      return newUserId;
    } catch (error) {
      // Rollback transaction and log error
      await connection.rollback();
      console.error(`Attempt ${attempt + 1} failed: ${error.message}`);

      // If lock wait timeout error, log and retry
      if (error.code === "ER_LOCK_WAIT_TIMEOUT" && attempt < MAX_RETRIES - 1) {
        console.log("Lock wait timeout, retrying...");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before retry
      } else {
        return null; // Return null on other errors
      }
    } finally {
      connection.release(); // Ensure connection is released
    }
  }
}
async function findNextAvailableP(connection) {
  const query = `
        SELECT id, user_id, leftchild_id, rightchild_id
        FROM user_data
        WHERE leftchild_id IS NULL OR rightchild_id IS NULL
        ORDER BY id ASC
        LIMIT 1
      `;

  const [rows] = await connection.execute(query);

  if (rows.length === 0) {
    throw new Error("No available parent found.");
  }

  const parent = rows[0];
  let position = null;

  // Check which position (left or right) is available
  if (parent.leftchild_id === null) {
    position = "leftchild_id";
  } else if (parent.rightchild_id === null) {
    position = "rightchild_id";
  } else {
    throw new Error("No available position for this parent.");
  }

  return { parentId: parent.id, position };
}
module.exports = {
  updatePendingCoins,
  findAvailableParentByReferral,
  findNextAvailableParent,
  updatePendingCoins,
  distributeCoinsToParents,
  hasBothChildren,
  addUser,
  findNextAvailableP,
};
