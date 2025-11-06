import { fetchAuthSession } from 'aws-amplify/auth';
import { get } from 'aws-amplify/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

const API_NAME = 'LawFirmAPI';

async function callApi<T>(
  path: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    const requestOptions: any = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    let response;
    if (method === 'GET') {
      response = await get({
        apiName: API_NAME,
        path,
        options: requestOptions,
      }).response;
    } else {
      // For POST, PUT, DELETE - you'd need to implement these with Amplify
      // For now, we'll use fetch as a fallback
      const apiUrl = `${import.meta.env.VITE_API_GATEWAY_URL}${path}`;
      response = await fetch(apiUrl, {
        method,
        ...requestOptions,
      });
    }

    let data;
    if ('json' in response && typeof response.json === 'function') {
      data = await response.json();
    } else {
      data = await (response as any).body;
    }

    if (!('ok' in response ? response.ok : true)) {
      return { 
        error: data?.message || data?.error || 'API request failed',
        message: data?.message 
      };
    }

    return { data };
  } catch (error: any) {
    console.error(`API call to ${path} failed:`, error);
    return { 
      error: error.message || 'Network error occurred',
      message: error.message 
    };
  }
}

export const apiService = {
  // Clients
  getClients: (page: number, limit: number) => 
    callApi(`/clients?page=${page}&limit=${limit}`, 'GET'),
  
  getClientById: (clientId: string) => 
    callApi(`/clients/${clientId}`, 'GET'),
  
  createClient: (clientData: any) => 
    callApi('/clients', 'POST', clientData),
  
  updateClient: (clientId: string, clientData: any) => 
    callApi(`/clients/${clientId}`, 'PUT', clientData),
  
  deleteClient: (clientId: string) => 
    callApi(`/clients/${clientId}`, 'DELETE'),

  // Cases
  getCases: (page: number, limit: number) => 
    callApi(`/cases?page=${page}&limit=${limit}`, 'GET'),
  
  getCaseById: (caseId: string) => 
    callApi(`/cases/${caseId}`, 'GET'),
  
  createCase: (caseData: any) => 
    callApi('/cases', 'POST', caseData),
  
  updateCase: (caseId: string, caseData: any) => 
    callApi(`/cases/${caseId}`, 'PUT', caseData),
  
  deleteCase: (caseId: string) => 
    callApi(`/cases/${caseId}`, 'DELETE'),

  // Hearings
  getHearings: (page: number, limit: number) => 
    callApi(`/hearings?page=${page}&limit=${limit}`, 'GET'),
  
  getHearingById: (hearingId: string) => 
    callApi(`/hearings/${hearingId}`, 'GET'),
  
  createHearing: (hearingData: any) => 
    callApi('/hearings', 'POST', hearingData),
  
  updateHearing: (hearingId: string, hearingData: any) => 
    callApi(`/hearings/${hearingId}`, 'PUT', hearingData),
  
  deleteHearing: (hearingId: string) => 
    callApi(`/hearings/${hearingId}`, 'DELETE'),

  // Users
  getUsers: (page: number, limit: number) => 
    callApi(`/users?page=${page}&limit=${limit}`, 'GET'),
  
  getUserById: (userId: string) => 
    callApi(`/users/${userId}`, 'GET'),
  
  createUser: (userData: any) => 
    callApi('/users', 'POST', userData),
  
  updateUser: (userId: string, userData: any) => 
    callApi(`/users/${userId}`, 'PUT', userData),
  
  deleteUser: (userId: string) => 
    callApi(`/users/${userId}`, 'DELETE'),

  // Search
  search: (query: string, type?: string) => 
    callApi(`/search?query=${query}${type ? `&type=${type}` : ''}`, 'GET'),

  // Notifications
  getNotifications: (userId: string) => 
    callApi(`/notifications/${userId}`, 'GET'),
  
  markNotificationAsRead: (notificationId: string) => 
    callApi(`/notifications/${notificationId}/read`, 'PUT'),

  // Admin Logs
  getAdminLogs: (page: number, limit: number) => 
    callApi(`/admin-logs?page=${page}&limit=${limit}`, 'GET'),
};