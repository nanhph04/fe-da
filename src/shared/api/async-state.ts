export type AsyncStatus = "idle" | "loading" | "success" | "error";

export type AsyncState<T> = {
  status: AsyncStatus;
  data: T;
  error: string | null;
};

export const createAsyncState = <T>(data: T): AsyncState<T> => ({
  status: "idle",
  data,
  error: null,
});

export const isAsyncLoading = <T>(state: AsyncState<T>) =>
  state.status === "idle" || state.status === "loading";

export const isAsyncSuccess = <T>(state: AsyncState<T>) =>
  state.status === "success";

export const isAsyncError = <T>(state: AsyncState<T>) =>
  state.status === "error";
