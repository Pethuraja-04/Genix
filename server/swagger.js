const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("swagger-jsdoc");



app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerSpec))