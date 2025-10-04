import { HttpStatus } from "@nestjs/common";

export class SuccessResponse<T> {
  message: string;
  data: T;
  statusCode: number;

  constructor(params: { message: string; data: T; statusCode?: number }) {
    this.message = params.message;
    this.data = params.data;
    this.statusCode = params.statusCode ?? HttpStatus.OK;
  }
}
