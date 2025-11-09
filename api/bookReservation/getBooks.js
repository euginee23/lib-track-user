import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

/**
 * Books API Service
 * Provides functions to fetch and manage books data
 */

/**
 * Fetch all books from the server
 * @returns {Promise<Object>} API response with books data
 */
export const fetchAllBooks = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/books`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all books:', error);
    throw new Error(`Failed to fetch books: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Fetch books grouped by batch_registration_key
 * Each group represents a book title with multiple copies
 * @returns {Promise<Array>} Array of grouped books
 */
export const getGroupedBooks = async () => {
  try {
    const response = await fetchAllBooks();
    
    if (!response.success || !response.data) {
      throw new Error('Invalid response format from server');
    }

    // Group books by batch_registration_key
    const groupedBooks = {};
    
    response.data.forEach(book => {
      const key = book.batch_registration_key;
      
      if (!groupedBooks[key]) {
        // Create new group with the first book's data
        groupedBooks[key] = {
          batch_registration_key: key,
          book_title: book.book_title,
          author: book.author,
          genre: book.genre,
          genre_id: book.genre_id,
          publisher: book.publisher,
          publisher_id: book.publisher_id,
          book_edition: book.book_edition,
          book_year: book.book_year,
          book_price: book.book_price,
          book_donor: book.book_donor,
          book_cover: book.book_cover,
          shelf_number: book.shelf_number,
          shelf_column: book.shelf_column,
          shelf_row: book.shelf_row,
          isUsingDepartment: book.isUsingDepartment,
          created_at: book.created_at,
          average_rating: book.average_rating,
          total_ratings: book.total_ratings,
          reviews: book.reviews || [],
          copies: [],
          totalCopies: 0,
          availableCopies: 0,
          borrowedCopies: 0,
          reservedCopies: 0,
          removedCopies: 0
        };
      }

      // Add individual copy to the group
      groupedBooks[key].copies.push({
        book_id: book.book_id,
        book_number: book.book_number,
        book_qr: book.book_qr,
        status: book.status,
        created_at: book.created_at
      });

      // Update counters
      groupedBooks[key].totalCopies++;
      
      switch (book.status?.toLowerCase()) {
        case 'available':
          groupedBooks[key].availableCopies++;
          break;
        case 'borrowed':
          groupedBooks[key].borrowedCopies++;
          break;
        case 'reserved':
          groupedBooks[key].reservedCopies++;
          break;
        case 'removed':
          groupedBooks[key].removedCopies++;
          break;
        default:
          // Assume available if status is unclear
          groupedBooks[key].availableCopies++;
      }
    });

    // Convert object to array and sort by creation date (newest first)
    const groupedArray = Object.values(groupedBooks)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return groupedArray;

  } catch (error) {
    console.error('Error grouping books:', error);
    throw error;
  }
};

/**
 * Fetch books available for reservation (has borrowed copies that will be returned)
 * @returns {Promise<Array>} Array of books available for reservation
 */
export const getReservableBooks = async () => {
  try {
    const groupedBooks = await getGroupedBooks();
    
    // Filter books that have borrowed copies (can be reserved)
    const reservableBooks = groupedBooks
      .filter(book => book.borrowedCopies > 0 || book.availableCopies > 0)
      .map(book => ({
        ...book,
        canReserve: book.borrowedCopies > 0, // Can reserve if there are borrowed copies
        isAvailable: book.availableCopies > 0, // Immediately available
        location: `${book.shelf_number ? `Shelf ${book.shelf_number}` : ''}${book.shelf_column ? `, Column ${book.shelf_column}` : ''}${book.shelf_row ? `, Row ${book.shelf_row}` : ''}`.replace(/^, /, '').trim() || 'Location not specified',
        rating: book.average_rating,
        totalReviews: book.total_ratings,
        reviews: book.reviews || []
      }));

    return reservableBooks;

  } catch (error) {
    console.error('Error fetching reservable books:', error);
    throw error;
  }
};

/**
 * Fetch a specific book by batch_registration_key
 * @param {string} batchKey - The batch registration key
 * @returns {Promise<Object>} Book data with quantity info
 */
export const getBookByBatchKey = async (batchKey) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/books/${batchKey}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch book');
    }

    return response.data.data;

  } catch (error) {
    console.error(`Error fetching book ${batchKey}:`, error);
    throw new Error(`Failed to fetch book: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Fetch a specific book by book_id
 * @param {number} bookId - The individual book ID
 * @returns {Promise<Object>} Single book data
 */
export const getBookById = async (bookId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/books/book/${bookId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch book');
    }

    return response.data.data;

  } catch (error) {
    console.error(`Error fetching book ID ${bookId}:`, error);
    throw new Error(`Failed to fetch book: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Search books by various criteria
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.query - Search query (title, author, etc.)
 * @param {string} searchParams.category - Category/genre filter
 * @param {string} searchParams.author - Author filter
 * @param {boolean} searchParams.availableOnly - Only show available books
 * @returns {Promise<Array>} Array of filtered books
 */
export const searchBooks = async (searchParams = {}) => {
  try {
    const { query = '', category = 'all', author = '', availableOnly = false } = searchParams;
    
    const groupedBooks = await getGroupedBooks();
    
    let filteredBooks = groupedBooks;

    // Apply search query filter
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filteredBooks = filteredBooks.filter(book => 
        book.book_title?.toLowerCase().includes(searchTerm) ||
        book.author?.toLowerCase().includes(searchTerm) ||
        book.genre?.toLowerCase().includes(searchTerm) ||
        book.publisher?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (category && category !== 'all') {
      filteredBooks = filteredBooks.filter(book => 
        book.genre?.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply author filter
    if (author.trim()) {
      const authorTerm = author.toLowerCase().trim();
      filteredBooks = filteredBooks.filter(book => 
        book.author?.toLowerCase().includes(authorTerm)
      );
    }

    // Apply availability filter
    if (availableOnly) {
      filteredBooks = filteredBooks.filter(book => 
        book.availableCopies > 0
      );
    }

    return filteredBooks;

  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

/**
 * Get unique categories/genres from all books
 * @returns {Promise<Array>} Array of unique categories
 */
export const getCategories = async () => {
  try {
    const groupedBooks = await getGroupedBooks();
    
    const categories = [...new Set(
      groupedBooks
        .map(book => book.genre)
        .filter(genre => genre && genre.trim())
    )].sort();

    return categories;

  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get book statistics
 * @returns {Promise<Object>} Statistics about books
 */
export const getBookStats = async () => {
  try {
    const response = await fetchAllBooks();
    
    if (!response.success || !response.data) {
      throw new Error('Invalid response format from server');
    }

    const books = response.data;
    const groupedBooks = await getGroupedBooks();

    const stats = {
      totalBooks: books.length,
      totalTitles: groupedBooks.length,
      availableBooks: books.filter(book => book.status?.toLowerCase() === 'available').length,
      borrowedBooks: books.filter(book => book.status?.toLowerCase() === 'borrowed').length,
      reservedBooks: books.filter(book => book.status?.toLowerCase() === 'reserved').length,
      categories: await getCategories()
    };

    return stats;

  } catch (error) {
    console.error('Error fetching book stats:', error);
    throw error;
  }
};

// Export all functions
export default {
  fetchAllBooks,
  getGroupedBooks,
  getReservableBooks,
  getBookByBatchKey,
  getBookById,
  searchBooks,
  getCategories,
  getBookStats
};
