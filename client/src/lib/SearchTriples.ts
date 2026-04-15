import { globalSearch } from "@0xintuition/sdk";

export async function searchTriples(query: string) {
  if (!query.trim()) return [];

  const results = await globalSearch(query, {
    triplesLimit: 20,
    atomsLimit: 0,
    accountsLimit: 0,
    collectionsLimit: 0,
  });

  return (
    results?.triples?.map((t: any) => ({
      term_id: t.id,
      term: {
        triple: {
          subject: {
            label: t.subject?.label ?? "-",
            image: t.subject?.image ?? "",
          },
          predicate: {
            label: t.predicate?.label ?? "-",
          },
          object: {
            label: t.object?.label ?? "-",
          },
        },
      },
    })) ?? []
  );
}