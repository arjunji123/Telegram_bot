const Joi = require("joi");

const table_name = "usercoin_audit";

const module_title = "Coins";
const module_single_title = "Coin";
const module_add_text = "Add";
const module_edit_text = "Edit";
const module_slug = "coins";
const module_layout = "layouts/main";

const insertSchema = Joi.object({
  quest_name: Joi.string().required().max(255),
  description: Joi.string().required(),
});

module.exports = {
  table_name,
  insertSchema,
  module_title,
  module_single_title,
  module_add_text,
  module_edit_text,
  module_slug,
  module_layout,
};