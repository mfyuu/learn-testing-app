"use client";

import { useTodos } from "@/lib/hooks/useTodos";
import { TodoItem } from "./TodoItem";

export function TodoList() {
	const { todos, isLoading, error, mutate } = useTodos();

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-8">
				<p className="text-muted-foreground">読み込み中...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center py-8">
				<p className="text-destructive">
					エラーが発生しました: {error.message}
				</p>
			</div>
		);
	}

	if (todos.length === 0) {
		return (
			<div className="flex justify-center items-center py-8">
				<p className="text-muted-foreground">
					TODOがありません。新しいTODOを作成してください。
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{todos.map((todo) => (
				<TodoItem key={todo.id} todo={todo} onUpdate={() => mutate()} />
			))}
		</div>
	);
}
