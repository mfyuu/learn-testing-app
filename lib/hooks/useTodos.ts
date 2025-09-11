import type createClient from "openapi-fetch";
import useSWR from "swr";
import { apiClient as defaultApiClient } from "@/lib/api/client";
import type { components, paths } from "@/lib/api/types";

export type Todo = components["schemas"]["Todo"];

type ApiClient = ReturnType<typeof createClient<paths>>;

const createFetcher = (client: ApiClient) => async () => {
	const response = await client.GET("/api/todos");
	if (!response.data) {
		throw new Error("Failed to fetch todos");
	}
	return response.data;
};

export function useTodos(apiClient: ApiClient = defaultApiClient) {
	const fetcher = createFetcher(apiClient);
	const { data, error, isLoading, mutate } = useSWR<Todo[]>(
		"/api/todos",
		fetcher,
		{
			revalidateOnFocus: true,
			revalidateOnMount: true,
		},
	);

	return {
		todos: data ?? [],
		error,
		isLoading,
		mutate,
	};
}
