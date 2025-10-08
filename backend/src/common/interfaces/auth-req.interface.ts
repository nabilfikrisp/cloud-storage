import { Request } from "express";

export interface AuthReq extends Request {
  user: {
    sub: string;
    username: string;
  };
}
