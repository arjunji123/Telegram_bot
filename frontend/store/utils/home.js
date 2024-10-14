// utils/api.js
export const API_URLS = {
  apiMe: 'http://localhost:4000/api/v1/api-me',
  apiQuests: 'http://localhost:4000/api/v1/api-quests',
  // apiCourses: 'https://quizbackendfirst.onrender.com/api/v1/api-courses',
  // apiFaqs: 'http://localhost:4000/api/v1/api-faqs',
  // apiBlogs: 'http://localhost:4000/api/v1/api-blogs',
  // apiTestimonials: 'http://localhost:4000/api/v1/api-testimonials',
  // apiFeatures: 'http://localhost:4000/api/v1/api-features',
  // apiBlocks: 'http://localhost:4000/api/v1/api-blocks',
  // apiContact: 'http://localhost:4000/api/v1/contact',
  // Add more API URLs as needed
};

export const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching data from ${url}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API fetch error:', error);
    return null; // Return null or handle the error as needed
  }
};
