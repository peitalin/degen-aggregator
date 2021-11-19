import { checkEnv } from "./env-checker";
// import { dbCheckCanConnect } from "~/db/db";

const appIsHealthy = async (): Promise<boolean> => {
  // Check our env variables (tho probably fine if we got this far anyway)
  // NOTE: This will throw error and be logged etc if problematic
  checkEnv();

  // Prove we can connect to the database we rely on
  // NOTE: This will throw error if faulty
  // await dbCheckCanConnect();

  return true;
};

export default appIsHealthy;
