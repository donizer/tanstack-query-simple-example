import "./App.css";

import { useQuery } from "@tanstack/react-query";
import { UserSchema, type User } from "@demo/shared";
import { z } from "zod";

const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch("http://localhost:3001/api/users");
  const data = await res.json();
  // Optional: Use schema to validate API response for extra safety
  return z.array(UserSchema).parse(data);
};

function App() {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  if (usersQuery.isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Users</h1>

      <ul>
        {usersQuery.data?.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
