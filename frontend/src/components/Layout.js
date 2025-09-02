import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as SalesIcon,
  Inventory as InventoryIcon,
  People as ClientsIcon,
  Business as SuppliersIcon,
  Logout as LogoutIcon,
  Agriculture as AgricultureIcon,
} from '@mui/icons-material';
import { removeToken } from '../utils/auth';

const drawerWidth = 240;

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Ventas', icon: <SalesIcon />, path: '/sales' },
    { text: 'Inventario', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Clientes', icon: <ClientsIcon />, path: '/clients' },
    { text: 'Proveedores', icon: <SuppliersIcon />, path: '/suppliers' },
  ];

  const isActive = (path) => location.pathname === path;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header del drawer */}
      <Box sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <Avatar sx={{ 
          width: 60, 
          height: 60, 
          mx: 'auto', 
          mb: 2,
          backgroundColor: 'rgba(255,255,255,0.2)'
        }}>
          <AgricultureIcon sx={{ fontSize: 30 }} />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          AgroGestión
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Sistema de Gestión Agropecuaria
        </Typography>
      </Box>

      <Divider />

      {/* Menú de navegación */}
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 2,
              cursor: 'pointer',
              backgroundColor: isActive(item.path) ? 'primary.main' : 'transparent',
              color: isActive(item.path) ? 'white' : 'text.primary',
              '&:hover': {
                backgroundColor: isActive(item.path) ? 'primary.dark' : 'action.hover',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ListItemIcon sx={{ 
              color: isActive(item.path) ? 'white' : 'text.primary',
              minWidth: 40
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontWeight: isActive(item.path) ? 600 : 400,
                }
              }}
            />
            {isActive(item.path) && (
              <Chip 
                label="Activo" 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: '0.7rem'
                }} 
              />
            )}
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Botón de logout */}
      <List>
        <ListItem
          onClick={handleLogout}
          sx={{
            mx: 1,
            mb: 1,
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'white',
              '& .MuiListItemIcon-root': {
                color: 'white',
              }
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <AgricultureIcon sx={{ mr: 1 }} />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              Sistema de Gestión Agropecuaria
            </Typography>
          </Box>
          <Chip 
            label="En línea" 
            color="success" 
            size="small"
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '& .MuiChip-icon': {
                color: 'white'
              }
            }}
          />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '0 0 20px rgba(0,0,0,0.1)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '0 0 20px rgba(0,0,0,0.1)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout; 