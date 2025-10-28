// src/actions/stream.actions.ts

import { apiService } from '../api/api'; // your wrapper that knows how to send auth headers, etc.

export const tokenProvider = async (): Promise<string> => {

  const appJwt = localStorage.getItem('authToken')
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


  // 2) Call your Express endpoint
  const res = await fetch(`${API_BASE_URL}/stream/token`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${appJwt}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Stream token (${res.status})`);
  }

  const { token: streamJwt } = await res.json();
  if (typeof streamJwt !== "string") {
    throw new Error("Invalid response from /stream/token");
  }

  return streamJwt;
};
