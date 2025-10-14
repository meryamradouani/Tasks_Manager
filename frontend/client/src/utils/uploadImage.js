import axiosInstance from "./axiosInstance";
import apiPaths from "./apiPaths";

const uploadImage = async (imageFile) => {
  
    const formData = new FormData();
    formData.append('image', imageFile);
try {
  const response = await axiosInstance.post(apiPaths.image.upload_image, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    throw new Error('Échec de l\'upload de l\'image');
  }
};
export default uploadImage;
