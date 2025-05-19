// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import { FiGithub } from 'react-icons/fi';

// project imports
import Search from './Search';
import Profile from './Profile';
import Notification from './Notification';
import MobileSection from './MobileSection';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  return (
    <>
      {/*place holder for search when downLG is false*/}
      {!downLG && <Box sx={{ width: '100%', ml: { xs: 0, md: 1 } }} />}
      {/*{!downLG && <Search />}*/}
      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}
      <IconButton
        component={Link}
        href='#'
        target='_blank'
        disableRipple
        color='secondary'
        title='Github'
        sx={{ color: 'text.primary', bgcolor: 'grey.100' }}
      >
        <FiGithub />
      </IconButton>

      {/*<Notification />*/}
      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
}
