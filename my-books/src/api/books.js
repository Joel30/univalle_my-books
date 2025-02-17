const API_BASE_URL = 'https://reactnd-books-api.udacity.com';
const API_AUTHORIZATION = 'reactnative_my-books';

export const getBooks = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/books`, {
            headers: { Authorization: API_AUTHORIZATION },
        });
        if (!response.ok) {
            throw new Error('Error en la carga de libros');
        }
        return await response.json();
    } catch (error) {
        console.error('Error getBooks:', error);
        return [];
    }
};

export const getBookById = async (bookId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
            headers: { Authorization: API_AUTHORIZATION },
        });
        if (!response.ok) {
            throw new Error('Error al obtener el libro');
        }
        return await response.json();
    } catch (error) {
        console.error('Error getBookById:', error);
        return false;
    }
};

export const searchBooks = async (query, maxResults) => {
    try {
        let body = {query};
        if (maxResults) {
            body.maxResults = maxResults
        }

        const response = await fetch(`${API_BASE_URL}/search`, {
            headers: {
                Authorization: API_AUTHORIZATION,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error('Error en la búsqueda de libros');
        } else {
            return await response.json();
        }
    } catch (error) {
        console.error('Error serachBooks:', error);
        return [];
    }
};