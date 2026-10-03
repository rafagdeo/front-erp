const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, options = {}) {
  const headers = new Headers(options.headers)
  if (options.body) headers.set('Content-Type', 'application/json')

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })
  const payload = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.message || payload?.erro || 'Não foi possível concluir a operação.')
  }

  return payload
}

const json = (method, body) => ({ method, body: JSON.stringify(body) })

export const api = {
  login: (credentials) => request('/login', json('POST', credentials)),
  register: (data) => request('/register', json('POST', data)),
  me: () => request('/me'),
  updateProfile: (data) => request('/profile', json('PATCH', data)),
  logout: () => request('/logout', { method: 'POST' }),
  clients: () => request('/list-clients'),
  createClient: (data) => request('/create-client', json('POST', data)),
  updateClient: (id, data) => request(`/client/${id}`, json('PATCH', data)),
  deleteClient: (id) => request('/delete-client', json('POST', { id })),
  products: async () => (await request('/products')).products || [],
  createProduct: (data) => request('/create-product', json('POST', data)),
  updateProduct: (id, data) => request(`/product/${id}`, json('PATCH', data)),
  deleteProduct: (id) => request(`/product/${id}`, { method: 'DELETE' }),
  orders: async () => (await request('/orders')).orders || [],
  ordersByClient: async (id) => (await request(`/orders/client/${id}`)).orders || [],
  order: (id) => request(`/order/${id}`),
  createOrder: (data) => request('/create-order', json('POST', data)),
  updateOrder: (id, data) => request(`/order/${id}`, json('PATCH', data)),
}