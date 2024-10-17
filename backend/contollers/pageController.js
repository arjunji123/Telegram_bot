const Model = require("../models/pageModel");
const QueryModel = require("../models/queryModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const db = require("../config/mysql_database");
const Joi = require("joi");

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
exports.createRecord = catchAsyncErrors(async (req, res, next) => {
  try {
    await Model.insertSchema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
  } catch (error) {
    // Joi validation failed, send 400 Bad Request with error details
    return next(
      new ErrorHandler(
        error.details.map((d) => d.message),
        400
      )
    );
  }

  const date_created = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (req.file) {
    req.body.image = req.file.filename;
  }

  const insertData = {
    quest_name: req.body.quest_name,
    quest_type: req.body.quest_type,
    quest_url: req.body.quest_url,
    date_created: date_created,
    // end_date:
    image: req.body.image,
    description: req.body.description,
    status: req.body.status,
    coin_earn: req.body.coin_earn,
  };

  const blog = await QueryModel.saveData(table_name, insertData, next);

  req.flash("msg_response", {
    status: 200,
    message: "Successfully added " + module_single_title,
  });

  res.redirect(`/${process.env.ADMIN_PREFIX}/${module_slug}`);
});

exports.editForm = catchAsyncErrors(async (req, res, next) => {
  const blog = await QueryModel.findById(table_name, req.params.id, next);

  if (!blog) {
    return;
  }
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

  const updateData = {
    quest_name: req.body.quest_name,
    quest_type: req.body.quest_type,
    quest_url: req.body.quest_url,
    date_created: date_created,
    // end_date:
    image: req.body.image,
    description: req.body.description,
    status: req.body.status,
    coin_earn: req.body.coin_earn,
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
    return;
  }
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
  const resultPerPage = 10;
  const page = parseInt(req.query.page) || 1;
  const searchQuery = req.query.search || "";
  const filterQuery = req.query.filter || "";

  // Calculate offset for pagination
  const offset = (page - 1) * resultPerPage;

  try {
    // Count total quests
    const totalQuestsResult = await db.query(
      "SELECT COUNT(*) as count FROM quest"
    );
    const totalQuests = totalQuestsResult[0][0].count;

    // Fetch quests with pagination and filtering
    const [quest_records] = await db.query(
      "SELECT id,quest_name, quest_type, quest_url, date_created, description, status, coin_earn, image FROM quest ORDER BY id DESC LIMIT ? OFFSET ?",
      [resultPerPage, offset]
    );

    // Process rows if needed
    const quests = quest_records.map((row) => ({
      quest_id: row.id,
      quest_name: row.quest_name,
      quest_type: row.quest_type,
      quest_url: row.quest_url,
      date_created: row.date_created,
      description: row.description,
      status: row.status,
      image: row.image,
      coin_earn: row.coin_earn,
    }));

    res.status(200).json({
      success: true,
      totalQuests,
      resultPerPage,
      page,
      quests,
    });
  } catch (error) {
    return next(new ErrorHandler("Database query failed", 500));
  }
});

exports.apiGetSingleRecord = catchAsyncErrors(async (req, res, next) => {
  // Assuming you're using a slug or an ID to find the specific record
  const questId = req.params.id; // Change this if using a slug or another identifier

  // Fetching the specific quest record
  const [quest_records] = await db.query(
    "SELECT quest_name, quest_type, quest_url, date_created, description, status, coin_earn, image FROM quest WHERE id = ? LIMIT 1",
    [questId]
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
      status: "active",
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
        status: "active",
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
    // Query to get the pending_coin from user_data for the user
    const [result] = await db.query(
      "SELECT pending_coin FROM user_data WHERE user_id = ?",
      [user_id]
    );

    // Get the pending_coin value from the result, or default to 0 if not found
    const pendingCoin = result[0]?.pending_coin || 0;

    console.log("Pending coins fetched from user_data:", pendingCoin);

    // Respond with the pending coins
    res.status(200).json({
      success: true,
      message: "Pending coins fetched successfully.",
      data: {
        user_id,
        pending_coin: pendingCoin,
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
    // Get the user_id from the logged-in user's session
    const user_id = req.user.id; // Assuming req.user.id contains the authenticated user's ID

    console.log(
      "Transferring 5 coins from pending to total for user:",
      user_id
    );

    try {
      // Step 1: Get the current pending coins of the user
      const pendingResult = await db.query(
        "SELECT SUM(pending_coin) AS totalPendingCoins FROM usercoin_audit WHERE user_id = ?",
        [user_id]
      );

      const totalPendingCoins = pendingResult[0][0].totalPendingCoins || 0; // Default to 0 if no coins found

      // Step 2: Check if the user has at least 5 pending coins
      if (totalPendingCoins < 5) {
        console.log("Insufficient pending coins for user:", user_id);
        return res.status(400).json({
          success: false,
          error: "Insufficient pending coins. At least 5 coins are required.",
        });
      }

      // Step 3: Deduct 5 coins from pending
      await db.query(
        "UPDATE usercoin_audit SET pending_coin = pending_coin - 5 WHERE user_id = ?",
        [user_id]
      );

      // Step 4: Update total coins (assuming there's a 'earn_coin' field in the 'users' table)
      await db.query(
        "UPDATE usercoin_audit SET earn_coin = earn_coin + 5 WHERE id = ?",
        [user_id]
      );

      // Step 5: Fetch the updated pending coins and total coins
      const updatedPendingResult = await db.query(
        "SELECT SUM(pending_coin) AS totalPendingCoins FROM usercoin_audit WHERE user_id = ?",
        [user_id]
      );

      const totalCoinsResult = await db.query(
        "SELECT earn_coin FROM usercoin_audit WHERE id = ?",
        [user_id]
      );

      const updatedPendingCoins =
        updatedPendingResult[0][0].totalPendingCoins || 0;
      const updatedTotalCoins = totalCoinsResult[0][0].earn_coin;

      // Respond with the updated values
      res.status(200).json({
        success: true,
        message:
          "5 coins transferred from pending coins to total coins successfully.",
        data: {
          user_id,
          pending_coin: updatedPendingCoins,
          earn_coin: updatedTotalCoins,
        },
      });
    } catch (error) {
      console.error("Error during coin transfer:", error);
      return next(new ErrorHandler("Database query failed", 500));
    }
  }
);
