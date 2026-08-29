const BASE_URL = 'http://localhost:3001';

export async function getUsers() {
  const response = await fetch(`${BASE_URL}/`);
  if (!response.ok) {
    throw new Error('Erro ao buscar usuários');
  }
  return response.json();
}

export async function getProjects() {
  const response = await fetch(`${BASE_URL}/`);
  if (!response.ok) {
    throw new Error('Erro ao projetos');
  }
  return response.json();
}