import { StyleSheet } from '@react-pdf/renderer';
import { certificateTemplateConfig as cfg } from './assets.js';

export const certificateStyles = StyleSheet.create({
  page: {
    backgroundColor: cfg.colors.background,
    padding: 28,
    fontFamily: 'NamaaSans',
  },
  outerBorder: {
    flex: 1,
    borderWidth: 3,
    borderColor: cfg.colors.borderOuter,
    padding: 10,
  },
  innerBorder: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: cfg.colors.borderInner,
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
    borderColor: cfg.colors.borderInner,
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
    color: cfg.colors.accent,
  },
  academyNameAr: {
    fontFamily: 'NamaaArabic',
    fontSize: 11,
    color: cfg.colors.textMuted,
    marginTop: 2,
  },
  title: {
    fontFamily: 'NamaaSerif',
    fontSize: 30,
    marginTop: 14,
    color: cfg.colors.accent,
  },
  subtitle: {
    fontSize: 10,
    color: cfg.colors.textMuted,
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
    color: cfg.colors.accent,
  },
  body: {
    marginTop: 18,
  },
  label: {
    fontSize: 9,
    color: cfg.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recipientName: {
    marginTop: 6,
    fontFamily: 'NamaaSerif',
    fontSize: 26,
    color: cfg.colors.accent,
  },
  statement: {
    marginTop: 14,
    fontSize: 11,
    color: cfg.colors.textMain,
    lineHeight: 1.4,
  },
  courseTitle: {
    marginTop: 10,
    fontFamily: 'NamaaSerif',
    fontSize: 18,
    color: cfg.colors.accent,
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
    color: cfg.colors.textMuted,
    textTransform: 'uppercase',
  },
  metaValue: {
    marginTop: 3,
    fontSize: 11,
    color: cfg.colors.textMain,
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
    borderBottomColor: cfg.colors.textMuted,
  },
  signatureName: {
    marginTop: 4,
    fontSize: 11,
    color: cfg.colors.textMain,
  },
  signatureLabel: {
    fontSize: 9,
    color: cfg.colors.textMuted,
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
    borderColor: cfg.colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sealInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: cfg.colors.badgeBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sealText: {
    fontSize: 9,
    color: cfg.colors.badgeText,
    textAlign: 'center',
  },
  qrBlock: {
    width: '32%',
    alignItems: 'flex-end',
  },
  qrLabel: {
    fontSize: 8,
    color: cfg.colors.textMuted,
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
    color: cfg.colors.textMuted,
  },
});

