import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const TermsAndConditions = () => {
  return (
    <Box sx={{ bgcolor: '#f4f4f4', py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" color="primary" gutterBottom>
            Terms and Conditions for Hostel CRM
          </Typography>

          <Typography variant="h5" component="h2" color="primary" gutterBottom>
            1. Introduction
          </Typography>
          <Typography variant="body1" paragraph>
            Welcome to Hostel360 CRM. These Terms and Conditions outline the rules and regulations for the use of Hostel360 CRM, which is a product of Samyotech Software Solutions Pvt Ltd.
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing this CRM, we assume you accept these terms and conditions. Do not continue to use Hostel360 CRM if you do not agree to take all of the terms and conditions stated on this page.
          </Typography>

          <Typography variant="h5" component="h2" color="primary" gutterBottom>
            2. Definitions
          </Typography>
          <List>
            <ListItem>
              <Typography>
                <strong>Company:</strong> refers to Samyotech Software Solutions Pvt Ltd, the owner and operator of the CRM.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                <strong>User:</strong> refers to any individual or entity using the CRM.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                <strong>Service:</strong> refers to the functionalities provided by the Hostel CRM.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                <strong>Data:</strong> refers to any information input by the User into the CRM.
              </Typography>
            </ListItem>
          </List>

          <Typography variant="h5" component="h2" color="primary" gutterBottom>
            3. Use of the CRM
          </Typography>
          <Typography variant="body1" paragraph>
            The CRM is intended for managing hostel operations, including but not limited to booking management, guest records, payments, and communications.
          </Typography>
          <Typography variant="body1" paragraph>
            Users must provide accurate and complete information during the registration process.
          </Typography>
          <Typography variant="body1" paragraph>
            Users are responsible for maintaining the confidentiality of their account and password.
          </Typography>

          <Typography variant="h5" component="h2" color="primary" gutterBottom>
            4. User Responsibilities
          </Typography>
          <Typography variant="body1" paragraph>
            Users agree to use the CRM only for lawful purposes and in a manner that does not infringe the rights of, or restrict the use of the CRM by, any third party.
          </Typography>
          <Typography variant="body1" paragraph>
            Users must not use the CRM to distribute or store any material that is unlawful, harmful, abusive, or otherwise objectionable.
          </Typography>

          <Typography variant="h5" component="h2" color="primary" gutterBottom>
            5. Data Privacy and Security
          </Typography>
          <Typography variant="body1" paragraph>
            The Company is committed to protecting the privacy and security of User data. All data entered into the CRM will be stored securely and used only in accordance with our Privacy Policy.
          </Typography>
          <Typography variant="body1" paragraph>
            Users are responsible for maintaining the confidentiality and security of their login credentials.
          </Typography>

          <Typography variant="h5" component="h2" color="primary" gutterBottom>
            6. Intellectual Property
          </Typography>
          <Typography variant="body1" paragraph>
            The CRM and its original content, features, and functionality are and will remain the exclusive property of Samyotech Software Solutions Pvt Ltd and its licensors.
          </Typography>
          <Typography variant="body1" paragraph>
            Users are granted a limited, non-exclusive, non-transferable license to access and use the CRM for hostel management purposes.
          </Typography>

          <Typography variant="h5" component="h2" color="primary" gutterBottom>
            7. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            The CRM is provided on an as is and as available basis. The Company makes no warranties, either express or implied, regarding the CRM, including but not limited to its performance, availability, or suitability for any particular purpose.
          </Typography>
          <Typography variant="body1" paragraph>
            The Company shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to the use of the CRM.
          </Typography>

          <Typography variant="h5" component="h2" color="primary" gutterBottom>
            8. Termination
          </Typography>
          <Typography variant="body1" paragraph>
            The Company reserves the right to terminate or suspend access to the CRM at any time, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </Typography>
          <Typography variant="body1" paragraph>
            Upon termination, your right to use the CRM will immediately cease.
          </Typography>

          <Typography variant="h5" component="h2" color="primary" gutterBottom>
            9. Changes to the Terms
          </Typography>
          <Typography variant="body1" paragraph>
            The Company reserves the right, at its sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </Typography>

          <Typography variant="h5" component="h2" color="primary" gutterBottom>
            10. Governing Law
          </Typography>
          <Typography variant="body1" paragraph>
            These Terms shall be governed and construed in accordance with the laws of India/MP, without regard to its conflict of law provisions.
          </Typography>
          <Typography variant="body1" paragraph>
            Any disputes arising from or relating to these Terms or the use of the CRM shall be resolved in the courts of India/MP.
          </Typography>

          <Typography variant="h5" component="h2" color="primary" gutterBottom>
            11. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            For any questions about these Terms, please contact us at +91 786 9999 639.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};
export default TermsAndConditions;
