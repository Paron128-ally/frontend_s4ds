import { UserRole } from "@/types";

export interface UserSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
  };
  expires: string;
}

export const DEFAULT_USER: UserSession["user"] = {
  id: "usr-auditor-01",
  name: "Jane Doe",
  email: "jane.doe@knowcode.internal",
  role: "auditor",
};

export function getSession(): UserSession {
  return {
    user: DEFAULT_USER,
    expires: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  };
}
