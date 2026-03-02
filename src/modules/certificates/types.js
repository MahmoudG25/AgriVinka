/**
 * @typedef {Object} Certificate
 * @property {string} id
 * @property {string} userId
 * @property {string} courseId
 * @property {string} studentName
 * @property {string} courseName
 * @property {string} instructorName
 * @property {import('firebase/firestore').Timestamp} issuedAt
 * @property {string} serialNumber
 * @property {"valid" | "revoked"} status
 * @property {string} verificationUrl
 * @property {string} templateVersion
 * @property {import('firebase/firestore').Timestamp} createdAt
 * @property {import('firebase/firestore').Timestamp} updatedAt
 */

/**
 * @typedef {Object} PublicCertificate
 * @property {string} id
 * @property {string} studentName
 * @property {string} courseName
 * @property {string} instructorName
 * @property {import('firebase/firestore').Timestamp} issuedAt
 * @property {string} serialNumber
 * @property {"valid" | "revoked"} status
 * @property {string} templateVersion
 */

export {};

