process.env.PATH = `${process.env.PATH}:${process.env.LAMBDA_TASK_ROOT}`;
const wkhtmltopdf = require("./utils/wkhtmltopdf");
const errorUtil = require("./utils/error");

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    if (!body?.html) {
      const errorResponse = errorUtil.createErrorResponse(
        400,
        "Validation error: Missing field 'html'."
      );
      return {
        statusCode: 400,
        body: JSON.stringify(errorResponse),
        headers: {
          "Content-Type": "application/json",
        },
      };
    }

    const filename = body.filename || "document.pdf";

    const buffer = await wkhtmltopdf(body.html, body.options);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${filename}`,
      },
      body: buffer.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (error) {
    const errorResponse = errorUtil.createErrorResponse(
      500,
      "Internal server error",
      error
    );
    return {
      statusCode: 500,
      body: JSON.stringify(errorResponse),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
};
