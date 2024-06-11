import React, { useState, FormEvent } from "react";
import axios, { CancelTokenSource } from "axios";

interface User {
  email: string;
  number: string;
}

const SearchForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  let request: CancelTokenSource | undefined;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return;
    }

    const numberRegex = /^\d*$/;
    if (number && !numberRegex.test(number.replace(/-/g, ""))) {
      setError("Invalid number format");
      return;
    }

    setLoading(true);
    setError(null);

    if (request) {
      request.cancel();
    }

    request = axios.CancelToken.source();

    try {
      const response = await axios.post<User[]>(
        "http://localhost:3001/search",
        {
          email,
          number: number.replace(/-/g, ""),
        },
        {
          cancelToken: request.token,
        }
      );

      setResults(response.data);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Request canceled", err.message);
      } else {
        setError("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: string) => {
    return value.replace(/[^0-9]/g, "").replace(/(\d{2})(?=\d)/g, "$1-");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email: </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Number: </label>
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(formatNumber(e.target.value))}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <div>
        {results.map((user, index) => (
          <div key={index}>
            <p>Email: {user.email}</p>
            <p>Number: {user.number}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchForm;
