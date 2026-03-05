import React, { useMemo } from 'react';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { StyleSheet } from '@react-pdf/renderer';
import { registerCertificateFonts, hasArabic, generateQrDataUrl } from './assets.js';
import { DEFAULT_CERTIFICATE_TEMPLATE_SETTINGS } from '../services/templateSettingsService.js';

/**
 * Build dynamic styles based on template settings colors.
 */
function buildStyles(ts) {
  const primary = ts.primaryColor || '#0f3b1c';
  const accent = ts.accentColor || '#c9a646';

  return StyleSheet.create({
    page: {
      backgroundColor: '#f9f7f2',
      padding: 28,
      fontFamily: 'NamaaSans',
    },
    outerBorder: {
      flex: 1,
      borderWidth: ts.borderEnabled !== false ? 3 : 0,
      borderColor: primary,
      padding: 10,
    },
    innerBorder: {
      flex: 1,
      borderWidth: ts.borderEnabled !== false ? 1.5 : 0,
      borderColor: accent,
      padding: 18,
      justifyContent: 'space-between',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    logoBox: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 1,
      borderColor: accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextBlock: {
      flex: 1,
      alignItems: 'center',
    },
    academyNameEn: {
      fontFamily: 'NamaaSans',
      fontSize: 14,
      letterSpacing: 3,
      textTransform: 'uppercase',
      color: accent,
    },
    academyNameAr: {
      fontFamily: 'NamaaArabic',
      fontSize: 11,
      color: '#666666',
      marginTop: 2,
    },
    title: {
      fontFamily: 'NamaaSerif',
      fontSize: 30,
      marginTop: 14,
      color: accent,
    },
    subtitle: {
      fontSize: 10,
      color: '#666666',
      marginTop: 4,
    },
    watermark: {
      position: 'absolute',
      top: '35%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      opacity: 0.05,
      fontFamily: 'NamaaSerif',
      fontSize: 64,
      color: accent,
    },
    body: {
      marginTop: 18,
    },
    label: {
      fontSize: 9,
      color: '#666666',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    recipientName: {
      marginTop: 6,
      fontFamily: 'NamaaSerif',
      fontSize: 26,
      color: accent,
    },
    statement: {
      marginTop: 14,
      fontSize: 11,
      color: '#222222',
      lineHeight: 1.4,
    },
    courseTitle: {
      marginTop: 10,
      fontFamily: 'NamaaSerif',
      fontSize: 18,
      color: accent,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 22,
    },
    metaCol: {
      width: '48%',
    },
    metaLabel: {
      fontSize: 9,
      color: '#666666',
      textTransform: 'uppercase',
    },
    metaValue: {
      marginTop: 3,
      fontSize: 11,
      color: '#222222',
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginTop: 28,
    },
    signatureBlock: {
      width: '40%',
    },
    signatureLine: {
      marginTop: 18,
      borderBottomWidth: 1,
      borderBottomColor: '#666666',
    },
    signatureName: {
      marginTop: 4,
      fontSize: 11,
      color: '#222222',
    },
    signatureLabel: {
      fontSize: 9,
      color: '#666666',
    },
    signatureImage: {
      width: 100,
      height: 40,
      objectFit: 'contain',
      marginBottom: 4,
    },
    sealBlock: {
      width: '20%',
      alignItems: 'center',
    },
    sealCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sealInner: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sealText: {
      fontSize: 9,
      color: '#ffffff',
      textAlign: 'center',
    },
    qrBlock: {
      width: '32%',
      alignItems: 'flex-end',
    },
    qrLabel: {
      fontSize: 8,
      color: '#666666',
      marginBottom: 4,
    },
    qrCode: {
      width: 70,
      height: 70,
    },
    bottomMetaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      borderTopWidth: 0.5,
      borderTopColor: '#ddd7c5',
      paddingTop: 8,
    },
    bottomMetaText: {
      fontSize: 8,
      color: '#666666',
    },
    watermarkImage: {
      position: 'absolute',
      top: '25%',
      left: '25%',
      width: '50%',
      height: '50%',
      opacity: 0.04,
      objectFit: 'contain',
    },
    logoImage: {
      width: 60,
      height: 60,
      objectFit: 'contain',
    },
  });
}

/**
 * @param {{
 *   certificate: import('../types').Certificate,
 *   templateSettings?: object
 * }} props
 */
const CertificateDocument = ({ certificate, templateSettings }) => {
  registerCertificateFonts();

  // Merge provided settings with defaults
  const ts = useMemo(() => {
    const def = DEFAULT_CERTIFICATE_TEMPLATE_SETTINGS;
    const s = templateSettings || {};
    return {
      ...def,
      ...s,
      signature: { ...def.signature, ...(s.signature || {}) },
      watermark: { ...def.watermark, ...(s.watermark || {}) },
    };
  }, [templateSettings]);

  const styles = useMemo(() => buildStyles(ts), [ts]);

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

  // Resolve seal text — split into two lines if contains "by" or fallback
  const sealTextLines = (ts.sealTextEn || 'Certified\nNamaa Academy').split(/\n|(?= by )/);

  // Resolve instructor name: from settings if signature enabled, else from certificate
  const instructorName =
    ts.signature.enabled && ts.signature.instructorName
      ? ts.signature.instructorName
      : certificate.instructorName;

  // Watermark text
  const watermarkText =
    ts.watermark.enabled && ts.watermark.type === 'text'
      ? ts.watermark.text || ts.academyNameEn
      : ts.academyNameEn;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            {/* Watermark */}
            {ts.watermark.enabled && ts.watermark.type === 'image' && ts.watermark.imageUrl ? (
              <Image style={styles.watermarkImage} src={ts.watermark.imageUrl} />
            ) : (
              <Text style={styles.watermark}>{watermarkText}</Text>
            )}

            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.logoBox}>
                {ts.logoUrl ? (
                  <Image style={styles.logoImage} src={ts.logoUrl} />
                ) : (
                  <Text style={{ fontSize: 22, color: ts.accentColor || '#c9a646' }}>ن</Text>
                )}
              </View>

              <View style={styles.headerTextBlock}>
                <Text style={styles.academyNameEn}>{ts.academyNameEn}</Text>
                <Text style={styles.academyNameAr}>{ts.academyNameAr}</Text>
                <Text style={styles.title}>{ts.titleEn}</Text>
                <Text style={styles.subtitle}>{ts.subtitleEn}</Text>
              </View>

              <View style={styles.logoBox}>
                {ts.siteLogoUrl ? (
                  <Image style={styles.logoImage} src={ts.siteLogoUrl} />
                ) : null}
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
                  <Text style={styles.metaValue}>{instructorName}</Text>
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
                {/* Signature */}
                <View style={styles.signatureBlock}>
                  {ts.signature.enabled && ts.signature.signatureImageUrl ? (
                    <Image
                      style={styles.signatureImage}
                      src={ts.signature.signatureImageUrl}
                    />
                  ) : null}
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureName}>{instructorName}</Text>
                  <Text style={styles.signatureLabel}>Instructor Signature</Text>
                </View>

                {/* Seal */}
                <View style={styles.sealBlock}>
                  <View style={styles.sealCircle}>
                    <View style={styles.sealInner}>
                      {sealTextLines.map((line, i) => (
                        <Text key={i} style={styles.sealText}>
                          {line.trim()}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>

                {/* QR */}
                <View style={styles.qrBlock}>
                  <Text style={styles.qrLabel}>Scan to verify</Text>
                  {qrDataUrl && <Image style={styles.qrCode} src={qrDataUrl} />}
                </View>
              </View>

              <View style={styles.bottomMetaRow}>
                <Text style={styles.bottomMetaText}>{idLine}</Text>
                <Text style={styles.bottomMetaText}>{serialLine}</Text>
                <Text style={styles.bottomMetaText}>
                  {ts.footerTextEn || `Verify at ${certificate.verificationUrl}`}
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
