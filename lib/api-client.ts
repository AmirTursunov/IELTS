export class APIClient {
  private baseURL: string;

  constructor(baseURL: string = "/api") {
    this.baseURL = baseURL;
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getCookie("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async get(endpoint: string) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
      });
      return await response.json();
    } catch (error) {
      console.error("API GET error:", error);
      return { success: false, error: "Network error" };
    }
  }

  async post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("API POST error:", error);
      return { success: false, error: "Network error" };
    }
  }

  async put(endpoint: string, data: any) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("API PUT error:", error);
      return { success: false, error: "Network error" };
    }
  }

  async delete(endpoint: string) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
      });
      return await response.json();
    } catch (error) {
      console.error("API DELETE error:", error);
      return { success: false, error: "Network error" };
    }
  }
}

export const apiClient = new APIClient();
