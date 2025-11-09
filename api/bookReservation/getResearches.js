import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Research Papers API Service
 * Provides functions to fetch and manage research papers data
 */

/**
 * Fetch all research papers from the server
 * @returns {Promise<Object>} API response with research papers data
 */
export const fetchAllResearches = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/research-papers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all research papers:', error);
    throw new Error(`Failed to fetch research papers: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Fetch research papers grouped and formatted for display
 * @returns {Promise<Array>} Array of formatted research papers
 */
export const getGroupedResearches = async () => {
  try {
    const response = await fetchAllResearches();
    
    if (!response.success || !response.data) {
      throw new Error('Invalid response format from server');
    }

    // Transform research papers data to match frontend expectations
    const formattedResearches = response.data.map(paper => {
      // Convert base64 QR code to data URL if available
      let qrCodeUrl = null;
      if (paper.research_paper_qr) {
        qrCodeUrl = `data:image/png;base64,${paper.research_paper_qr}`;
      }

      return {
        research_paper_id: paper.research_paper_id,
        research_id: paper.research_paper_id, // Alias for consistency
        research_title: paper.research_title,
        title: paper.research_title, // Alias for UI consistency
        authors: paper.authors,
        author: paper.authors, // Single author field for UI
        department_name: paper.department_name,
        genre: paper.department_name, // Use department as genre equivalent
        category: paper.department_name, // Category alias
        year_publication: paper.year_publication,
        year: paper.year_publication,
        research_abstract: paper.research_abstract,
        abstract: paper.research_abstract,
        research_paper_price: paper.research_paper_price,
        price: paper.research_paper_price,
        research_paper_qr: qrCodeUrl,
        qr_code: qrCodeUrl,
        shelf_number: paper.shelf_number,
        shelf_column: paper.shelf_column,
        shelf_row: paper.shelf_row,
        location: `${paper.shelf_number ? `Shelf ${paper.shelf_number}` : ''}${paper.shelf_column ? `, Column ${paper.shelf_column}` : ''}${paper.shelf_row ? `, Row ${paper.shelf_row}` : ''}`.replace(/^, /, '').trim() || 'Location not specified',
        created_at: paper.created_at,
        
        // Research-specific properties
        department_id: paper.department_id,
        
        // Status and availability (research papers are typically always "available" for reading)
        status: 'available', // Most research papers are available for access
        isAvailable: true,
        canReserve: false, // Research papers typically don't get reserved like books
        
        // Mock data for consistency with book interface
        coverImage: qrCodeUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=entropy&auto=format&fm=webp&q=80",
        rating: 4.0 + Math.random() * 1.0, // Mock rating between 4.0-5.0
        totalReviews: Math.floor(Math.random() * 100) + 10, // Mock review count
        
        // Research-specific display
        type: 'research_paper'
      };
    });

    // Sort by creation date (newest first)
    return formattedResearches.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  } catch (error) {
    console.error('Error formatting research papers:', error);
    throw error;
  }
};

/**
 * Fetch available research papers (for reservation/access)
 * @returns {Promise<Array>} Array of available research papers
 */
export const getAvailableResearches = async () => {
  try {
    const researches = await getGroupedResearches();
    
    // Filter available research papers (most research papers are available for reading)
    const availableResearches = researches
      .filter(paper => paper.status?.toLowerCase() === 'available')
      .map(paper => ({
        ...paper,
        isAvailable: true,
        canAccess: true, // Research papers can be accessed for reading
        accessType: 'read_only' // Research papers are typically read-only
      }));

    return availableResearches;

  } catch (error) {
    console.error('Error fetching available research papers:', error);
    throw error;
  }
};

/**
 * Fetch a specific research paper by ID
 * @param {number} researchId - The research paper ID
 * @returns {Promise<Object>} Research paper data
 */
export const getResearchById = async (researchId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/research-papers/${researchId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch research paper');
    }

    const paper = response.data.data;
    
    // Format similar to getGroupedResearches
    let qrCodeUrl = null;
    if (paper.research_paper_qr) {
      qrCodeUrl = `data:image/png;base64,${paper.research_paper_qr}`;
    }

    return {
      ...paper,
      title: paper.research_title,
      author: paper.authors,
      genre: paper.department_name,
      category: paper.department_name,
      year: paper.year_publication,
      abstract: paper.research_abstract,
      price: paper.research_paper_price,
      qr_code: qrCodeUrl,
      coverImage: qrCodeUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=entropy&auto=format&fm=webp&q=80",
      location: `${paper.shelf_number ? `Shelf ${paper.shelf_number}` : ''}${paper.shelf_column ? `, Column ${paper.shelf_column}` : ''}${paper.shelf_row ? `, Row ${paper.shelf_row}` : ''}`.replace(/^, /, '').trim() || 'Location not specified',
      type: 'research_paper',
      isAvailable: true,
      canAccess: true
    };

  } catch (error) {
    console.error(`Error fetching research paper ${researchId}:`, error);
    throw new Error(`Failed to fetch research paper: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Search research papers by various criteria
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.query - Search query (title, author, abstract, etc.)
 * @param {string} searchParams.department - Department/category filter
 * @param {string} searchParams.author - Author filter
 * @param {number} searchParams.year - Publication year filter
 * @param {boolean} searchParams.availableOnly - Only show available papers
 * @returns {Promise<Array>} Array of filtered research papers
 */
export const searchResearches = async (searchParams = {}) => {
  try {
    const { query = '', department = 'all', author = '', year = '', availableOnly = false } = searchParams;
    
    const researches = await getGroupedResearches();
    
    let filteredResearches = researches;

    // Apply search query filter
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filteredResearches = filteredResearches.filter(paper => 
        paper.research_title?.toLowerCase().includes(searchTerm) ||
        paper.authors?.toLowerCase().includes(searchTerm) ||
        paper.research_abstract?.toLowerCase().includes(searchTerm) ||
        paper.department_name?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply department filter
    if (department && department !== 'all') {
      filteredResearches = filteredResearches.filter(paper => 
        paper.department_name?.toLowerCase() === department.toLowerCase()
      );
    }

    // Apply author filter
    if (author.trim()) {
      const authorTerm = author.toLowerCase().trim();
      filteredResearches = filteredResearches.filter(paper => 
        paper.authors?.toLowerCase().includes(authorTerm)
      );
    }

    // Apply year filter
    if (year) {
      filteredResearches = filteredResearches.filter(paper => 
        paper.year_publication == year
      );
    }

    // Apply availability filter
    if (availableOnly) {
      filteredResearches = filteredResearches.filter(paper => 
        paper.status?.toLowerCase() === 'available'
      );
    }

    return filteredResearches;

  } catch (error) {
    console.error('Error searching research papers:', error);
    throw error;
  }
};

/**
 * Get unique departments from all research papers
 * @returns {Promise<Array>} Array of unique departments
 */
export const getResearchDepartments = async () => {
  try {
    const researches = await getGroupedResearches();
    
    const departments = [...new Set(
      researches
        .map(paper => paper.department_name)
        .filter(dept => dept && dept.trim())
    )].sort();

    return departments;

  } catch (error) {
    console.error('Error fetching research departments:', error);
    throw error;
  }
};

/**
 * Get research paper statistics
 * @returns {Promise<Object>} Statistics about research papers
 */
export const getResearchStats = async () => {
  try {
    const response = await fetchAllResearches();
    
    if (!response.success || !response.data) {
      throw new Error('Invalid response format from server');
    }

    const researches = response.data;
    const departments = await getResearchDepartments();

    // Calculate year distribution
    const yearStats = {};
    researches.forEach(paper => {
      const year = paper.year_publication;
      if (year) {
        yearStats[year] = (yearStats[year] || 0) + 1;
      }
    });

    const stats = {
      totalResearches: researches.length,
      totalDepartments: departments.length,
      departments: departments,
      yearDistribution: yearStats,
      oldestYear: Math.min(...Object.keys(yearStats).map(y => parseInt(y))),
      newestYear: Math.max(...Object.keys(yearStats).map(y => parseInt(y))),
      averagePerYear: researches.length / Object.keys(yearStats).length || 0
    };

    return stats;

  } catch (error) {
    console.error('Error fetching research stats:', error);
    throw error;
  }
};

/**
 * Get research authors list
 * @returns {Promise<Array>} Array of research authors
 */
export const getResearchAuthors = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/research-papers/authors`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch authors');
    }

    return response.data.data;

  } catch (error) {
    console.error('Error fetching research authors:', error);
    throw error;
  }
};

/**
 * Get research departments list
 * @returns {Promise<Array>} Array of departments
 */
export const getDepartments = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/research-papers/departments`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch departments');
    }

    return response.data.data;

  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

/**
 * Get shelf locations for research papers
 * @returns {Promise<Array>} Array of shelf locations
 */
export const getShelfLocations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/research-papers/shelf-locations`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch shelf locations');
    }

    return response.data.data;

  } catch (error) {
    console.error('Error fetching shelf locations:', error);
    throw error;
  }
};

// Export all functions
export default {
  fetchAllResearches,
  getGroupedResearches,
  getAvailableResearches,
  getResearchById,
  searchResearches,
  getResearchDepartments,
  getResearchStats,
  getResearchAuthors,
  getDepartments,
  getShelfLocations
};
