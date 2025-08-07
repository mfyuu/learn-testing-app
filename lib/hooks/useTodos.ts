"use client";

import useSWR from "swr";
import { apiClient } from "@/lib/api/client";
import type { components } from "@/lib/api/types";

export type Todo = components["schemas"]["Todo"];

const fetcher = async () => {
	const response = await apiClient.GET("/api/todos");
	if (!response.data) {
		throw new Error("Failed to fetch todos");
	}
	return response.data;
};

export function useTodos() {
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
