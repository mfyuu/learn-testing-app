import { renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import createClient from "openapi-fetch";
import { mutate } from "swr";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import type { paths } from "../api/types";
import { useTodoMutations } from "./useTodoMutations";

// SWRのmutate関数をモック
vi.mock("swr", async () => {
	const actual = await vi.importActual("swr");
	return {
		...actual,
		mutate: vi.fn(),
	};
});

// 定数
const BASE_URL = "https://learn-testing-api.mfyuu.workers.dev";

// MSWサーバーのセットアップ
const server = setupServer();

beforeAll(() => {
	server.listen({
		onUnhandledRequest: (request) => {
			throw new Error(
				`No request handler found for ${request.method} ${request.url}`,
			);
		},
	});
});

afterEach(() => {
	server.resetHandlers();
	vi.clearAllMocks();
});

afterAll(() => server.close());

describe("useTodoMutations", () => {
	let client: ReturnType<typeof createClient<paths>>;

	beforeEach(() => {
		client = createClient<paths>({
			baseUrl: BASE_URL,
		});
		vi.clearAllMocks();
	});

	describe("初期状態", () => {
		it("すべてのmutation関数が定義されている", () => {
			const { result } = renderHook(() => useTodoMutations(client));

			expect(result.current.createTodo).toBeDefined();
			expect(result.current.updateTodo).toBeDefined();
			expect(result.current.deleteTodo).toBeDefined();
			expect(result.current.toggleTodoComplete).toBeDefined();
		});
	});

	describe("createTodo", () => {
		it("成功時: Todoが作成され、mutateが呼ばれる", async () => {
			const newTodo = {
				id: "new-id",
				title: "新しいTodo",
				completed: false,
				createdAt: "2024-01-01T00:00:00.000Z",
				updatedAt: "2024-01-01T00:00:00.000Z",
			};

			const input = {
				title: "新しいTodo",
			};

			server.use(
				http.post(`${BASE_URL}/api/todos`, async ({ request }) => {
					// 【学習用解説】MSWのモック設定とリクエスト検証
					// ここはモックレスポンスの設定が主目的だが、
					// ついでにリクエストボディが正しく送信されているかも検証できる
					const body = await request.json();
					expect(body).toEqual(input); // 送信データの検証（オプショナル）
					return HttpResponse.json(newTodo, { status: 201 }); // モックレスポンス
				}),
			);

			// 【学習用解説】renderHookの役割
			// renderHookは「コンポーネントなしでフックをテストする」ための仕組み
			// 実コンポーネント: const { createTodo } = useTodoMutations();
			// テスト版: const { result } = renderHook(() => useTodoMutations(client));
			// result.currentが実コンポーネントでの{ createTodo }に相当する
			const { result } = renderHook(() => useTodoMutations(client));

			// 【学習用解説】実際のAPI呼び出し
			// ここで実際にcreateTodo関数を実行している
			// 内部でapiClient.POST("/api/todos", { body: input })が実行される
			// ただし、MSWがリクエストをインターセプトしてモックレスポンスを返すため、
			// 実際のネットワーク通信は発生しない
			const createdTodo = await result.current.createTodo(input);

			expect(createdTodo).toEqual(newTodo);
			expect(mutate).toHaveBeenCalledWith("/api/todos");
		});

		it("HTTPエラー（400）: バリデーションエラー", async () => {
			// 【学習用解説】このテストの重要性：
			// 1. エラーハンドリングの実装確認: useTodoMutations内の「if (!response.data)」が正しく動作するか
			// 2. 適切なエラーメッセージ: ユーザーに分かりやすいエラーメッセージがthrowされるか
			// 3. 副作用の防止: エラー時にmutate（キャッシュ更新）を呼ばないことを確認
			// このテストがないと、エラーを握りつぶしたり、エラー時にもキャッシュを壊したりする実装になってしまう可能性がある

			const errorResponse = {
				error: "Validation failed",
				details: "Title is required",
			};

			server.use(
				http.post(`${BASE_URL}/api/todos`, () => {
					return HttpResponse.json(errorResponse, { status: 400 });
				}),
			);

			const { result } = renderHook(() => useTodoMutations(client));

			await expect(result.current.createTodo({ title: "" })).rejects.toThrow(
				"Failed to create todo",
			);

			expect(mutate).not.toHaveBeenCalled();
		});

		it("HTTPエラー（500）: サーバーエラー", async () => {
			// 【学習用解説】サーバーエラー時の挙動確認
			// APIサーバーが500を返した場合、useTodoMutationsが
			// "Failed to create todo"という分かりやすいエラーメッセージでthrowすることを確認
			// （これがエラーハンドリング：生のエラーではなく、意味のあるメッセージに変換）

			server.use(
				http.post(`${BASE_URL}/api/todos`, () => {
					return HttpResponse.json(
						{ error: "Internal Server Error" },
						{ status: 500 },
					);
				}),
			);

			const { result } = renderHook(() => useTodoMutations(client));

			await expect(
				result.current.createTodo({ title: "Test" }),
			).rejects.toThrow("Failed to create todo");

			expect(mutate).not.toHaveBeenCalled();
		});

		it("ネットワークエラー", async () => {
			// 【学習用解説】ネットワークエラーの透過的な伝播
			// useTodoMutationsはネットワークエラーをハンドリングせず、
			// openapi-fetchが投げる"Failed to fetch"エラーをそのまま通す
			// これにより、呼び出し側がエラーの種類を判別できる
			// （エラーを隠蔽しないことも重要な設計判断）

			server.use(
				http.post(`${BASE_URL}/api/todos`, () => {
					return HttpResponse.error();
				}),
			);

			const { result } = renderHook(() => useTodoMutations(client));

			await expect(
				result.current.createTodo({ title: "Test" }),
			).rejects.toThrow("Failed to fetch");

			expect(mutate).not.toHaveBeenCalled();
		});
	});

	describe("updateTodo", () => {
		it("成功時: Todoが更新され、mutateが呼ばれる", async () => {
			const updatedTodo = {
				id: "1",
				title: "更新されたTodo",
				completed: true,
			};

			const input = {
				title: "更新されたTodo",
				completed: true,
			};

			server.use(
				http.put(`${BASE_URL}/api/todos/:id`, async ({ request, params }) => {
					expect(params.id).toBe("1");
					const body = await request.json();
					expect(body).toEqual(input);
					return HttpResponse.json(updatedTodo, { status: 200 });
				}),
			);

			const { result } = renderHook(() => useTodoMutations(client));

			const updated = await result.current.updateTodo("1", input);

			expect(updated).toEqual(updatedTodo);
			expect(mutate).toHaveBeenCalledWith("/api/todos");
		});

		it("HTTPエラー（404）: Todo not found", async () => {
			const errorResponse = {
				error: "Not Found",
				message: "Todo with id '999' not found",
			};

			server.use(
				http.put(`${BASE_URL}/api/todos/:id`, () => {
					return HttpResponse.json(errorResponse, { status: 404 });
				}),
			);

			const { result } = renderHook(() => useTodoMutations(client));

			await expect(
				result.current.updateTodo("999", { title: "Test" }),
			).rejects.toThrow("Failed to update todo");

			expect(mutate).not.toHaveBeenCalled();
		});

		it("HTTPエラー（500）: サーバーエラー", async () => {
			server.use(
				http.put(`${BASE_URL}/api/todos/:id`, () => {
					return HttpResponse.json(
						{ error: "Internal Server Error" },
						{ status: 500 },
					);
				}),
			);

			const { result } = renderHook(() => useTodoMutations(client));

			await expect(
				result.current.updateTodo("1", { title: "Test" }),
			).rejects.toThrow("Failed to update todo");

			expect(mutate).not.toHaveBeenCalled();
		});

		it("ネットワークエラー", async () => {
			server.use(
				http.put(`${BASE_URL}/api/todos/:id`, () => {
					return HttpResponse.error();
				}),
			);

			const { result } = renderHook(() => useTodoMutations(client));

			await expect(
				result.current.updateTodo("1", { title: "Test" }),
			).rejects.toThrow("Failed to fetch");

			expect(mutate).not.toHaveBeenCalled();
		});
	});

	describe("deleteTodo", () => {
		it("成功時: Todoが削除され、mutateが呼ばれる", async () => {
			server.use(
				http.delete(`${BASE_URL}/api/todos/:id`, ({ params }) => {
					expect(params.id).toBe("1");
					// DELETEの成功レスポンス（空のオブジェクトを返す）
					return HttpResponse.json({}, { status: 200 });
				}),
			);

			const { result } = renderHook(() => useTodoMutations(client));

			await result.current.deleteTodo("1");

			expect(mutate).toHaveBeenCalledWith("/api/todos");
		});

		it("HTTPエラー（404）: Todo not found", async () => {
			const errorResponse = {
				error: "Not Found",
				message: "Todo with id '999' not found",
			};

			server.use(
				http.delete(`${BASE_URL}/api/todos/:id`, () => {
					return HttpResponse.json(errorResponse, { status: 404 });
				}),
			);

			const { result } = renderHook(() => useTodoMutations(client));

			await expect(result.current.deleteTodo("999")).rejects.toThrow(
				"Failed to delete todo",
			);

			expect(mutate).not.toHaveBeenCalled();
		});

		it("HTTPエラー（500）: サーバーエラー", async () => {
			server.use(
				http.delete(`${BASE_URL}/api/todos/:id`, () => {
					return HttpResponse.json(
						{ error: "Internal Server Error" },
						{ status: 500 },
					);
				}),
			);

			const { result } = renderHook(() => useTodoMutations(client));

			await expect(result.current.deleteTodo("1")).rejects.toThrow(
				"Failed to delete todo",
			);

			expect(mutate).not.toHaveBeenCalled();
		});

		it("ネットワークエラー", async () => {
			server.use(
				http.delete(`${BASE_URL}/api/todos/:id`, () => {
					return HttpResponse.error();
				}),
			);

			const { result } = renderHook(() => useTodoMutations(client));

			await expect(result.current.deleteTodo("1")).rejects.toThrow(
				"Failed to fetch",
			);

			expect(mutate).not.toHaveBeenCalled();
		});
	});

	describe("toggleTodoComplete", () => {
		it("updateTodoを正しい引数で呼び出す", async () => {
			const todo = {
				id: "1",
				title: "テストTodo",
				completed: false,
				createdAt: "2024-01-01T00:00:00.000Z",
				updatedAt: "2024-01-01T00:00:00.000Z",
			};

			const updatedTodo = {
				...todo,
				completed: true,
			};

			server.use(
				http.put(`${BASE_URL}/api/todos/:id`, async ({ request, params }) => {
					expect(params.id).toBe("1");
					const body = await request.json();
					expect(body).toEqual({ completed: true });
					return HttpResponse.json(updatedTodo, { status: 200 });
				}),
			);

			const { result } = renderHook(() => useTodoMutations(client));

			const toggled = await result.current.toggleTodoComplete(todo);

			expect(toggled).toEqual(updatedTodo);
			expect(mutate).toHaveBeenCalledWith("/api/todos");
		});

		// NOTE: toggleTodoCompleteは内部でupdateTodoを呼び出すラッパー関数のため、
		// エラーケースなどの詳細なテストはupdateTodoのテストで網羅されています。
		// より詳細なテストが必要な場合は、updateTodoをモックして
		// 正しい引数で呼ばれているかを検証することも可能です。
	});
});
