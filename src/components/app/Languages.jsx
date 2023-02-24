import React from 'react';
import { useTranslation } from "react-i18next";
import { Menu, ListItemButton, Button } from '@mui/material'
import LanguageIcon from '@mui/icons-material/Language';
import PopperGrow from '../common/PopperGrow';

const Languages = () => {
  const { t, i18n } = useTranslation();
  const [locale, setLocale] = React.useState(i18n.language || 'en')
  const [open, setOpen] = React.useState(false)
  const anchorRef = React.useRef(null);
  const handleClick = _lang => {
    setLocale(_lang)
    i18n.changeLanguage(_lang)
    setOpen(false)
  };
  const toggleMenu = () => setOpen(!open)

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target))
      return;

    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button startIcon={<LanguageIcon fontSize='inherit'/>} onClick={toggleMenu} ref={anchorRef}>
        {locale.toUpperCase()}
      </Button>
      <PopperGrow open={open} anchorRef={anchorRef} handleClose={handleClose} minWidth="100px">
        <div>
          {
            [{locale: 'en', name: 'English'}, {locale: 'es', name: "Español"}].map(lang => (
              <ListItemButton selected={lang.locale === locale} key={lang.locale} onClick={() => handleClick(lang.locale)}>
                {lang.name} - {lang.locale.toUpperCase()}
              </ListItemButton>
            ))
          }
        </div>
      </PopperGrow>
    </React.Fragment>
  );
}

export default Languages;
