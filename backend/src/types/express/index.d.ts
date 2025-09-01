// This declaration file augments the existing Express types.
declare namespace Express {
  export interface Request {
    user?: {
      id: string;
    }
  }
}