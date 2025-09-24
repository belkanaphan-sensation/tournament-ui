export const authApi = {

  //login
  async login(formData) {
    return await fetch(import.meta.env.VITE_API_BASE_URL + '/auth/login', {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
  },

  async logout() {
    return await fetch(import.meta.env.VITE_API_BASE_URL + '/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
  },
};