import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Logo from 'components/logo';
import PropTypes from 'prop-types';
import GuestFooter from './GuestFooter';

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

export default function GuestWrapper({ children }) {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Grid container direction='column' justifyContent='flex-end' sx={{ minHeight: '100vh' }}>
        <Grid sx={{ px: 3, mt: 3 }} size={12}>
          <Logo to='#' />
        </Grid>
        <Grid size={12}>
          <Grid
            container
            justifyContent='center'
            alignItems='center'
            sx={{ minHeight: { xs: 'calc(100vh - 210px)', sm: 'calc(100vh - 134px)', md: 'calc(100vh - 132px)' } }}
          >
            <Grid>
              {children}
            </Grid>
          </Grid>
        </Grid>
        <Grid sx={{ p: 3 }} size={12}>
          <GuestFooter />
        </Grid>
      </Grid>
    </Box>
  );
}

GuestWrapper.propTypes = { children: PropTypes.node };
