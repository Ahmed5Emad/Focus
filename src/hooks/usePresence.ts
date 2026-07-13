import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PresenceUser {
  userId: string;
  displayName: string;
}

export function usePresence(location: string) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user || !location) return;

    const channelName = `presence-page-${location.replace(/\//g, '_')}-${Date.now()}`;

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: PresenceUser[] = [];
        Object.values(state).forEach((presences) => {
          (presences as unknown as PresenceUser[]).forEach((p) => {
            if (p.userId !== user.id) {
              users.push(p);
            }
          });
        });
        setOnlineUsers(users);
      })
      .on("presence", { event: "join" }, () => {
        const state = channel.presenceState();
        const users: PresenceUser[] = [];
        Object.values(state).forEach((presences) => {
          (presences as unknown as PresenceUser[]).forEach((p) => {
            if (p.userId !== user.id) {
              users.push(p);
            }
          });
        });
        setOnlineUsers(users);
      })
      .on("presence", { event: "leave" }, () => {
        const state = channel.presenceState();
        const users: PresenceUser[] = [];
        Object.values(state).forEach((presences) => {
          (presences as unknown as PresenceUser[]).forEach((p) => {
            if (p.userId !== user.id) {
              users.push(p);
            }
          });
        });
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const displayName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Anonymous";

          await channel.track({
            userId: user.id,
            displayName,
          });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      setOnlineUsers([]);
    };
  }, [user, location]);

  return {
    onlineUsers,
    userCount: onlineUsers.length,
  };
}
