import "dotenv/config";
import { createServer } from "node:http";
import express from "express";
import { workflowRouter, workflowRunRouter } from "./modules/workflows/workflow.routes";
import { initializeWorkflowEvents } from "./modules/workflows/services/workflow-events.service";

const app = express();
const server = createServer(app);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", frontendOrigin);
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "FlowForge API",
    status: "running",
  });
});

app.use("/workflows", workflowRouter);
app.use("/runs", workflowRunRouter);

const port = Number(process.env.PORT ?? 3001);

initializeWorkflowEvents(server);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
