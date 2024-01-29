import { config } from "dotenv";
config();

export const env = {
  port: +(process.env.PORT || 3000),
  environment: process.env.NODE_ENV,
  db: {
    url: process.env.DATABASE_URL || "",
  },
  url: {
    base: process.env.BASE_URL,
  },
  auth: {
    username: process.env.AUTH_USERNAME,
    password: process.env.AUTH_PASSWORD,
  },
};
