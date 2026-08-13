import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

export async function handleApiResponse(response, method = '') {
 

  switch (response?.data?.status) {
    case 200:
      if (method === 'UPDATE' || method === 'DELETE') {
        toast.success(response?.data?.message || 'Data Updated Successfully');
      }
      return response.data;

    case 201:
      toast.success(response?.data?.message || 'Data Added Successfully');
      return response.data;

    case 404:
    case 409:
    case 422:
    case 400:
    case 403:
      toast.error(response?.data?.message || 'Access denied');
      return response;

    case 401:
      toast.error(response?.data?.message || 'Session expired. Please login again.');
      // Clear all cookies
      Cookies.remove('Token');
      Cookies.remove('user');
      Cookies.remove('role');
      // Redirect to login page
      window.location.href = '/login';
      return response;

    case 500:
      toast.error(response?.data?.message || 'Something went wrong');
      return response;

    default:
      return response;
  }
}
