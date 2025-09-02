import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

function SummaryCard({ title, value, subtitle, icon, color = '#1976D2' }) {
  return (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'background.paper',
        borderRadius: 3,
        boxShadow: 3,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
        border: `1px solid ${color}20`,
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: '50%',
            p: 1.5,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 8px ${color}40`,
          }}
        >
          {React.cloneElement(icon, { sx: { color: 'white', fontSize: 28 } })}
        </Box>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Typography 
        variant="h4" 
        component="div" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold',
          color: color,
          mb: 1
        }}
      >
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
        {subtitle}
      </Typography>
    </Paper>
  );
}

export default SummaryCard; 