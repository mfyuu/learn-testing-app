"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useTodoMutations } from "@/lib/hooks/useTodoMutations";
import type { Todo } from "@/lib/hooks/useTodos";
import { TodoEditDialog } from "./TodoEditDialog";

interface TodoItemProps {
	todo: Todo;
	onUpdate?: () => void;
}

export function TodoItem({ todo, onUpdate }: TodoItemProps) {
	const { toggleTodoComplete, deleteTodo } = useTodoMutations();
	const [isDeleting, setIsDeleting] = useState(false);
	const [isToggling, setIsToggling] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);

	const handleToggleComplete = async () => {
		setIsToggling(true);
		try {
			await toggleTodoComplete(todo);
			onUpdate?.();
		} catch (error) {
			console.error("Failed to toggle todo:", error);
		} finally {
			setIsToggling(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm("このTODOを削除しますか？")) {
			return;
		}

		setIsDeleting(true);
		try {
			await deleteTodo(todo.id);
			onUpdate?.();
		} catch (error) {
			console.error("Failed to delete todo:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	const formatDate = (dateString: string | undefined) => {
		if (!dateString) return null;
		const date = new Date(dateString);
		return date.toLocaleString("ja-JP", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<>
			<Card className={todo.completed ? "opacity-60" : ""}>
				<CardHeader className="pb-3">
					<div className="flex items-start gap-3">
						<Checkbox
							checked={todo.completed}
							onCheckedChange={handleToggleComplete}
							disabled={isToggling || isDeleting}
							className="mt-1"
						/>
						<div className="flex-1">
							<h3
								className={`text-lg font-semibold ${
									todo.completed ? "line-through" : ""
								}`}
							>
								{todo.title}
							</h3>
							{todo.description && (
								<p className="text-sm text-muted-foreground mt-1">
									{todo.description}
								</p>
							)}
						</div>
					</div>
				</CardHeader>

				{todo.dueDate && (
					<CardContent className="py-0 pb-3">
						<p className="text-sm text-muted-foreground">
							期限: {formatDate(todo.dueDate)}
						</p>
					</CardContent>
				)}

				<CardFooter className="gap-2 pt-3">
					<Button
						size="sm"
						variant="outline"
						onClick={() => setIsEditOpen(true)}
						disabled={isDeleting}
					>
						編集
					</Button>
					<Button
						size="sm"
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						{isDeleting ? "削除中..." : "削除"}
					</Button>
				</CardFooter>
			</Card>

			<TodoEditDialog
				todo={todo}
				open={isEditOpen}
				onOpenChange={setIsEditOpen}
				onSuccess={() => {
					setIsEditOpen(false);
					onUpdate?.();
				}}
			/>
		</>
	);
}
