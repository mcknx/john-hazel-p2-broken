import { notFound } from "next/navigation";
import { getUserById } from "@/lib/users";
import UserDetail from "./UserDetail";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params
  const user = getUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="max-w-xl mx-auto">
      <UserDetail user={user} />
    </div>
  );
}

