import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../services/api';

export const useAccessTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const fetchTemplates = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(
        `/organizations/${organization.id}/access-templates`,
        { params: filters }
      );

      setTemplates(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async (templateData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-templates`,
        templateData
      );
      setTemplates([...templates, response.data]);
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const updateTemplate = async (templateId, templateData) => {
    try {
      const response = await api.put(
        `/organizations/${organization.id}/access-templates/${templateId}`,
        templateData
      );
      setTemplates(templates.map(template =>
        template.id === templateId ? response.data : template
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const deleteTemplate = async (templateId) => {
    try {
      await api.delete(
        `/organizations/${organization.id}/access-templates/${templateId}`
      );
      setTemplates(templates.filter(template => template.id !== templateId));
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getTemplateDetails = async (templateId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-templates/${templateId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getTemplateUsage = async (templateId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-templates/${templateId}/usage`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  useEffect(() => {
    if (organization?.id) {
      fetchTemplates();
    }
  }, [organization?.id]);

  return {
    templates,
    isLoading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateDetails,
    getTemplateUsage,
    refreshTemplates: fetchTemplates,
  };
};
