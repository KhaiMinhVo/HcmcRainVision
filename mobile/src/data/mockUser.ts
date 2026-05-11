interface User {
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

export const mockUser: User = {
  name: "Nguyen Van A",
  email: "a.nguyen@example.com",
  role: "Operator",
  avatarUrl: null,
};
