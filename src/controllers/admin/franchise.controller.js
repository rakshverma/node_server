const franchiseService = require("../../services/admin/franchise.service");
const response = require("../../utils/commonResponse");

const getAllFranchise = async (req, res) => {
  const { user_id, role_id } = req;
  const list = await franchiseService.getFranchiseList(user_id, role_id);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const getDistrictList = async (req, res) => {
  const list = await franchiseService.getDistrictList();
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const getPinCodeList = async (req, res) => {
  const { district } = req.query;
  const list = await franchiseService.getPinCodeList(district);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const addFranchise = async (req, res) => {
  const { user_id, role_id } = req;
  const insert = await franchiseService.addFranchise(req.body, user_id, role_id);
  console.log("insert = ", insert);
  if (insert.status) return response.send(res, 200, 1, insert.msg, {});
  else return response.send(res, 500, 0, insert.msg, {});
};

const editFranchise = async (req, res) => {
  const { user_id, role_id } = req;
  const insert = await franchiseService.editFranchise(req.body, user_id, role_id);
  console.log("insert = ", insert);
  if (insert.status) return response.send(res, 200, 1, insert.msg, {});
  else return response.send(res, 500, 0, insert.msg, {});
};

const getAllRequest = async (req, res) => {
  const { role_id } = req;
  const list = await franchiseService.getAllRequest(role_id);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const getAllFranchiseOnRole = async (req, res) => {
  const { role_id, user_id } = req;
  const list = await franchiseService.getAllFranchiseOnRole(role_id, user_id);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const getShippingCostListOnId = async (req, res) => {
  const { role_id, user_id } = req;
  const { franchiseId } = req.params;
  const list = await franchiseService.getShippingCostListOnId(franchiseId, role_id, user_id);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const updateShippingCostListOnId = async (req, res) => {
  const { role_id, user_id } = req;
  const { formData, franchiseId } = req.body;
  const list = await franchiseService.updateShippingCostListOnId(formData, franchiseId, role_id, user_id);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const getFranchiseDetailsOnId = async (req, res) => {
  const { role_id, user_id } = req;
  const { franchiseId } = req.query;
  const list = await franchiseService.getFranchiseDetailsOnId(franchiseId, role_id, user_id);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const deleteFranchise = async (req, res) => {
  const { role_id, user_id } = req;
  const { franchiseId } = req.query;
  const list = await franchiseService.deleteFranchise(franchiseId, role_id, user_id);
  if (list.status) return response.send(res, 200, 1, list.msg, {});
  else return response.send(res, 500, 0, list.msg, []);
};

module.exports = {
  getAllFranchise,
  getDistrictList,
  getPinCodeList,
  addFranchise,
  getAllRequest,
  getAllFranchiseOnRole,
  getShippingCostListOnId,
  updateShippingCostListOnId,
  getFranchiseDetailsOnId,
  editFranchise,
  deleteFranchise,
};
