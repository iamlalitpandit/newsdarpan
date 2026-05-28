import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    level: number;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    level: number;
  }
}
