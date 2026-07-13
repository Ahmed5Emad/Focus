import { useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";

export interface SearchResult {
  result_type: "task" | "project" | "goal" | "document";
  result_id: string;
  title: string;
  description: string | null;
  url: string;
  rank: number;
}

export function useGlobalSearch() {
  const { currentWorkspaceId } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || !currentWorkspaceId) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await supabase
          .rpc('global_search', { p_workspace_id: currentWorkspaceId, p_query: query });
        setResults((data ?? []) as SearchResult[]);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, [currentWorkspaceId]);

  return { results, isSearching, search };
}
