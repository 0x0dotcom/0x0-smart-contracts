import colors from 'vuetify/es5/util/colors'

export default {
  theme: {
    dark: false,
    themes: {
      light: {
        primary: '#50D6F5',
        secondary: colors.grey.darken3,
        accent: colors.shades.black,
        error: colors.red.accent3,
      },
      dark: {
        primary: '#50D6F5',
        secondary: '#50D6F5',
        secondaryLight: colors.indigo.lighten2,
        third: colors.teal.darken1,
        thirdLight: colors.teal.lighten1,
        grey: colors.grey.darken1,
        red: colors.red.lighten2,
        accent: '#0693e3',
        error: '#ff4444',
        info: '#33b5e5',
        success: '#00C851',
        warning: '#f9be3f',
        edgeColor: '#3A87AD',
      },
    },
  },
}
