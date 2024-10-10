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
      "SELECT quest_name, quest_type, quest_url, date_created, description, status, coin_earn, image FROM quest ORDER BY id DESC LIMIT ? OFFSET ?",
      [resultPerPage, offset]
    );

    // Process rows if needed
    const quests = quest_records.map((row) => ({
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
