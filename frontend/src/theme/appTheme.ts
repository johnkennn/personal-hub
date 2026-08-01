import { theme, type ThemeConfig } from 'antd'

/** Deep studio palette: ink + moss (PRD V1.0.0 visual direction A) */
export const appTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#7cb89a',
    colorInfo: '#7cb89a',
    colorSuccess: '#7cb89a',
    colorWarning: '#d4a574',
    colorError: '#e57373',
    colorBgBase: '#0f1714',
    colorTextBase: '#e8f0ec',
    colorBgContainer: '#16201c',
    colorBgElevated: '#1a2621',
    colorBorder: '#2a3a33',
    colorBorderSecondary: '#24302b',
    borderRadius: 10,
    fontFamily:
      '"Noto Sans SC", "PingFang SC", "Hiragino Sans GB", system-ui, sans-serif',
    fontSize: 15,
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: 'rgba(15, 23, 20, 0.85)',
      bodyBg: '#0f1714',
      footerBg: '#0c1210',
      triggerBg: '#16201c',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(124, 184, 154, 0.16)',
      darkItemHoverBg: 'rgba(124, 184, 154, 0.1)',
    },
    Button: {
      primaryShadow: '0 0 0 0 transparent',
    },
  },
}

export const cssVars = {
  bg: '#0f1714',
  bgElevated: '#16201c',
  text: '#e8f0ec',
  muted: '#8fa398',
  accent: '#7cb89a',
  accentSoft: 'rgba(124, 184, 154, 0.14)',
  border: '#2a3a33',
  fontDisplay: '"Noto Serif SC", "Songti SC", serif',
  fontBody: '"Noto Sans SC", "PingFang SC", system-ui, sans-serif',
} as const
