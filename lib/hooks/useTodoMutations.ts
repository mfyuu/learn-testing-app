"use client";

import { mutate } from "swr";
import { apiClient } from "@/lib/api/client";
import type { components } from "@/lib/api/types";

type CreateTodoInput = components["schemas"]["CreateTodo"];
type UpdateTodoInput = components["schemas"]["UpdateTodo"];
type Todo = components["schemas"]["Todo"];

export function useTodoMutations() {
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

		if (response.error) {
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
