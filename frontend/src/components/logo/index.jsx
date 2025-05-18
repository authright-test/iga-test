import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// material-ui
import ButtonBase from '@mui/material/ButtonBase';

// project imports
import Logo from './LogoMain';
import LogoIcon from './LogoIcon';
import { APP_DEFAULT_PATH } from 'config';

// ==============================|| MAIN LOGO ||============================== //

export default function LogoSection({ reverse, isIcon, sx, to }) {
  return (
    <ButtonBase disableRipple component={Link} to={to || APP_DEFAULT_PATH} sx={sx}>
      {/*{isIcon ? <LogoIcon /> : <Logo reverse={reverse} />}*/}
      {isIcon ? <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#1f7cd0' }}>IGA</Typography> :
        <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#1f7cd0' }}>Github Access Control</Typography>
      }

    </ButtonBase>
  );
}

LogoSection.propTypes = { reverse: PropTypes.bool, isIcon: PropTypes.bool, sx: PropTypes.any, to: PropTypes.any };
