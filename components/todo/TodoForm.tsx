"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTodoMutations } from "@/lib/hooks/useTodoMutations";

interface TodoFormProps {
	onSuccess?: () => void;
}

export function TodoForm({ onSuccess }: TodoFormProps) {
	const { createTodo } = useTodoMutations();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim()) {
			return;
		}

		setIsSubmitting(true);
		try {
			await createTodo({
				title: title.trim(),
				description: description.trim() || undefined,
			});

			// フォームをリセット
			setTitle("");
			setDescription("");

			onSuccess?.();
		} catch (error) {
			console.error("Failed to create todo:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>新規TODO作成</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">タイトル *</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="タスクのタイトルを入力"
							required
							disabled={isSubmitting}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">説明</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="タスクの詳細を入力"
							disabled={isSubmitting}
						/>
					</div>

					<Button type="submit" disabled={isSubmitting || !title.trim()}>
						{isSubmitting ? "作成中..." : "作成"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
