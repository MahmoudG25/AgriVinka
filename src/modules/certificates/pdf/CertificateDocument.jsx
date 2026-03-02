import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#f9f7f2',
    fontFamily: 'Helvetica',
  },
  border: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#0f3b1c',
    padding: 16,
  },
  innerBorder: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d9c58d',
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  academyName: {
    fontSize: 14,
    color: '#0f3b1c',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    color: '#0f3b1c',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#b38b10',
  },
  sectionLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 20,
    color: '#0f3b1c',
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 11,
    color: '#333333',
    marginBottom: 24,
  },
  strong: {
    fontSize: 12,
    color: '#0f3b1c',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  col: {
    width: '48%',
  },
  label: {
    fontSize: 9,
    color: '#777777',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 11,
    color: '#111111',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0d9c2',
  },
  signature: {
    fontSize: 11,
    color: '#0f3b1c',
  },
  serial: {
    fontSize: 9,
    color: '#666666',
  },
});

/**
 * @param {{ certificate: import('../types').Certificate }} props
 */
const CertificateDocument = ({ certificate }) => {
  const issuedDate = certificate.issuedAt?.toDate
    ? certificate.issuedAt.toDate()
    : new Date();

  const issuedDateFormatted = issuedDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.innerBorder}>
            <View>
              <View style={styles.header}>
                <Text style={styles.academyName}>NAMAA ACADEMY</Text>
                <Text style={styles.title}>Certificate of Completion</Text>
                <Text style={styles.subtitle}>This certifies the successful completion of a course</Text>
              </View>

              <View>
                <Text style={styles.sectionLabel}>Presented to</Text>
                <Text style={styles.nameText}>{certificate.studentName}</Text>

                <Text style={styles.bodyText}>
                  <Text>This is to certify that </Text>
                  <Text style={styles.strong}>{certificate.studentName}</Text>
                  <Text> has successfully completed the course </Text>
                  <Text style={styles.strong}>{certificate.courseName}</Text>
                  <Text> provided by Namaa Academy.</Text>
                </Text>

                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.label}>Instructor</Text>
                    <Text style={styles.value}>{certificate.instructorName}</Text>
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.label}>Issued on</Text>
                    <Text style={styles.value}>{issuedDateFormatted}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View>
              <View style={styles.footerRow}>
                <View>
                  <Text style={styles.label}>Certificate ID</Text>
                  <Text style={styles.value}>{certificate.id}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Serial Number</Text>
                  <Text style={styles.value}>{certificate.serialNumber}</Text>
                </View>
              </View>
              <View style={styles.footerRow}>
                <View>
                  <Text style={styles.label}>Status</Text>
                  <Text style={styles.value}>{certificate.status === 'valid' ? 'Valid' : 'Revoked'}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Authorized by</Text>
                  <Text style={styles.signature}>Namaa Academy</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default CertificateDocument;

