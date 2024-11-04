const Model = require("../models/pageModel");
const QueryModel = require("../models/queryModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const db = require("../config/mysql_database");
const Joi = require("joi");
const moment = require("moment-timezone");
const sanitizeHtml = require("sanitize-html");

const table_name = Model.table_name;
const module_title = Model.module_title;
const module_single_title = Model.module_single_title;
const module_add_text = Model.module_add_text;
const module_edit_text = Model.module_edit_text;
const module_slug = Model.module_slug;
const module_layout = Model.module_layout;

exports.addFrom = catchAsyncErrors(async (req, res, next) => {
  res.render(module_slug + "/add", {
    layout: module_layout,
    title: module_single_title + " " + module_add_text,
    module_slug,
  });
});

//create a new blog
// end data
exports.createRecord = async (req, res, next) => {
  try {
    // Validate input data
    await Model.insertSchema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        error.details.map((d) => d.message).join(', '),
        400
      )
    );
  }

  // Create the date in the desired timezone
  const date_created = moment().tz('Your/Timezone').format('YYYY-MM-DD HH:mm:ss');

  if (req.file) {
    req.body.image = req.file.filename;
  }

  // Sanitize the description to remove HTML tags
  const sanitizedDescription = sanitizeHtml(req.body.description, {
    allowedTags: [], // No tags allowed
    allowedAttributes: {}, // No attributes allowed
  });

  // Prepare the insert data with quest_type and activity names
  const insertData = {
    quest_name: req.body.quest_name,
    quest_type: req.body.quest_type === 'banner' ? 'banner' : 'non-banner', 
    activity: req.body.activity === 'watch' ? 'watch' : 'follow', 
    quest_url: req.body.quest_url,
    date_created: date_created,
    image: req.body.image,
    description: sanitizedDescription,
    status: req.body.status,
    coin_earn: req.body.coin_earn,
    end_date: req.body.end_date // Assuming end_date is also passed in the request
  };

  console.log("Data to be inserted:", insertData); // Log the data to be inserted

  try {
    const blog = await QueryModel.saveData('quest', insertData);

    if (!blog) {
      return next(new ErrorHandler("Failed to add record", 500));
    }

    req.flash("msg_response", {
      status: 200,
      message: "Successfully added the quest.",
    });

    res.redirect(`/${process.env.ADMIN_PREFIX}/${module_slug}`);
  } catch (error) {
    console.error("Error in createRecord:", error.message);
    return next(new ErrorHandler("An error occurred while saving data", 500));
  }
};

exports.editForm = catchAsyncErrors(async (req, res, next) => {
  const blog = await QueryModel.findById(table_name, req.params.id, next);

  if (!blog) {
    return next(new ErrorHandler("Blog not found", 404));
  }

  // Log the original value of end_date
  console.log("Original End Date:", blog.end_date);

  // Ensure end_date is a valid date and format it
  if (blog.end_date) {
    const endDate = new Date(blog.end_date);

    if (!isNaN(endDate.getTime())) {
      // Convert to local time format if needed
      const utcOffset = endDate.getTimezoneOffset();
      const localEndDate = new Date(endDate.getTime() - utcOffset * 60 * 1000);
      blog.end_date = localEndDate.toISOString().slice(0, 16);
    } else {
      console.error("Invalid date:", blog.end_date);
      blog.end_date = ""; // Handle invalid date
    }
  }

  // Log the formatted end_date
  console.log("Formatted End Date:", blog.end_date);

  res.render(module_slug + "/edit", {
    layout: module_layout,
    title: module_single_title + " " + module_edit_text,
    blog,
    module_slug,
  });
});
exports.updateRecord = catchAsyncErrors(async (req, res, next) => {
  const date_created = new Date().toISOString().slice(0, 19).replace("T", " ");

  req.body.image = req.body.old_image;
  if (req.file) {
    req.body.image = req.file.filename;
  }

  // Log the incoming end_date
  console.log("Incoming End Date:", req.body.end_date);

  // Sanitize the description to remove HTML tags
  const sanitizedDescription = sanitizeHtml(req.body.description, {
    allowedTags: [], // No tags allowed
    allowedAttributes: {}, // No attributes allowed
  });
  const updateData = {
    quest_name: req.body.quest_name,
    quest_type: req.body.quest_type,
    activity: req.body.activity, // New field for activity
    quest_url: req.body.quest_url,
    end_date: req.body.end_date, // New field for end date
    date_created: date_created,
    image: req.body.image,
    description: sanitizedDescription,
    status: req.body.status,
    coin_earn: req.body.coin_earn,
  };

  // Update the record in the database
  const blog = await QueryModel.findByIdAndUpdateData(
    table_name,
    req.params.id,
    updateData,
    next
  );

  req.flash("msg_response", {
    status: 200,
    message: "Successfully updated " + module_single_title,
  });

  res.redirect(`/${process.env.ADMIN_PREFIX}/${module_slug}`);
});

exports.deleteRecord = catchAsyncErrors(async (req, res, next) => {
  await QueryModel.findByIdAndDelete(table_name, req.params.id, next);

  req.flash("msg_response", {
    status: 200,
    message: "Successfully deleted " + module_single_title,
  });

  res.redirect(`/${process.env.ADMIN_PREFIX}/${module_slug}`);
});

exports.getAllRecords = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 1;
  const quest = parseInt(req.query.quest) || 1;
  const searchQuery = req.query.search || "";
  const filterQuery = req.query.filter || "";
  // Calculate offset for pagination
  const offset = (quest - 1) * resultPerPage;

  try {
    // Count total blogs
    const totalBlogsResult = await db.query(
      "SELECT COUNT(*) as count FROM " + table_name
    );
    const totalBlogs = totalBlogsResult[0][0].count;

    // Fetch blogs with pagination and filtering
    // const blogs = await db.query('SELECT * FROM blogs  LIMIT ? OFFSET ?', [resultPerPage, offset]);
    const blogs = await db.query(
      "SELECT * FROM " + table_name + " order by id desc"
    );

    /*res.status(200).json({
            success: true,
            totalBlogs,
            resultPerPage,
            page,
            blogs
        });*/
    const message = req.flash("msg_response");

    res.render(module_slug + "/index", {
      layout: module_layout,
      title: module_title,
      blogs,
      message,
      module_slug,
    });
  } catch (error) {
    return next(new ErrorHandler("Database query failed", 500));
  }
});

exports.getSingleRecord = catchAsyncErrors(async (req, res, next) => {
  const blog = await QueryModel.findById(table_name, req.params.id, next);

  if (!blog) {
    return next(new ErrorHandler("Blog not found", 404)); // Handle not found error
  }

  // Log the original value of end_date
  console.log("Original End Date:", blog.end_date);

  // Format end_date if it exists
  if (blog.end_date) {
    // Create a date object from end_date
    const endDate = new Date(blog.end_date);

    // Check if endDate is valid
    if (!isNaN(endDate.getTime())) {
      // Format to 'YYYY-MM-DDTHH:mm' for datetime-local input
      // Convert to local timezone (e.g., 'Asia/Kolkata') before formatting
      blog.end_date = moment(endDate)
        .tz("Your_Time_Zone")
        .format("YYYY-MM-DDTHH:mm"); // Change 'Your_Time_Zone' accordingly
    } else {
      console.error("Invalid date:", blog.end_date);
      blog.end_date = ""; // Handle invalid date
    }
  }

  // Log the formatted end_date
  console.log("Formatted End Date:", blog.end_date);

  res.render(module_slug + "/detail", {
    layout: module_layout,
    title: module_single_title,
    blog,
  });
});

exports.deleteImage = catchAsyncErrors(async (req, res, next) => {
  const updateData = {
    image: "",
  };

  const blog = await QueryModel.findByIdAndUpdateData(
    table_name,
    req.params.id,
    updateData,
    next
  );

  req.flash("msg_response", {
    status: 200,
    message: "Successfully updated " + module_single_title,
  });

  res.redirect(
    `/${process.env.ADMIN_PREFIX}/${module_slug}/edit/${req.params.id}`
  );
});

function generateSlug(quest_name) {
  return quest_name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "") // Remove invalid characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+$/g, ""); // Remove trailing hyphens
}

exports.apiGetAllRecords = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 10; // Set number of records per page
  const page = parseInt(req.query.page) || 1; // Current page from query parameters
  const searchQuery = req.query.search || ""; // Search term from query parameters

  // Calculate offset for pagination
  const offset = (page - 1) * resultPerPage;

  try {
    // Count total quests with optional search filter
    const totalQuestsResult = await db.query(
      "SELECT COUNT(*) as count FROM quest WHERE quest_name LIKE ? OR description LIKE ?",
      [`%${searchQuery}%`, `%${searchQuery}%`]
    );
    const totalQuests = totalQuestsResult[0][0].count;

    // Fetch quests with pagination and filtering, including activity and end_date
    const [quest_records] = await db.query(
      "SELECT id, quest_name, quest_type, activity, quest_url, date_created, end_date, description, status, coin_earn, image FROM quest WHERE quest_name LIKE ? OR description LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?",
      [`%${searchQuery}%`, `%${searchQuery}%`, resultPerPage, offset]
    );

    // Process rows to structure the data correctly
    const quests = quest_records.map((row) => ({
      quest_id: row.id,
      quest_name: row.quest_name,
      quest_type: row.quest_type, // Directly use the quest_type from the database
      activity: row.activity, // Ensure activity is fetched from the database
      quest_url: row.quest_url,
      date_created: row.date_created,
      end_date: row.end_date, // Include end_date in the response
      description: row.description,
      status: row.status,
      image: row.image,
      coin_earn: row.coin_earn,
    }));

    // Send the response
    res.status(200).json({
      success: true,
      totalQuests,
      resultPerPage,
      page,
      quests,
    });
  } catch (error) {
    console.error("Error in apiGetAllRecords:", error.message);
    return next(new ErrorHandler("Database query failed", 500));
  }
});

exports.apiGetSingleRecord = catchAsyncErrors(async (req, res, next) => {
  const questId = req.params.id; // Assuming quest ID is passed as a URL parameter
  const userId = req.user.id; // Assuming user ID is available from the request object

  try {
    const [quest_records] = await db.query(
      `
      SELECT q.quest_name, q.quest_type, q.quest_url, q.date_created, q.description, q.status, q.coin_earn, q.image, 
             COALESCE(u.status, 'not_completed') AS user_status
      FROM quest q
      LEFT JOIN usercoin_audit u ON u.quest_id = q.id AND u.user_id = ?
      WHERE q.id = ?
      LIMIT 1
    `,
      [userId, questId]
    );

    const quest = quest_records[0]; // Get the first (and should be the only) record

    if (!quest) {
      return next(new ErrorHandler("Record not found", 404)); // Changed status code to 404 for not found
    }

    // Process the image URL
    quest.image =
      process.env.BACKEND_URL + "/uploads/" + module_slug + "/" + quest.image;

    res.status(200).json({
      success: true,
      quest,
    });
  } catch (error) {
    console.error("Error fetching quest record:", error);
    return next(new ErrorHandler("Database query failed", 500));
  }
});

/////////////////
exports.completeQuest = catchAsyncErrors(async (req, res, next) => {
  // Get the user_id from the logged-in user's session
  const user_id = req.user.id;

  // Get the quest_id from the request body
  const { quest_id } = req.body;

  console.log("Received request to complete quest:", { user_id, quest_id });

  // Validate input to ensure quest_id is provided
  if (!quest_id) {
    console.log("Validation failed: Missing quest_id");
    return next(new ErrorHandler("Quest ID is required", 400));
  }

  try {
    // Fetch the quest details from the quest table to get the coin_earn value
    const [questResult] = await db.query(
      "SELECT id, coin_earn FROM quest WHERE id = ?",
      [quest_id]
    );

    // Check if the quest exists in the database
    if (questResult.length === 0) {
      console.log("Quest not found for quest_id:", quest_id);
      return next(new ErrorHandler("Quest not found", 404));
    }

    const { id: fetchedQuestId, coin_earn: coinEarn } = questResult[0];
    console.log("Quest ID and Coin Earn:", { fetchedQuestId, coinEarn });

    // Convert coinEarn to an integer
    const coinEarnValue = Math.floor(parseFloat(coinEarn));
    if (isNaN(coinEarnValue) || coinEarnValue < 0) {
      console.error(
        "Coin earn value is NaN or negative, cannot update user_data"
      );
      return next(new ErrorHandler("Invalid coin earn value", 400));
    }

    // Begin a transaction
    await db.query("START TRANSACTION");

    // Insert into usercoin_audit
    const insertAuditData = {
      user_id,
      quest_id: fetchedQuestId,
      pending_coin: coinEarnValue,
      coin_operation: "cr",
      type: "quest",
      status: "completed",
      date_entered: new Date(),
    };
    console.log("Insert data for usercoin_audit:", insertAuditData);

    const [insertAuditResult] = await db.query(
      "INSERT INTO usercoin_audit SET ?",
      insertAuditData
    );
    if (insertAuditResult.affectedRows === 0) {
      await db.query("ROLLBACK");
      console.error("Failed to insert into usercoin_audit");
      return next(new ErrorHandler("Failed to complete quest", 500));
    }

    // Fetch the current pending_coin from user_data
    const [currentCoinResult] = await db.query(
      "SELECT pending_coin FROM user_data WHERE user_id = ?",
      [user_id]
    );

    const currentPendingCoin = currentCoinResult[0]?.pending_coin || 0;
    console.log("Current pending_coin for user:", currentPendingCoin);

    // Calculate the new pending_coin value
    const newPendingCoin = currentPendingCoin + coinEarnValue;
    console.log("New pending_coin value:", newPendingCoin);

    // Update the pending_coin in user_data with the new value
    const updateUserDataQuery = `
      UPDATE user_data
      SET pending_coin = ?
      WHERE user_id = ?
    `;
    const [updateUserResult] = await db.query(updateUserDataQuery, [
      newPendingCoin,
      user_id,
    ]);
    if (updateUserResult.affectedRows === 0) {
      await db.query("ROLLBACK");
      console.error("Failed to update pending_coin in user_data");
      return next(new ErrorHandler("Failed to update pending_coin", 500));
    }

    // Commit the transaction
    await db.query("COMMIT");

    // Fetch the updated pending_coin value
    const [updatedPendingCoinResult] = await db.query(
      "SELECT pending_coin FROM user_data WHERE user_id = ?",
      [user_id]
    );
    const updatedPendingCoin = updatedPendingCoinResult[0]?.pending_coin || 0;
    console.log("Updated pending_coin for user:", updatedPendingCoin);

    // Respond with success
    res.status(200).json({
      success: true,
      message: `Quest completed successfully. ${coinEarnValue} coins added to the pending coins.`,
      data: {
        user_id,
        quest_id: fetchedQuestId,
        coin_earn: coinEarnValue,
        status: "completed",
        date_entered: new Date(),
        updated_pending_coin: updatedPendingCoin,
      },
    });
  } catch (error) {
    console.error("Error during quest completion:", error);
    await db.query("ROLLBACK");
    return next(new ErrorHandler("Database query failed", 500));
  }
});

////////////////////////////////////////////
exports.getUserPendingCoins = catchAsyncErrors(async (req, res, next) => {
  // Get the user_id from the logged-in user's session
  const user_id = req.user.id; // Assuming req.user.id contains the authenticated user's ID

  console.log("Fetching pending coins for user:", user_id);

  try {
    // Query to get the sum of pending coins for the user where the status is 'inactive'
    const result = await db.query(
      "SELECT pending_coin AS totalPendingCoins FROM user_data WHERE user_id = ?",
      [user_id]
    );

    const totalPendingCoins = result[0][0].totalPendingCoins || 0; // If no coins are found, default to 0

    console.log("Total pending coins fetched:", totalPendingCoins);

    // Respond with the total pending coins
    res.status(200).json({
      success: true,
      message: "Pending coins fetched successfully.",
      data: {
        user_id,
        pending_coin: totalPendingCoins,
      },
    });
  } catch (error) {
    console.error("Error fetching pending coins:", error);
    return next(new ErrorHandler("Database query failed", 500));
  }
});
//////////////////////////////////////

exports.transferPendingCoinsToTotal = catchAsyncErrors(
  async (req, res, next) => {
    const user_id = req.user.id; // Assuming req.user.id contains the authenticated user's ID

    console.log("Transferring coins from pending to total for user:", user_id);

    try {
      // Step 1: Retrieve the reduce_coin_rate from settings table
      const settingsResult = await db.query(
        "SELECT reduce_coin_rate FROM settings LIMIT 1" // Assuming there's only one row in the settings table
      );

      const reduceCoinRate = settingsResult[0][0]?.reduce_coin_rate || 0;

      // Step 2: Check if the user has enough pending coins in user_data table
      const userPendingResult = await db.query(
        "SELECT pending_coin FROM user_data WHERE user_id = ?",
        [user_id]
      );

      const userPendingCoins = userPendingResult[0][0]?.pending_coin || 0;

      // Check if user has enough pending coins
      if (userPendingCoins < reduceCoinRate) {
        return res.status(400).json({
          success: false,
          error: `Insufficient pending coins in user_data. At least ${reduceCoinRate} coins are required.`,
        });
      }

      // Step 3: Deduct coins from user_data table
      await db.query(
        "UPDATE user_data SET pending_coin = pending_coin - ?, coins = coins + ? WHERE user_id = ?",
        [reduceCoinRate, reduceCoinRate, user_id]
      );

      // Step 4: Transfer coins from usercoin_audit table
      let coinsToTransfer = reduceCoinRate; // Use the reduceCoinRate for transfer
      const auditRows = await db.query(
        "SELECT * FROM usercoin_audit WHERE user_id = ? ORDER BY id ASC",
        [user_id]
      );

      for (let i = 0; i < auditRows[0].length; i++) {
        const row = auditRows[0][i];
        if (coinsToTransfer <= 0) break;

        if (row.pending_coin > 0) {
          const transferAmount = Math.min(coinsToTransfer, row.pending_coin);

          // Update the row to transfer coins
          await db.query(
            "UPDATE usercoin_audit SET pending_coin = pending_coin - ?, earn_coin = earn_coin + ? WHERE id = ?",
            [transferAmount, transferAmount, row.id]
          );

          coinsToTransfer -= transferAmount;
        }
      }

      // If there are still coins left to transfer, it means not enough pending coins were found
      if (coinsToTransfer > 0) {
        return res.status(400).json({
          success: false,
          error:
            "Insufficient pending coins in usercoin_audit to complete the transfer.",
        });
      }

      // Step 5: Fetch updated values
      const updatedPendingCoinsResult = await db.query(
        "SELECT pending_coin FROM user_data WHERE user_id = ?",
        [user_id]
      );

      const updatedPendingCoins = updatedPendingCoinsResult[0][0].pending_coin;

      const updatedTotalCoinsResult = await db.query(
        "SELECT SUM(coins) AS totalEarnCoins FROM user_data WHERE user_id = ?",
        [user_id]
      );

      const updatedTotalCoins =
        updatedTotalCoinsResult[0][0]?.totalEarnCoins || 0;

      // Respond with the updated values
      res.status(200).json({
        success: true,
        message: `${reduceCoinRate} coins transferred from pending coins to total coins successfully.`,
        data: {
          user_id,
          pending_coin: updatedPendingCoins,
          coins: updatedTotalCoins,
        },
      });
    } catch (error) {
      console.error("Error during coin transfer:", error);
      return next(new ErrorHandler("Database query failed", 500));
    }
  }
);

////////////////////////////////////////////////////////
