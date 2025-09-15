export interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
    name: string;
    role: string;
    status: string;
  };
}
