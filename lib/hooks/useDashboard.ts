import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useDashboard() {
  return useSWR("/api/dashboard", fetcher);
}
