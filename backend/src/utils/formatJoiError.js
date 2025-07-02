function FormatJoiErrors(errorDetails) {
    return errorDetails.map((err) => ({
      field: err.path[0],
      message: err.message.replace(/['"]+/g, '')
    }));
}

module.exports = FormatJoiErrors;