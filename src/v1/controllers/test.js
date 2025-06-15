const cloudinary = require('cloudinary').v2;
const axios = require('axios'); // Add axios to check URL accessibility

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

async function checkUrlAccessibility(url) {
  try {
    const response = await axios.head(url, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error('URL is not accessible:', error.message);
    return false;
  }
}

async function uploadFromUrl() {
  const imageUrl =
    'https://res.cloudinary.com/ddai6csgj/image/upload/v1748180667/samples/coffee.jpg';

  // Check if the URL is accessible
  const isAccessible = await checkUrlAccessibility(imageUrl);
  if (!isAccessible) {
    console.error('Cannot upload: Image URL is not accessible.');
    return;
  }

  try {
    const result = await cloudinary.uploader.upload('./test.jpg', {
      folder: 'Uploads',
      timeout: 60000, // Set a 60-second timeout
    });

    console.log('Upload successful!');
    console.log('Secure URL:', result.secure_url);
  } catch (error) {
    console.error('Upload failed:', error);
    if (error.http_code === 499) {
      console.error(
        'Timeout occurred. Try increasing the timeout or check network stability.'
      );
    }
  }
}

async function listUploads() {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 10,
    });
    console.log('Listing uploads:');
    result.resources.forEach((file) => {
      console.log(`${file.public_id} -> ${file.secure_url}`);
    });
  } catch (error) {
    console.error('Failed to list uploads:', error);
  }
}

async function main() {
  await listUploads();
  await uploadFromUrl();
}

main().catch((error) => {
  console.error('Error in main execution:', error);
});
