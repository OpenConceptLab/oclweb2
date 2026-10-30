import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { getAnnouncement, isDismissed, rememberDismissal } from '../../common/announcement';

// This deployment's announcement, from its ANNOUNCEMENT setting (README,
// "Announcement banner"), fixed above the app bar. Same component in TBv3 and
// the Mapper. Unset, malformed or past its until, nothing shows. Text and
// labels show as plain text. A dismissal lasts until the setting's id changes.

// The banner's height while it shows. Header moves the app bar, the left menu
// and the content down by it, and so does anything fixed below the app bar.
const HEIGHT_VAR = '--announcement-height';

// OCL v3 design tokens (primary.95, primary.main, surface.dark,
// surface.contrastText). TBv2's theme predates them, and the strip has to match
// TBv3 and the Mapper.
const V3 = { background: '#f2efff', primary: '#4836ff', title: '#1c1b1f', text: '#47464f' };

const AnnouncementBanner = () => {
  const { t, i18n } = useTranslation();
  const announcement = getAnnouncement(window.ANNOUNCEMENT, i18n.language);
  const [dismissed, setDismissed] = React.useState(() => Boolean(announcement) && isDismissed(announcement.id));
  const open = Boolean(announcement) && !dismissed;
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
    rememberDismissal(announcement.id);
    setDismissed(true);
  };

  if (!open)
    return null;

  // Gutters and z-index match the app bar's. mui-fixed lets MUI's scroll lock pad
  // it like the app bar when a modal opens, so the close button doesn't jump.
  return (
    <Box
      ref={ref}
      className='mui-fixed'
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
          {announcement.text}
        </Typography>
        {
          announcement.links.length > 0 &&
            <Typography variant='body2' sx={{ color: V3.text }}>
              {announcement.links.map(({ label, url }, i) => (
                <React.Fragment key={i}>
                  {i ? ' · ' : ''}
                  <Link
                    href={url}
                    target='_blank'
                    rel='noopener noreferrer'
                    underline='always'
                    sx={{
                      fontWeight: 600,
                      color: V3.primary,
                      textDecorationColor: 'rgba(72, 54, 255, 0.4)',
                      // The text may wrap between the links, never inside one.
                      whiteSpace: 'nowrap',
                      '&:hover, &:focus': { color: V3.primary },
                      // App.scss removes the focus outline from every link.
                      '&:focus-visible': { outline: `2px solid ${V3.primary} !important`, outlineOffset: '2px' },
                    }}
                  >
                    {label}
                  </Link>
                </React.Fragment>
              ))}
            </Typography>
        }
      </Box>
      <IconButton size='small' aria-label={t('common.close')} onClick={onClose}>
        <CloseIcon fontSize='small' />
      </IconButton>
    </Box>
  );
};

export default AnnouncementBanner;
