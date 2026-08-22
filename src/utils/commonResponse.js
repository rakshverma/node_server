exports.send = (res, status, responseCode, message, data) => {
  res.setHeader("Content-Type", "application/json");
  res
    .status(status)
    .send({
      status: status,
      response_code: responseCode,
      message: message,
      data: data,
    });
};
