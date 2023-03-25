import { SignedOut, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/Loading";
import { useState } from "react";
import toast from "react-hot-toast";
import PageLayout from "~/components/layout";
import { PostView } from "./PostView";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState<string>("");
  console.log(input);

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;

      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later");
      }
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-3 ">
      <Image
        className="h-14 w-14 rounded-full"
        src={user.profileImageUrl}
        alt="profile image"
        width={56}
        height={56}
      />
      <input
        type="text"
        placeholder="Type Emoji!"
        className="grow bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
        autoFocus
      />
      {input !== "" && !isPosting && (
        <button
          className="rounded-xl bg-blue-500 px-4"
          disabled={isPosting}
          onClick={() => mutate({ content: input })}
        >
          Post
        </button>
      )}

      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullpost) => (
        <PostView {...fullpost} key={fullpost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Fetch asap
  api.posts.getAll.useQuery();

  // Empty div if not loaded
  if (!userLoaded) return <div></div>;

  return (
    <PageLayout>
      <div className="border-b border-slate-400 p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {isSignedIn && <CreatePostWizard />}
      </div>

      <Feed />

      {/* <SignOutButton /> */}
    </PageLayout>
  );
};

export default Home;
