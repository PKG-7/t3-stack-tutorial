import { filterUserForClient } from "./../../helpers/filterUserForClient";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { createTRPCRouter } from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }
      return filterUserForClient(user);
    }),
});
