import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';

// project imports
import NavItem from '../NavItem';

// assets
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

// ==============================|| SIDEBAR MENU LIST COLLAPSE ITEMS ||============================== //

const SIDEBAR_COLLAPSE_STORAGE_KEY = 'sidebar-open-collapses';

const getStoredOpenMenus = () => {
  if (typeof window === 'undefined') return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(SIDEBAR_COLLAPSE_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const setStoredOpenMenus = (menuIds) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SIDEBAR_COLLAPSE_STORAGE_KEY, JSON.stringify(menuIds));
};

const NavCollapse = ({ menu, level }) => {
  const theme = useTheme();
  const customization = useSelector((state) => state.customization);

  const [open, setOpen] = useState(() => getStoredOpenMenus().includes(menu.id));
  const [selected, setSelected] = useState(null);

  const handleClick = () => {
    const nextOpen = !open;
    const storedMenus = getStoredOpenMenus();
    const nextStoredMenus = nextOpen ? [...new Set([...storedMenus, menu.id])] : storedMenus.filter((id) => id !== menu.id);

    setOpen(nextOpen);
    setSelected(nextOpen ? menu.id : null);
    setStoredOpenMenus(nextStoredMenus);
  };

  const { pathname } = useLocation();

  const hasMatchingChildRoute = (items = []) =>
    items.some((item) => {
      if (item.url && (item.url === pathname || pathname.startsWith(`${item.url}/`))) {
        return true;
      }

      if (item.children?.length) {
        return hasMatchingChildRoute(item.children);
      }

      return false;
    });

  const syncStoredMenus = (shouldBeOpen) => {
    const storedMenus = getStoredOpenMenus();
    const nextStoredMenus = shouldBeOpen
      ? [...new Set([...storedMenus, menu.id])]
      : storedMenus.filter((id) => id !== menu.id);

    setStoredOpenMenus(nextStoredMenus);
  };

  // menu collapse for sub-levels
  useEffect(() => {
    const hasStoredOpenState = getStoredOpenMenus().includes(menu.id);
    const hasMatchingRoute =
      (menu.url && (pathname === menu.url || pathname.startsWith(`${menu.url}/`))) || hasMatchingChildRoute(menu.children);
    const shouldOpen = hasStoredOpenState || hasMatchingRoute;

    setOpen(shouldOpen);
    setSelected(shouldOpen ? menu.id : null);

    if (hasMatchingRoute) {
      syncStoredMenus(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, menu.children, menu.id, menu.url]);

  // menu collapse & item
  const menus = menu.children?.map((item) => {
    switch (item.type) {
      case 'collapse':
        return <NavCollapse key={item.id} menu={item} level={level + 1} />;
      case 'item':
        return <NavItem key={item.id} item={item} level={level + 1} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  const Icon = menu.icon;
  const menuIcon = menu.icon ? (
    <Icon strokeWidth={1.5} size="1.3rem" style={{ marginTop: 'auto', marginBottom: 'auto' }} />
  ) : (
    <FiberManualRecordIcon
      sx={{
        width: selected === menu.id ? 8 : 6,
        height: selected === menu.id ? 8 : 6
      }}
      fontSize={level > 0 ? 'inherit' : 'medium'}
    />
  );

  return (
    <>
      <ListItemButton
        sx={{
          borderRadius: `${customization.borderRadius}px`,
          mb: 0.5,
          alignItems: 'flex-start',
          backgroundColor: level > 1 ? 'transparent !important' : 'inherit',
          py: level > 1 ? 1 : 1.25,
          pl: `${level * 24}px`
        }}
        selected={selected === menu.id}
        onClick={handleClick}
      >
        <ListItemIcon sx={{ my: 'auto', minWidth: !menu.icon ? 18 : 36 }}>{menuIcon}</ListItemIcon>
        <ListItemText
          primary={
            <Typography variant={selected === menu.id ? 'h5' : 'body1'} color="inherit" sx={{ my: 'auto' }}>
              {menu.title}
            </Typography>
          }
          secondary={
            menu.caption && (
              <Typography variant="caption" sx={{ ...theme.typography.subMenuCaption }} display="block" gutterBottom>
                {menu.caption}
              </Typography>
            )
          }
        />
        {open ? (
          <IconChevronUp stroke={1.5} size="1rem" style={{ marginTop: 'auto', marginBottom: 'auto' }} />
        ) : (
          <IconChevronDown stroke={1.5} size="1rem" style={{ marginTop: 'auto', marginBottom: 'auto' }} />
        )}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List
          component="div"
          disablePadding
          sx={{
            position: 'relative',
            '&:after': {
              content: "''",
              position: 'absolute',
              left: '32px',
              top: 0,
              height: '100%',
              width: '1px',
              opacity: 1,
              background: theme.palette.primary.light
            }
          }}
        >
          {menus}
        </List>
      </Collapse>
    </>
  );
};

NavCollapse.propTypes = {
  menu: PropTypes.object,
  level: PropTypes.number
};

export default NavCollapse;
