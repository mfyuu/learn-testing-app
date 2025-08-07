"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

	return (
		<>
			<Card className={`${todo.completed ? "opacity-60" : ""} p-3`}>
				<div className="flex items-center gap-3">
					<Checkbox
						checked={todo.completed}
						onCheckedChange={handleToggleComplete}
						disabled={isToggling || isDeleting}
					/>
					<div className="flex-1 min-w-0">
						<h3
							className={`font-semibold ${
								todo.completed ? "line-through text-muted-foreground" : ""
							}`}
						>
							{todo.title}
						</h3>
						{todo.description && (
							<p className="text-sm text-muted-foreground">
								{todo.description}
							</p>
						)}
					</div>
					<div className="flex items-center gap-1">
						<Button
							size="icon"
							variant="ghost"
							onClick={() => setIsEditOpen(true)}
							disabled={isDeleting}
							className="h-8 w-8"
						>
							<Pencil className="h-4 w-4" />
						</Button>
						<Button
							size="icon"
							variant="ghost"
							onClick={handleDelete}
							disabled={isDeleting}
							className="h-8 w-8 hover:bg-destructive/10"
						>
							<Trash2 className="h-4 w-4 text-destructive" />
						</Button>
					</div>
				</div>
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
