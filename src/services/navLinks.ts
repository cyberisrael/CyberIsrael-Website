import siteRoutes from '@/siteRoutes.json'

/** Menu and footer links, in siteRoutes.json order; label is the `nav.*` translation key. */
export const navLinks = siteRoutes.flatMap((route) =>
  'nav' in route ? [{ to: route.path, labelKey: `nav.${route.nav}` }] : []
)
