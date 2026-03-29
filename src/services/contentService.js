import { dataAdapter } from './dataAdapter';
import { aboutService } from './firestore/aboutService';

/**
 * Business layer for content entity operations, wraps adapter methods.
 * This is a non-breaking facade; existing Firestore content logic remains untouched.
 */
export const contentService = {
  getAboutPage: async () => {
    // Preserve existing about page defaults logic.
    return await aboutService.getAboutPage();
  },

  updateAboutPage: async (payload) => {
    return await aboutService.updateAboutPage(payload);
  },

  getPageData: async (pageId) => {
    // Keep existing behavior by delegating to adapter.
    return await dataAdapter.content.page.getPageData(pageId);
  },

  updatePageData: async (pageId, payload) => {
    return await dataAdapter.content.page.updatePageData(pageId, payload);
  },

  getThemeSettings: async () => {
    return await dataAdapter.content.theme.getThemeSettings();
  },

  updateThemeSettings: async (payload) => {
    return await dataAdapter.content.theme.updateThemeSettings(payload);
  },
};
