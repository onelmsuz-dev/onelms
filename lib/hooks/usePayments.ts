import useSWR from "swr";
import useSWRMutation from "swr/mutation";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

async function poster(url: string, { arg }: { arg: unknown }) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!r.ok) throw await r.json();
  return r.json();
}

export function usePayments(params?: { studentId?: string; groupId?: string }) {
  const query = new URLSearchParams();
  if (params?.studentId) query.set("studentId", params.studentId);
  if (params?.groupId)   query.set("groupId",   params.groupId);
  const qs = query.toString();
  return useSWR(`/api/payments${qs ? `?${qs}` : ""}`, fetcher);
}

export function useCreatePayment() {
  return useSWRMutation("/api/payments", poster);
}
