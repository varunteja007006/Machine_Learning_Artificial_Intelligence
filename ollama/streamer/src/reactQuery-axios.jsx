// src/StreamResponse.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQueryClient, useQuery } from "react-query";

const fetchStream = async () => {
  const response = await axios.post(
    "http://localhost:11434/api/generate",
    {
      model: "llava:13b",
      prompt: "Why is the sky blue?",
    },
    {
      responseType: "stream",
    }
  );

  const reader = response.data.getReader();
  const decoder = new TextDecoder("utf-8");

  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  return result;
};

const useStreamQuery = () => {
  return useQuery("streamResponse", fetchStream, {
    enabled: false, // initially don't fetch
    refetchOnWindowFocus: false,
  });
};

// Axios example
// const response = await axios.get(`https://stream.example.com`, {
//   headers: {Authorization: `Bearer ${token}`},
//   responseType: 'stream'
// });
// const stream = response.data
// stream.on('data', data => {
//   data = data.toString()
//   console.log(data)
// })

const StreamResponse = () => {
  const queryClient = useQueryClient();
  const [response, setResponse] = useState("");
  const { data, refetch, isFetching } = useStreamQuery();

  useEffect(() => {
    if (data) {
      setResponse(data);
    }
  }, [data]);

  const handleFetch = async () => {
    await queryClient.resetQueries("streamResponse"); // reset previous query data
    refetch();
  };

  return (
    <div>
      <button onClick={handleFetch} disabled={isFetching}>
        {isFetching ? "Fetching..." : "Fetch Response"}
      </button>
      <p>{response}</p>
    </div>
  );
};

export default StreamResponse;
