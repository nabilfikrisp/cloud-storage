import { User } from "@prisma/client";
import { Request } from "express";
import { JwtPayload } from "./jwt-payload.interface";

export interface AuthReq extends Request {
  user: JwtPayload;
}

export interface GoogleCallbackReq extends Request {
  user: User;
}
