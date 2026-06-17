import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "../routes/index";

const app = express();

app.use(cors());

app.use(helmet());

app.use(express.json());

app.use("/api", routes);

export default app;