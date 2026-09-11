import { theme, type ThemeConfig } from 'antd'

/** AI Hub：深空底 + 青绿 / 电蓝强调 */
export const appTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#2ee6a6',
    colorInfo: '#3d9eff',
    colorSuccess: '#2ee6a6',
    colorWarning: '#f5b942',
    colorError: '#ff6b8a',
    colorBgBase: '#05070f',
    colorTextBase: '#e8f4ff',
    colorBgContainer: '#0c1220',
    colorBgElevated: '#121a2c',
    colorBorder: 'rgba(100, 140, 200, 0.22)',
    colorBorderSecondary: 'rgba(80, 110, 160, 0.16)',
    borderRadius: 14,
    fontFamily:
      '"Noto Sans SC", "PingFang SC", "Hiragino Sans GB", system-ui, sans-serif',
    fontSize: 13,
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: 'rgba(5, 7, 15, 0.72)',
      bodyBg: '#05070f',
      footerBg: 'rgba(5, 7, 15, 0.9)',
      triggerBg: '#0c1220',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(46, 230, 166, 0.16)',
      darkItemHoverBg: 'rgba(61, 158, 255, 0.1)',
      darkItemSelectedColor: '#2ee6a6',
    },
    Button: {
      primaryShadow: '0 0 18px rgba(46, 230, 166, 0.35)',
    },
    Card: {
      colorBgContainer: 'rgba(12, 18, 32, 0.82)',
    },
    Input: {
      activeBorderColor: '#2ee6a6',
      hoverBorderColor: '#3d9eff',
    },
  },
}

export const cssVars = {
  bg: '#05070f',
  bgElevated: '#0c1220',
  text: '#e8f4ff',
  muted: '#8ba3c7',
  accent: '#2ee6a6',
  accentSoft: 'rgba(46, 230, 166, 0.14)',
  border: 'rgba(100, 140, 200, 0.22)',
  fontDisplay: '"Orbitron", "Syne", "Noto Sans SC", system-ui, sans-serif',
  fontBody: '"Noto Sans SC", "PingFang SC", system-ui, sans-serif',
} as const
