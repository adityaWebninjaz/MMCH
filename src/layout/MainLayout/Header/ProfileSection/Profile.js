import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Rating,
  Select,
  TextField,
  Box,
  IconButton
} from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import ClearIcon from '@mui/icons-material/Clear';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

import Cookies from 'js-cookie';
import axios from 'axios';

const UserProfile = (props) => {
  const { open, handleClose } = props;
  const [hostelId, setHostelId] = useState(null);
  const [userData, setUserData] = useState(null);

  const [hostelPhotoPreview, setHostelPhotoPreview] = useState('');
  const [aadharPhotoPreview, setAadharPhotoPreview] = useState('');

  const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const fetchProfileData = async (hostelId) => {
    try {
      const response = await axios.get(`${REACT_APP_BACKEND_URL}/hostel/view/${hostelId}`);

      setUserData(response.data.result);
    } catch (error) {
      console.error('Error fetching hostel profile data:', error);
    }
  };

  // useEffect(() => {
  //   const HosId = Cookies.get('_Id');
  //   if (HosId) {
  //     setHostelId(HosId);
  //   }
  //   fetchProfileData(HosId);
  // }, [open]);

  const validationSchema = yup.object({
    hostelName: Yup.string()
      .matches(/^[A-Za-z\s]+$/, 'Hostel Name must contain only letters and spaces')
      .max(50, 'Hostel Name must be at most 50 characters')
      .required('Hostel Name is required'),
    hostelPhoneNumber: Yup.string()
      .matches(/^\d{10}$/, 'Phone number must be 10 digits')
      .required('Phone number is required'),
    ownerName: Yup.string()
      .matches(/^[A-Za-z\s]+$/, 'Owner Name must contain only letters and spaces')
      .max(50, 'Owner Name must be at most 50 characters')
      .required('Owner Name is required'),
    ownerPhoneNumber: Yup.string()
      .matches(/^\d{10}$/, 'Phone number must be 10 digits')
      .required('Phone number is required'),
    address: Yup.string().required('Address is required'),
    email: yup.string().email('Enter a valid email').required('Email is required')
  });

  const initialValues = {
    hostelName: userData ? userData.hostelName : '',
    hostelPhoneNumber: userData ? userData.hostelPhoneNumber : '',
    ownerName: userData ? userData.ownerName : '',
    ownerPhoneNumber: userData ? userData.ownerPhoneNumber : '',
    address: userData ? userData.address : '',
    email: userData ? userData.email : '',
    hostelphoto: null,
    // aadharphoto: null
  };

  // Formik setup
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append('hostelName', values.hostelName);
        formData.append('hostelPhoneNumber', values.hostelPhoneNumber);

        formData.append('ownerName', values.ownerName);
        formData.append('ownerPhoneNumber', values.ownerPhoneNumber);

        formData.append('address', values.address);

        formData.append('hostelphoto', values.hostelphoto);
        // formData.append('aadharphoto', values.aadharphoto);

        const response = await axios.put(`${REACT_APP_BACKEND_URL}/hostel/edit/${userData._id}`, formData);

        if (response.status === 200) {
          toast.success('Profile updated successfully');
          handleClose();
          // fetchProfileData(hostelId);
        }
      } catch (error) {
        console.error('Error updating profile data:', error);
        toast.error('Error updating profile data');
      }
    }
  });

  useEffect(() => {
    if (open && userData) {
      if (userData.hostelphoto && !hostelPhotoPreview) {
        setHostelPhotoPreview(`${REACT_APP_BACKEND_URL}${userData.hostelphoto}`);
      }
      // if (userData.aadharphoto && !aadharPhotoPreview) {
      //   setAadharPhotoPreview(`${REACT_APP_BACKEND_URL}${userData.aadharphoto}`);
      // }
    }
  }, [open, userData]);

  const handleImageChange = (event) => {
    const file = event.currentTarget.files[0];
    if (!file) return;

    const img = new Image();
    

    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      const { width, height } = img;
     

      if (width <= 1000 && height <= 239) {
        formik.setFieldValue('hostelphoto', file);
        setHostelPhotoPreview(objectUrl);
      } else {
        toast.error('Image must be max 1000px width and 239px height');
        event.target.value = null; 
        setHostelPhotoPreview(null);
      }
    };

    img.onerror = () => {
      toast.error('Invalid image file.');
      URL.revokeObjectURL(objectUrl);
    };
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        maxWidth="xs"
      >
        <DialogTitle
          id="scroll-dialog-title"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography
            variant="h6"
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              textAlign: 'center',
              flexGrow: 1
            }}
          >
            Profile Details
          </Typography>
          <ClearIcon onClick={handleClose} style={{ cursor: 'pointer' }} />
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={formik.handleSubmit}>
            <DialogContentText id="scroll-dialog-description" tabIndex={-1}>
              <Grid container rowSpacing={3} columnSpacing={{ xs: 0, sm: 5, md: 4 }}>
                <Grid item xs={12}>
                  <FormLabel>Hostel Name</FormLabel>
                  <TextField
                    id="hostelName"
                    name="hostelName"
                    size="small"
                    fullWidth
                    value={formik.values.hostelName}
                    onChange={formik.handleChange}
                    error={formik.touched.hostelName && Boolean(formik.errors.hostelName)}
                    helperText={formik.touched.hostelName && formik.errors.hostelName}
                  />
                </Grid>

                {/* Hostel Phone Number */}
                <Grid item xs={12}>
                  <FormLabel>Hostel Phone Number</FormLabel>
                  <TextField
                    id="hostelPhoneNumber"
                    name="hostelPhoneNumber"
                    size="small"
                    fullWidth
                    type="number"
                    value={formik.values.hostelPhoneNumber}
                    onChange={formik.handleChange}
                    error={formik.touched.hostelPhoneNumber && Boolean(formik.errors.hostelPhoneNumber)}
                    helperText={formik.touched.hostelPhoneNumber && formik.errors.hostelPhoneNumber}
                  />
                </Grid>

                {/* Owner Name */}
                <Grid item xs={12}>
                  <FormLabel>Owner Name</FormLabel>
                  <TextField
                    id="ownerName"
                    name="ownerName"
                    size="small"
                    fullWidth
                    value={formik.values.ownerName}
                    onChange={formik.handleChange}
                    error={formik.touched.ownerName && Boolean(formik.errors.ownerName)}
                    helperText={formik.touched.ownerName && formik.errors.ownerName}
                  />
                </Grid>

                {/* Owner Phone Number */}
                <Grid item xs={12}>
                  <FormLabel>Owner Phone Number</FormLabel>
                  <TextField
                    id="ownerPhoneNumber"
                    name="ownerPhoneNumber"
                    size="small"
                    fullWidth
                    type="number"
                    value={formik.values.ownerPhoneNumber}
                    onChange={formik.handleChange}
                    error={formik.touched.ownerPhoneNumber && Boolean(formik.errors.ownerPhoneNumber)}
                    helperText={formik.touched.ownerPhoneNumber && formik.errors.ownerPhoneNumber}
                  />
                </Grid>

                {/* Address */}
                <Grid item xs={12}>
                  <FormLabel>Address</FormLabel>
                  <TextField
                    id="address"
                    name="address"
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    error={formik.touched.address && Boolean(formik.errors.address)}
                    helperText={formik.touched.address && formik.errors.address}
                  />
                </Grid>

                {/* Email (disabled) */}
                <Grid item xs={12}>
                  <FormLabel>Email</FormLabel>
                  <TextField
                    id="email"
                    name="email"
                    size="small"
                    fullWidth
                    disabled
                    value={formik.values.email}
                    onChange={formik.handleChange}
                  />
                </Grid>

                {/* <Grid item xs={12}>
                  <FormLabel>Hostel Photo</FormLabel>
                  <TextField
                    id="hostelphoto"
                    name="hostelphoto"
                    type="file"
                    size="small"
                    fullWidth
                    onChange={(event) => {
                      const file = event.currentTarget.files[0];
                      formik.setFieldValue('hostelphoto', file);
                      setHostelPhotoPreview(URL.createObjectURL(file));
                    }}
                  />
                  {hostelPhotoPreview && (
                    <img src={hostelPhotoPreview} alt="Hostel Preview" style={{ marginTop: 8, maxHeight: 80, display: 'block' }} />
                  )}
                </Grid> */}

                <Grid item xs={12}>
                  <FormLabel>Hostel Photo</FormLabel>
                  <TextField
                    id="hostelphoto"
                    name="hostelphoto"
                    type="file"
                    size="small"
                    fullWidth
                    inputProps={{ accept: 'image/*' }}
                    onChange={handleImageChange}
                  />
                  {hostelPhotoPreview && (
                    <img src={hostelPhotoPreview} alt="Hostel Preview" style={{ marginTop: 8, maxHeight: 80, display: 'block' }} />
                  )}
                </Grid>

               
              </Grid>
            </DialogContentText>
          </form>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button onClick={formik.handleSubmit} variant="contained" color="primary">
            Edit
          </Button>
          <Button
            onClick={() => {
              formik.resetForm();
              handleClose();
            }}
            variant="outlined"
            color="error"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default UserProfile;
