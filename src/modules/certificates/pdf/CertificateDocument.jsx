import React, { useMemo } from 'react';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { registerCertificateFonts, hasArabic, certificateTemplateConfig, generateQrDataUrl } from './assets.js';
import { certificateStyles as styles } from './styles.js';

/**
 * @param {{ certificate: import('../types').Certificate }} props
 */
const CertificateDocument = ({ certificate }) => {
  registerCertificateFonts();

  const issuedDate = certificate.issuedAt?.toDate
    ? certificate.issuedAt.toDate()
    : new Date();

  const issuedDateFormatted = issuedDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const studentIsArabic = hasArabic(certificate.studentName);
  const courseIsArabic = hasArabic(certificate.courseName);

  const qrDataUrl = useMemo(
    () => generateQrDataUrl(certificate.verificationUrl),
    [certificate.verificationUrl],
  );

  const idLine = `ID: ${certificate.id}`;
  const serialLine = `Serial: ${certificate.serialNumber}`;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            {/* Watermark */}
            <Text style={styles.watermark}>Namaa Academy</Text>

            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.logoBox}>
                <Text style={{ fontSize: 22, color: certificateTemplateConfig.colors.accent }}>ن</Text>
              </View>

              <View style={styles.headerTextBlock}>
                <Text style={styles.academyNameEn}>{certificateTemplateConfig.branding.academyEn}</Text>
                <Text style={styles.academyNameAr}>{certificateTemplateConfig.branding.academyAr}</Text>
                <Text style={styles.title}>Certificate of Completion</Text>
                <Text style={styles.subtitle}>This certifies the successful completion of an accredited course</Text>
              </View>

              <View style={styles.logoBox}>
                {/* Empty for now; can be replaced with Image logo later */}
              </View>
            </View>

            {/* Body */}
            <View style={styles.body}>
              <Text style={styles.label}>Presented to</Text>
              <Text
                style={[
                  styles.recipientName,
                  studentIsArabic && { fontFamily: 'NamaaArabic' },
                ]}
              >
                {certificate.studentName}
              </Text>

              <Text style={styles.statement}>
                This is to certify that{' '}
                <Text style={{ fontFamily: 'NamaaSerif' }}>{certificate.studentName}</Text>{' '}
                has successfully completed the course
              </Text>

              <Text
                style={[
                  styles.courseTitle,
                  courseIsArabic && { fontFamily: 'NamaaArabic' },
                ]}
              >
                {certificate.courseName}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Instructor</Text>
                  <Text style={styles.metaValue}>{certificate.instructorName}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Issued on</Text>
                  <Text style={styles.metaValue}>{issuedDateFormatted}</Text>
                </View>
              </View>
            </View>

            {/* Footer: signature, seal, QR */}
            <View>
              <View style={styles.footerRow}>
                <View style={styles.signatureBlock}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureName}>{certificate.instructorName}</Text>
                  <Text style={styles.signatureLabel}>Instructor Signature</Text>
                </View>

                <View style={styles.sealBlock}>
                  <View style={styles.sealCircle}>
                    <View style={styles.sealInner}>
                      <Text style={styles.sealText}>Certified</Text>
                      <Text style={styles.sealText}>Namaa Academy</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.qrBlock}>
                  <Text style={styles.qrLabel}>Scan to verify</Text>
                  {qrDataUrl && <Image style={styles.qrCode} src={qrDataUrl} />}
                </View>
              </View>

              <View style={styles.bottomMetaRow}>
                <Text style={styles.bottomMetaText}>{idLine}</Text>
                <Text style={styles.bottomMetaText}>{serialLine}</Text>
                <Text style={styles.bottomMetaText}>
                  Verify at {certificate.verificationUrl}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default CertificateDocument;

