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
  if (typeof window !== "undefined") {
    const storedRole = localStorage.getItem("knowcode_user_role") as UserRole | null;
    const storedName = localStorage.getItem("knowcode_user_name");
    const storedEmail = localStorage.getItem("knowcode_user_email");

    return {
      user: {
        id: "usr-session-01",
        name: storedName || DEFAULT_USER.name,
        email: storedEmail || DEFAULT_USER.email,
        role: storedRole || DEFAULT_USER.role,
      },
      expires: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    };
  }

  return {
    user: DEFAULT_USER,
    expires: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  };
}

export function switchUserRole(role: UserRole) {
  if (typeof window !== "undefined") {
    localStorage.setItem("knowcode_user_role", role);
  }
}
