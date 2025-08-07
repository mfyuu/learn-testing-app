"use client";

import { TodoForm } from "@/components/todo/TodoForm";
import { TodoList } from "@/components/todo/TodoList";

export default function Home() {
	return (
		<main className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="space-y-8">
				<div>
					<h1 className="text-3xl font-bold mb-2">TODOアプリケーション</h1>
					<p className="text-muted-foreground">
						タスクを管理して生産性を向上させましょう
					</p>
				</div>

				<TodoForm />

				<TodoList />
			</div>
		</main>
	);
}
