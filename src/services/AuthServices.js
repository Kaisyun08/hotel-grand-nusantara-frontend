const API_BASE_URL = 'http://192.168.1.103:3000/api/auth'

export const AuthServices = {
  // register untuk user
  register: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registerasi gagal!");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Login admin/user
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Email atau password salah!");
      }

      // Tangkap objek baik dari data.user maupun data.admin
      const loggedInAccount = data.user || data.admin || (data.id_admin ? data : null);

      if (loggedInAccount) {
        // Pastikan properti role terisi 'admin' jika akun berasal dari tabel admin
        const normalizedAccount = {
          ...loggedInAccount,
          role:
            loggedInAccount.role ||
            (data.admin || loggedInAccount.id_admin ? "admin" : "tamu"),
        };

        sessionStorage.setItem("user", JSON.stringify(normalizedAccount));
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get user dari sessionStorage
  getCurrentUser: () => {
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // logout
  logout: () => {
    sessionStorage.removeItem("user");
  }
}