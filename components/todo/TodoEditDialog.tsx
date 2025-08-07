"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTodoMutations } from "@/lib/hooks/useTodoMutations";
import type { Todo } from "@/lib/hooks/useTodos";

interface TodoEditDialogProps {
	todo: Todo;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function TodoEditDialog({
	todo,
	open,
	onOpenChange,
	onSuccess,
}: TodoEditDialogProps) {
	const { updateTodo } = useTodoMutations();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [completed, setCompleted] = useState(false);

	useEffect(() => {
		if (open) {
			setTitle(todo.title);
			setDescription(todo.description || "");
			setCompleted(todo.completed);

			// 日付の変換（APIの形式から入力フィールドの形式へ）
			if (todo.dueDate) {
				const date = new Date(todo.dueDate);
				const localDate = new Date(
					date.getTime() - date.getTimezoneOffset() * 60000,
				);
				setDueDate(localDate.toISOString().slice(0, 16));
			} else {
				setDueDate("");
			}
		}
	}, [open, todo]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim()) {
			return;
		}

		setIsSubmitting(true);
		try {
			await updateTodo(todo.id, {
				title: title.trim(),
				description: description.trim() || undefined,
				dueDate: dueDate || undefined,
				completed,
			});

			onSuccess?.();
		} catch (error) {
			console.error("Failed to update todo:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>TODO編集</DialogTitle>
					<DialogDescription>TODOの内容を編集します</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="edit-title">タイトル *</Label>
						<Input
							id="edit-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="タスクのタイトルを入力"
							required
							disabled={isSubmitting}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="edit-description">説明</Label>
						<Textarea
							id="edit-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="タスクの詳細を入力"
							disabled={isSubmitting}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="edit-dueDate">期限</Label>
						<Input
							id="edit-dueDate"
							type="datetime-local"
							value={dueDate}
							onChange={(e) => setDueDate(e.target.value)}
							disabled={isSubmitting}
						/>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="edit-completed"
							checked={completed}
							onCheckedChange={(checked) => setCompleted(checked as boolean)}
							disabled={isSubmitting}
						/>
						<Label htmlFor="edit-completed">完了済み</Label>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							キャンセル
						</Button>
						<Button type="submit" disabled={isSubmitting || !title.trim()}>
							{isSubmitting ? "更新中..." : "更新"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
