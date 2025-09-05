import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import createClient from "openapi-fetch";
import { createElement, type ReactNode } from "react";
import { SWRConfig } from "swr";
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
import { useTodos } from "./useTodos";

// 定数
const BASE_URL = "https://learn-testing-api.mfyuu.workers.dev";

// MSWサーバーのセットアップ
const server = setupServer();

// SWRのテスト用ラッパー - 各テストで独立したキャッシュを使用
const createWrapper = () => {
	return ({ children }: { children: ReactNode }) => {
		return createElement(
			SWRConfig,
			{ value: { provider: () => new Map() } },
			children,
		);
	};
};

beforeAll(() => {
	server.listen({
		onUnhandledRequest: (request) => {
			throw new Error(
				`No request handler found for ${request.method} ${request.url}`,
			);
		},
	});
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("useTodos: wrapperにcreateElementを使用", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("初期状態", () => {
		it("空のtodos配列とisLoading: trueを返す", () => {
			// APIクライアントなしで初期状態をテスト
			const { result } = renderHook(() => useTodos(), {
				wrapper: createWrapper(),
			});

			expect(result.current.isLoading).toBe(true);
			expect(result.current.todos).toEqual([]);
			expect(result.current.error).toBeUndefined();
			expect(result.current.mutate).toBeDefined();
		});
	});

	describe("データ取得成功時", () => {
		it("正しいtodosを返す", async () => {
			const mockTodos = [
				{ id: "1", title: "テストTodo1", completed: false },
				{ id: "2", title: "テストTodo2", completed: true },
			];

			server.use(
				http.get(`${BASE_URL}/api/todos`, () => {
					return HttpResponse.json(mockTodos, { status: 200 });
				}),
			);

			const client = createClient<paths>({
				baseUrl: BASE_URL,
			});

			const { result } = renderHook(() => useTodos(client), {
				wrapper: createWrapper(),
			});

			// 初期状態ではisLoading: true
			expect(result.current.isLoading).toBe(true);

			// データ取得後の状態を検証
			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.todos).toEqual(mockTodos);
			expect(result.current.error).toBeUndefined();
		});
	});

	describe("エラーハンドリング", () => {
		it("HTTPエラー（500）時に意図したメッセージでエラーがスローされる", async () => {
			server.use(
				http.get(`${BASE_URL}/api/todos`, () => {
					return HttpResponse.json(
						{ message: "Internal Server Error" },
						{ status: 500 },
					);
				}),
			);

			const client = createClient<paths>({
				baseUrl: BASE_URL,
			});

			const { result } = renderHook(() => useTodos(client), {
				wrapper: createWrapper(),
			});

			expect(result.current.isLoading).toBe(true);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.todos).toEqual([]);
			expect(result.current.error).toBeDefined();
			expect(result.current.error?.message).toBe("Failed to fetch todos");
		});

		it("ネットワークエラー時にエラーが設定される", async () => {
			server.use(
				http.get(`${BASE_URL}/api/todos`, () => {
					return HttpResponse.error();
				}),
			);

			const client = createClient<paths>({
				baseUrl: BASE_URL,
			});

			const { result } = renderHook(() => useTodos(client), {
				wrapper: createWrapper(),
			});

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.todos).toEqual([]);
			expect(result.current.error).toBeDefined();
			// ネットワークエラーの場合はFetch APIの標準メッセージ
			expect(result.current.error?.message).toBe("Failed to fetch");
		});
	});
});
