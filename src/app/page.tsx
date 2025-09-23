"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const Page = () => {
  const trpc = useTRPC();
  const { data, error, isLoading } = useQuery(
    trpc.createAI.queryOptions({ text: "My AI from tRPC" })
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // localhost:3000/trpc/createAI?body={text:"My AI from tRPC"}
  return (
    <div>
      <h1>{JSON.stringify(data)}</h1>
    </div>
  );
};

export default Page;
