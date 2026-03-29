// Placeholder adapter for future Django + PostgreSQL backend.
// Current project stays on Firebase until migration is activated.

const throwNotImplemented = (op) => () => {
  throw new Error(`Django adapter not implemented for operation: ${op}`);
};

export const djangoAdapter = {
  auth: {
    signIn: throwNotImplemented('auth.signIn'),
    signUp: throwNotImplemented('auth.signUp'),
    signOut: throwNotImplemented('auth.signOut'),
    onAuthStateChanged: throwNotImplemented('auth.onAuthStateChanged'),
    updateProfile: throwNotImplemented('auth.updateProfile'),
  },
  certificate: {
    getCertificate: throwNotImplemented('certificate.getCertificate'),
    generateCertificate: throwNotImplemented('certificate.generateCertificate'),
  },
  content: {
    page: {
      getPageData: throwNotImplemented('content.page.getPageData'),
      updatePageData: throwNotImplemented('content.page.updatePageData'),
    },
    theme: {
      getThemeSettings: throwNotImplemented('content.theme.getThemeSettings'),
      updateThemeSettings: throwNotImplemented('content.theme.updateThemeSettings'),
    },
  },
  user: {
    getUserById: throwNotImplemented('user.getUserById'),
    updateUser: throwNotImplemented('user.updateUser'),
  },
  course: {
    ...{
      // Add methods for courseService as needed
    },
  },
  // Add other domains as needed with placeholders
};
