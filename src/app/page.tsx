import prisma from "@/lib/db";

const Page = async () => {
  const posts = await prisma.post.findMany();
  return (
    <div>
      <h1>Users</h1>
      <ul>{JSON.stringify(posts)}</ul>
    </div>
  );
};

export default Page;
