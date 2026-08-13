import axios from 'axios';
import Cookies from 'js-cookie';

export const getDevices = async () => {
  const token = Cookies.get('Token') || Cookies.get('token');
  const baseUrl = process.env.REACT_APP_BACKEND_URL;

  try {
    const response = await axios.get(`${baseUrl}/devices`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });

    const deviceList = response?.data?.data || [];

    return deviceList.map((device) => ({
      id: device.id,
      deviceCode: device.deviceCode,
      location: device.location,
      isActive: device.isActive,
      status: device.isActive ? 'Online' : 'Offline',
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
      users_assigned: device.users_assigned || [],
      users_assigned_count: device.users_assigned_count ?? (device.users_assigned?.length || 0),
      usersAssigned: `${device.users_assigned_count ?? (device.users_assigned?.length || 0)} Employees`
    }));
  } catch (error) {
    console.error('Error fetching devices:', error);
    return [];
  }
};




// API for the Add Devices 
export const createDevice = async (deviceData) => {
  const token = Cookies.get('Token') || Cookies.get('token');
  const baseUrl = process.env.REACT_APP_BACKEND_URL;

  const payload = {
    device_code: deviceData.device_code || deviceData.deviceCode || deviceData.id,
    location: deviceData.location
  };

  try {
    const response = await axios.post(`${baseUrl}/devices`, payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      statusCode: error.response?.status || 500,
      data: null,
      message: error.message || 'Failed to create device',
      errors: null
    };
  }
};

export const addDevice = createDevice;

export default {
  getDevices,
  createDevice,
  addDevice
};
