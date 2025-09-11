import type createClient from "openapi-fetch";
import { mutate } from "swr";
import { apiClient as defaultApiClient } from "@/lib/api/client";
import type { components, paths } from "@/lib/api/types";

type CreateTodoInput = components["schemas"]["CreateTodo"];
type UpdateTodoInput = components["schemas"]["UpdateTodo"];
type Todo = components["schemas"]["Todo"];

type ApiClient = ReturnType<typeof createClient<paths>>;

export function useTodoMutations(apiClient: ApiClient = defaultApiClient) {
	const createTodo = async (input: CreateTodoInput) => {
		const response = await apiClient.POST("/api/todos", {
			body: input,
		});

		if (!response.data) {
			throw new Error("Failed to create todo");
		}

		// SWRキャッシュを再検証
		await mutate("/api/todos");
		return response.data;
	};

	const updateTodo = async (id: string, input: UpdateTodoInput) => {
		const response = await apiClient.PUT("/api/todos/{id}", {
			params: {
				path: { id },
			},
			body: input,
		});

		if (!response.data) {
			throw new Error("Failed to update todo");
		}

		// SWRキャッシュを再検証
		await mutate("/api/todos");
		return response.data;
	};

	const deleteTodo = async (id: string) => {
		const response = await apiClient.DELETE("/api/todos/{id}", {
			params: {
				path: { id },
			},
		});

		if (!response.data) {
			throw new Error("Failed to delete todo");
		}

		// SWRキャッシュを再検証
		await mutate("/api/todos");
	};

	const toggleTodoComplete = async (todo: Todo) => {
		return updateTodo(todo.id, {
			completed: !todo.completed,
		});
	};

	return {
		createTodo,
		updateTodo,
		deleteTodo,
		toggleTodoComplete,
	};
}
