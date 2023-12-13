"use client";

import useSWR from "swr";

import { useEffect } from "react";
import { usePocketBase } from "../lib/contexts/PocketBaseContext";

export const HomeClient: React.FC = () => {
  const pb = usePocketBase();

  useEffect(() => {
    console.log("pb.authStore =", pb.authStore);
  }, [pb.authStore]);

  const { data, error } = useSWR("test/list", () =>
    pb.collection("test").getFullList({
      sort: "-created",
    })
  );

  return (
    <div>
      <pre className="text-xs">
        test/list: {JSON.stringify({ data, error }, null, 2)}
      </pre>

      <br />

      <button
        onClick={() =>
          pb.collection("test").create({ label: new Date().toISOString() })
        }
      >
        Add test
      </button>

      <br />
      <br />

      <button
        onClick={async () => {
          const authData = await pb
            .collection("users")
            .authWithOAuth2({ provider: "discord" });

          console.log("authData =", authData);

          const toto = await fetch("https://discord.com/api/users/@me", {
            method: "get",
            headers: { Authorization: `Bearer ${authData.meta?.accessToken}` },
          });

          console.log("toto =", toto);
        }}
      >
        Connexion avec Discord
      </button>
    </div>
  );
};
