import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WorkspaceChannel {
  channel: ReturnType<typeof supabase.channel>;
  subscriberCount: number;
  onlineUserIds: Set<string>;
  listeners: Set<() => void>;
}

const workspaceChannels = new Map<string, WorkspaceChannel>();

export function useGlobalPresence(): Set<string> {
  const { user, currentWorkspaceId } = useAuth();
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user || !currentWorkspaceId) {
      setOnlineUserIds(new Set());
      return;
    }

    if (!workspaceChannels.has(currentWorkspaceId)) {
      const channel = supabase.channel(`global-presence-${currentWorkspaceId}`, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      const entry: WorkspaceChannel = {
        channel,
        subscriberCount: 0,
        onlineUserIds: new Set<string>(),
        listeners: new Set<() => void>(),
      };

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const ids = new Set<string>();
          Object.values(state).forEach((presences) => {
            (presences as unknown as Array<{ userId: string }>).forEach((p) => {
              if (p.userId !== user.id) {
                ids.add(p.userId);
              }
            });
          });
          entry.onlineUserIds = ids;
          entry.listeners.forEach((fn) => fn());
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

      workspaceChannels.set(currentWorkspaceId, entry);
    }

    const entry = workspaceChannels.get(currentWorkspaceId)!;
    entry.subscriberCount++;

    const listener = () => {
      setOnlineUserIds(new Set(entry.onlineUserIds));
    };
    entry.listeners.add(listener);
    setOnlineUserIds(new Set(entry.onlineUserIds));

    return () => {
      entry.subscriberCount--;
      entry.listeners.delete(listener);

      if (entry.subscriberCount <= 0) {
        supabase.removeChannel(entry.channel);
        workspaceChannels.delete(currentWorkspaceId);
      }
    };
  }, [user, currentWorkspaceId]);

  return onlineUserIds;
}
