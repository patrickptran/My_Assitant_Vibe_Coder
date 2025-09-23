import { caller } from "@/trpc/server";

const Page = async () => {
  const data = await caller.createAI({ text: "from server" });
  console.log("data", data);
  // you can also test this endpoint in the browser:

  // localhost:3000/trpc/createAI?body={text:"My AI from tRPC"}
  return <div>{JSON.stringify(data)}</div>;
};

export default Page;
