const categoryService = require("../../services/admin/category.service");
const response = require("../../utils/commonResponse");

const addCategory = async (req, res) => {
  const { category } = req.body;
  if (!category)
    return response.send(res, 400, 0, "Category name can not be empty", {});
  const save = await categoryService.addCategory(category);
  if (save.status) return response.send(res, 200, 1, save.msg, {});
  else response.send(res, save.statusCode || 500, 0, save.msg, {});
};

const editCategory = async (req, res) => {
  const { category } = req.body;
  const { id } = req.query;

  if (!id || !category)
    return response.send(res, 400, 0, "Request is not valid", {});

  console.log("id = ", id);
  const save = await categoryService.editCategory(category, id);
  console.log("save = ", save);
  if (save.status) return response.send(res, 200, 1, save.msg, {});
  else response.send(res, save.statusCode || 500, 0, save.msg, {});
};

const getAllCategory = async (req, res) => {
  const list = await categoryService.getCategoryList();
  if (list.status)
    return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 200, 1, list.msg, []);
};

const deleteCategory = async (req, res) => {
  const { id } = req.query;
  const del = await categoryService.deleteCategory(id);
  if (del.status) return response.send(res, 200, 1, del.msg, del.responseObj);
  else return response.send(res, 200, 1, del.msg, del.responseObj);
};

module.exports = {
  addCategory,
  getAllCategory,
  editCategory,
  deleteCategory,
};
