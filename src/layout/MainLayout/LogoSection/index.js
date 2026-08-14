// import { Link } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';

// // material-ui
// import { ButtonBase } from '@mui/material';

// // project imports
// import config from 'config';
// import Logo from 'ui-component/Logo';
// import { MENU_OPEN } from 'store/actions';

// // ==============================|| MAIN LOGO ||============================== //

// const LogoSection = () => {
//   const defaultId = useSelector((state) => state.customization.defaultId);
//   const dispatch = useDispatch();
//   return (
//     <ButtonBase disableRipple onClick={() => dispatch({ type: MENU_OPEN, id: defaultId })} component={Link} to={config.defaultPath}>
//       <Logo />
//     </ButtonBase>
//   );
// };

// export default LogoSection;

import { useEffect, useState } from 'react';

// import Logo from 'ui-component/HotelCRM-logo.png';
// import Logo from '../../../assets/images/HMS1.png';
import { ButtonBase } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import Logo from '../../../assets/images/New_logo.ong.png';
// import LogoMain from '../../../assets/images/admin-logo.png';
import LogoMain from '../../../assets/images/Logo.png';


const LogoSection = () => {
  // useEffect(() => {
  //     const HosId = Cookies.get('_Id');
  //     if (HosId) {
  //       setHostelId(HosId);
  //     }
  //     fetchProfileData(HosId);
  //   }, [open]);
  // const hotel = JSON.parse(localStorage.getItem('hotelData'));

  const hostelId = Cookies.get('_Id');

  const [logoUrl, setLogoUrl] = useState(Logo);
  const baseUrl = process.env.REACT_APP_BACKEND_URL || 'https://smarthostel.samyotech.in';
  console.log(' baseUrl :', baseUrl);

  const fetchHotelData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/hostel/view/${hostelId}`);

      const photo = response?.data?.result?.hostelphoto;
      const fullImageUrl = photo ? `${baseUrl}${photo}` : LogoMain;
      console.log('fullImageUrl :', fullImageUrl);

      setLogoUrl(fullImageUrl);
    } catch (error) {
      console.log('Error fetching hotel data:', error);
    }
  };

  // useEffect(() => {
  //   fetchHotelData();
  // }, []);

  return (
    <ButtonBase
      style={{
        width: '171px',
        height: '100%',
        overflow: 'hidden',
        paddingLeft:"55px"
      }}
      disableRipple
    >
      <img
        src={logoUrl}
        alt="logo"
        style={{
          width: '90px',
          height: '100%',
          objectFit: 'cover',
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = LogoMain;
        }}
      />
    </ButtonBase>
  );
};

export default LogoSection;
