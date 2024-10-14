// fetcher.js
export const fetcher = {
  async post(url, data) {
    console.log('Sending data:', data); // Log the data being sent
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error response:', error); // Log the error response
      throw new Error(error || 'An error occurred while fetching data.');
    }

    const jsonResponse = await response.json(); // Parse the JSON response
    console.log('Received response:', jsonResponse); // Log the response data
    return jsonResponse;
  },
};
