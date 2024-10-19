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
    const user_id = req.user.id; // Get the user ID from the session
    console.log(
      "Initiating transfer of 5 coins from pending to total for user:",
      user_id
    );

    try {
      // Step 1: Get user data
      const [userDataResult] = await db.query(
        "SELECT pending_coin, coins FROM user_data WHERE user_id = ?",
        [user_id]
      );

      if (!userDataResult.length) {
        console.log("User not found:", user_id);
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      let remainingCoinsToTransfer = 5;
      let { pending_coin: currentPendingCoin, coins: currentEarnCoin } =
        userDataResult[0];

      console.log("User Data Retrieved:", userDataResult[0]);

      // Step 2: Transfer coins from user_data
      if (currentPendingCoin > 0) {
        const coinsFromUserData = Math.min(
          currentPendingCoin,
          remainingCoinsToTransfer
        );
        const newPendingCoinUserData = currentPendingCoin - coinsFromUserData;
        const newEarnCoinUserData = currentEarnCoin + coinsFromUserData;

        const [updateUserDataResult] = await db.query(
          "UPDATE user_data SET pending_coin = ?, coins = ? WHERE user_id = ?",
          [newPendingCoinUserData, newEarnCoinUserData, user_id]
        );

        if (updateUserDataResult.affectedRows === 0) {
          console.log("Failed to update user_data for user:", user_id);
        } else {
          console.log(
            "User data updated. Coins deducted from user_data:",
            coinsFromUserData
          );
        }

        remainingCoinsToTransfer -= coinsFromUserData;
      } else {
        console.log(
          "No pending coins available in user_data for user:",
          user_id
        );
      }

      // Step 3: Transfer coins from usercoin_audit
      while (remainingCoinsToTransfer > 0) {
        console.log(
          "Attempting to transfer coins from usercoin_audit. Remaining coins:",
          remainingCoinsToTransfer
        );

        const [auditResult] = await db.query(
          "SELECT id, pending_coin, earn_coin FROM usercoin_audit WHERE user_id = ? AND pending_coin > 0 LIMIT 1",
          [user_id]
        );

        console.log("Audit Result Retrieved:", auditResult); // Debugging line

        if (!auditResult.length) {
          console.log(
            "No more pending coins available in usercoin_audit for user:",
            user_id
          );
          break;
        }

        const {
          id: auditId,
          pending_coin: auditPendingCoin,
          earn_coin: currentAuditEarnCoin,
        } = auditResult[0];

        const coinsToDeduct = Math.min(
          auditPendingCoin,
          remainingCoinsToTransfer
        );
        const newPendingCoin = auditPendingCoin - coinsToDeduct;
        const newEarnCoin = currentAuditEarnCoin + coinsToDeduct;

        try {
          const [updateAuditResult] = await db.query(
            "UPDATE usercoin_audit SET pending_coin = ?, earn_coin = ? WHERE id = ?",
            [newPendingCoin, newEarnCoin, auditId]
          );

          console.log("Update Audit Result:", updateAuditResult); // Log to check affected rows

          if (updateAuditResult.affectedRows === 0) {
            console.log(
              "Failed to update usercoin_audit for audit ID:",
              auditId
            );
            break; // Exit if update fails
          }

          console.log(
            `Successfully transferred ${coinsToDeduct} coins from usercoin_audit for audit ID: ${auditId}`
          );
          remainingCoinsToTransfer -= coinsToDeduct; // Reduce remaining coins
        } catch (error) {
          console.error("Error while updating usercoin_audit:", error);
          break; // Exit on error
        }
      }

      // Step 4: Respond with updated user_data
      const [updatedUserData] = await db.query(
        "SELECT user_id, pending_coin, coins FROM user_data WHERE user_id = ?",
        [user_id]
      );

      console.log("Final User Data After Transfer:", updatedUserData[0]);

      res.status(200).json({
        success: true,
        message: "Coins transferred successfully.",
        data: updatedUserData[0],
      });
    } catch (error) {
      console.error("Error during coin transfer:", error);
      return next(new ErrorHandler("Database query failed", 500));
    }
  }
);
