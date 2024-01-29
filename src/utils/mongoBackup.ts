import path from "path";
import { spawn } from "child_process";
import cron from "node-cron";
import { env } from "../config/env";
import { logger } from "../config/winston";

const mongoBackup = (command: string) => {
  const dbName = env.db.url.split("/").at(-1);
  const archivePath = path.join(__dirname, "../../mongoBackup", `backup.gzip`);

  let theCommand = "";
  let msg = "";
  // check if required action is backup
  if (command === "backup") {
    theCommand = "mongodump";
    msg = "Backup Successful..";
  }
  // check if required action is restore
  if (command === "restore") {
    theCommand = "mongorestore";
    msg = "Restored Successful";
  }
  let commands = [];
  if (command === "backup") commands.push(`--db=${dbName}`);
  if (command === "restore") {
    commands.push(`--nsFrom=test.*`);
    commands.push(`--nsTo=${dbName}.*`);
  }
  const child = spawn(theCommand, [
    "--host=127.0.0.1",
    "--port=27017",
    ...commands,
    `--archive=${archivePath}`,
    "--gzip",
  ]);
  child.stdout.on("data", () => {});
  child.stderr.on("data", () => {});
  child.on("error", (error) => {
    console.log("error:\n", error);
    logger.error(error);
  });
  child.on("exit", (code, signal) => {
    if (code) console.log("Process exit with code: ", code);
    else if (signal) console.log("Process Killed with signal: ", signal);
    else {
      logger.info(msg);
    }
  });
};

export const startBackup = (options: {
  restoreBackupDB: boolean;
  backupContinuouslyDB: boolean;
  backupOnceDB: boolean;
}) => {
  if (options.restoreBackupDB) mongoBackup("restore");
  if (options.backupOnceDB) mongoBackup("backup");
  if (options.backupContinuouslyDB) {
    cron.schedule("*/5 * * * *", () => mongoBackup("backup"));
  }
};
