const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const apiService = {
  async getClients(page: number = 1, limit: number = 100) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const clients = await response.json();
      
      // Transform backend format to frontend format
      const transformedClients = clients.map((client: any) => ({
        clientId: client.client_id?.toString() || '',
        firstName: client.first_name || '',
        middleName: client.middle_name || '',
        lastName: client.last_name || '',
        dateOfBirth: client.date_of_birth || '',
        civilStatus: client.civil_status || '',
        phoneNumber: client.phone_number || '',
        email: client.email || '',
        address: {
          street: client.street || '',
          city: client.city || '',
          state: client.state || '',
          zip: client.zip_code || '',
        },
        dateAdded: client.created_at || '',
        opposingParties: client.opposing_parties || '',
        notes: client.notes || '',
      }));
      
      return {
        data: {
          clients: transformedClients,
          total: transformedClients.length,
          page,
          limit
        },
        error: null
      };
    } catch (error: any) {
      console.error('getClients error:', error);
      return {
        data: {
          clients: [],
          total: 0,
          page,
          limit
        },
        error: error.message || 'Failed to fetch clients'
      };
    }
  },

  async getCases(page: number = 1, limit: number = 100) {
    try {
      const response = await fetch(`${API_BASE_URL}/cases/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const cases = await response.json();
      
      // Transform backend format to frontend format
      const transformedCases = cases.map((case_: any) => ({
        caseId: case_.case_id?.toString() || '',
        clientId: case_.client?.toString() || '',
        lawyerAssigned: case_.lawyer_assigned || '',
        caseTitle: case_.case_title || '',
        caseType: case_.case_type || '',
        status: case_.status || 'active',
        description: case_.description || '',
        creationDate: case_.created_at || '',
      }));
      
      return {
        data: {
          cases: transformedCases,
          total: transformedCases.length,
          page,
          limit
        },
        error: null
      };
    } catch (error: any) {
      console.error('getCases error:', error);
      return {
        data: {
          cases: [],
          total: 0,
          page,
          limit
        },
        error: error.message || 'Failed to fetch cases'
      };
    }
  },

  async createClient(clientData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          first_name: clientData.firstName,
          middle_name: clientData.middleName,
          last_name: clientData.lastName,
          date_of_birth: clientData.dateOfBirth,
          civil_status: clientData.civilStatus,
          phone_number: clientData.phoneNumber,
          email: clientData.email,
          street: clientData.address.street,
          city: clientData.address.city,
          state: clientData.address.state,
          zip_code: clientData.address.zip,
          opposing_parties: clientData.opposingParties,
          notes: clientData.notes,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create client');
      }
      
      const newClient = await response.json();
      
      // Transform response to match frontend format
      return {
        data: {
          clientId: newClient.client_id.toString(),
          firstName: newClient.first_name,
          middleName: newClient.middle_name || '',
          lastName: newClient.last_name,
          dateOfBirth: newClient.date_of_birth,
          civilStatus: newClient.civil_status,
          phoneNumber: newClient.phone_number,
          email: newClient.email,
          address: {
            street: newClient.street,
            city: newClient.city,
            state: newClient.state,
            zip: newClient.zip_code,
          },
          dateAdded: newClient.created_at,
          opposingParties: newClient.opposing_parties,
          notes: newClient.notes,
        },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to create client'
      };
    }
  },

  async createCase(caseData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/cases/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          client_id: parseInt(caseData.clientId),
          case_title: caseData.caseTitle,
          case_type: caseData.caseType,
          status: caseData.status,
          description: caseData.description,
          lawyer_assigned: caseData.lawyerAssigned,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create case');
      }
      
      const newCase = await response.json();
      
      // Transform response to match frontend format
      return {
        data: {
          caseId: newCase.case_id.toString(),
          clientId: newCase.client.toString(),
          lawyerAssigned: newCase.lawyer_assigned,
          caseTitle: newCase.case_title,
          caseType: newCase.case_type,
          status: newCase.status,
          description: newCase.description,
          creationDate: newCase.created_at,
        },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to create case'
      };
    }
  },

  async updateClient(clientId: string, clientData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${clientId}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          first_name: clientData.firstName,
          middle_name: clientData.middleName,
          last_name: clientData.lastName,
          date_of_birth: clientData.dateOfBirth,
          civil_status: clientData.civilStatus,
          phone_number: clientData.phoneNumber,
          email: clientData.email,
          street: clientData.address?.street,
          city: clientData.address?.city,
          state: clientData.address?.state,
          zip_code: clientData.address?.zip,
          opposing_parties: clientData.opposingParties,
          notes: clientData.notes,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update client');
      }
      
      const updatedClient = await response.json();
      
      return {
        data: {
          clientId: updatedClient.client_id.toString(),
          firstName: updatedClient.first_name,
          middleName: updatedClient.middle_name || '',
          lastName: updatedClient.last_name,
          dateOfBirth: updatedClient.date_of_birth,
          civilStatus: updatedClient.civil_status,
          phoneNumber: updatedClient.phone_number,
          email: updatedClient.email,
          address: {
            street: updatedClient.street,
            city: updatedClient.city,
            state: updatedClient.state,
            zip: updatedClient.zip_code,
          },
          dateAdded: updatedClient.created_at,
          opposingParties: updatedClient.opposing_parties,
          notes: updatedClient.notes,
        },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to update client'
      };
    }
  },

  async updateCase(caseId: string, caseData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/cases/${caseId}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          client_id: parseInt(caseData.clientId),
          case_title: caseData.caseTitle,
          case_type: caseData.caseType,
          status: caseData.status,
          description: caseData.description,
          lawyer_assigned: caseData.lawyerAssigned,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update case');
      }
      
      const updatedCase = await response.json();
      
      return {
        data: {
          caseId: updatedCase.case_id.toString(),
          clientId: updatedCase.client.toString(),
          lawyerAssigned: updatedCase.lawyer_assigned,
          caseTitle: updatedCase.case_title,
          caseType: updatedCase.case_type,
          status: updatedCase.status,
          description: updatedCase.description,
          creationDate: updatedCase.created_at,
        },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to update case'
      };
    }
  },

  async deleteClient(clientId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${clientId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete client');
      }
      
      return {
        data: { success: true },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to delete client'
      };
    }
  },

  async deleteCase(caseId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/cases/${caseId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete case');
      }
      
      return {
        data: { success: true },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to delete case'
      };
    }
  }
};
