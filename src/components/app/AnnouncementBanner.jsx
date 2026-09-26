import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { TBV2_ANNOUNCEMENT_URL } from '../../common/constants';

// OCL Online-wide announcement strip, fixed above the app bar and styled like
// the community site's AnnouncementBanner, so it reads as sitting above the
// tool rather than inside it. Same component in TBv3 and the Mapper. Update
// announcement.* in the locale bundles (and bump ANNOUNCEMENT_ID) to re-show a
// new announcement to visitors who dismissed a previous one.
const ANNOUNCEMENT_ID = 'tbv2-tbv3-public-preview-2026-09';

const DISMISSED_KEY = 'announcementDismissed';

// The banner's height while it shows. Header moves the app bar, the left menu
// and the content down by it, and so does anything fixed below the app bar.
const HEIGHT_VAR = '--announcement-height';

// OCL v3 design tokens (primary.95, primary.main, surface.dark,
// surface.contrastText). TBv2's theme predates them, and the strip has to match
// the other OCL Online apps.
const V3 = { background: '#f2efff', primary: '#4836ff', title: '#1c1b1f', text: '#47464f' };

const isDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED_KEY) === ANNOUNCEMENT_ID;
  } catch {
    return false;
  }
};

const rememberDismissal = () => {
  try {
    localStorage.setItem(DISMISSED_KEY, ANNOUNCEMENT_ID);
  } catch {
    // storage unavailable (private mode, blocked cookies); the banner simply reappears
  }
};

const AnnouncementBanner = () => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(!isDismissed());
  const ref = React.useRef(null);

  // Publish the banner's height (it wraps on narrow screens and in longer
  // translations) and clear it once dismissed.
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el)
      return;
    const root = document.documentElement.style;
    const update = () => root.setProperty(HEIGHT_VAR, `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.removeProperty(HEIGHT_VAR);
    };
  }, [open]);

  const onClose = () => {
    rememberDismissal();
    setOpen(false);
  };

  if (!open)
    return null;

  // Gutters match the app bar's Toolbar. z-index matches the app bar's too.
  return (
    <Box
      ref={ref}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: V3.background,
        py: 1,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <CampaignOutlinedIcon fontSize='small' sx={{ color: V3.primary }} />
        <Typography variant='body2' sx={{ fontWeight: 600, color: V3.title }}>
          {t('announcement.title')}
        </Typography>
        <Typography variant='body2' sx={{ color: V3.text }}>
          {t('announcement.text')}{' '}
          <Link
            href={TBV2_ANNOUNCEMENT_URL}
            target='_blank'
            rel='noopener noreferrer'
            underline='always'
            sx={{ fontWeight: 600, color: V3.primary, textDecorationColor: 'rgba(72, 54, 255, 0.4)', '&:hover, &:focus': { color: V3.primary } }}
          >
            {t('announcement.link_label')}
          </Link>
        </Typography>
      </Box>
      <IconButton size='small' aria-label={t('announcement.dismiss')} onClick={onClose}>
        <CloseIcon fontSize='small' />
      </IconButton>
    </Box>
  );
};

export default AnnouncementBanner;
