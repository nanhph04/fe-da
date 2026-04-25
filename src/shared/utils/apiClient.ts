/**
 * API Client sử dụng Native Fetch
 * Xử lý gán token, credentials (cho httpOnly cookie), 
 * và cơ chế tự động gọi refresh token khi nhận lỗi 401.
 */

const GATEWAY_URL = typeof window !== "undefined" 
  ? "" 
  : (process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080");

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

// Giả lập lấy token từ localStorage (hoặc có thể dùng closure/state management)
// Khuyến khích quản lý bằng AuthContext, nhưng để retry ở tầng fetch thì localStorage tiện hơn.
const getLocalAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

const setLocalAccessToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
};

const clearLocalAccessToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
};

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  data: T;
  mess: string;
  errors?: string[];
}

interface CustomRequestInit extends RequestInit {
  requireAuth?: boolean;
}

export const fetchWrapper = async <T = any>(
  endpoint: string,
  options: CustomRequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = endpoint.startsWith("http") ? endpoint : `${GATEWAY_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  // Gắn Access Token nếu là protected route
  if (options.requireAuth) {
    const token = getLocalAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Luôn gửi credentials để cho phép cookie (refresh_token) đi theo
  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  try {
    const response = await fetch(url, config);
    
    // Nếu lỗi 401 (Hết hạn Token hoặc Token không hợp lệ)
    if (response.status === 401 && options.requireAuth) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${GATEWAY_URL}/api/auth/refresh`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            }
          });

          const refreshData = await refreshRes.json();
          if (refreshData.success && refreshData.data?.accessToken) {
            const newToken = refreshData.data.accessToken;
            setLocalAccessToken(newToken);
            isRefreshing = false;
            onRefreshed(newToken);
            
            // Thực hiện lại Request gốc với token mới
            headers.set("Authorization", `Bearer ${newToken}`);
            const retryRes = await fetch(url, { ...config, headers });
            return retryRes.json();
          } else {
            throw new Error("Refresh failed");
          }
        } catch (error) {
          isRefreshing = false;
          clearLocalAccessToken();
          // Điều hướng về màn đăng nhập hoặc throw lỗi ra ngoài để UI xử lý
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }
      }

      // Nếu đang refresh dở, các request 401 khác sẽ đợi token mới
      return new Promise(resolve => {
        addRefreshSubscriber(token => {
          headers.set("Authorization", `Bearer ${token}`);
          resolve(fetch(url, { ...config, headers }).then(res => res.json()));
        });
      });
    }

    const data = await response.json();
    if (!response.ok) {
      return Promise.reject(data);
    }
    
    return data;
  } catch (error: any) {
    // Có thể là lỗi kết nối mạng (Network Error)
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      return Promise.reject({
        success: false,
        code: 503,
        mess: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.",
      });
    }
    return Promise.reject(error);
  }
};

export const api = {
  get: <T>(url: string, options?: CustomRequestInit) => fetchWrapper<T>(url, { ...options, method: "GET" }),
  post: <T>(url: string, body: any, options?: CustomRequestInit) => fetchWrapper<T>(url, { ...options, method: "POST", body: JSON.stringify(body) }),
  patch: <T>(url: string, body: any, options?: CustomRequestInit) => fetchWrapper<T>(url, { ...options, method: "PATCH", body: JSON.stringify(body) }),
  put: <T>(url: string, body: any, options?: CustomRequestInit) => fetchWrapper<T>(url, { ...options, method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(url: string, options?: CustomRequestInit) => fetchWrapper<T>(url, { ...options, method: "DELETE" }),
  setToken: setLocalAccessToken,
  getToken: getLocalAccessToken,
  clearToken: clearLocalAccessToken,
};
