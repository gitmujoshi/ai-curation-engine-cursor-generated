import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Paper,
  TextField,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  ChildCare as ChildIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Shield as ShieldIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/router';
import AgeVerificationDialog from './AgeVerificationDialog';
import ChildProfileSetup from './ChildProfileSetup';
import SafetyPreferences from './SafetyPreferences';

const OnboardingFlow = ({ user, onComplete }) => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    profile: {},
    children: [],
    preferences: {},
    consent: {}
  });

  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      country: user?.profile?.country || 'US',
      phoneNumber: user?.profile?.phoneNumber || '',
      numberOfChildren: 1,
      primaryPurpose: '',
      safetyLevel: 'moderate',
      dataProcessingConsent: false,
      marketingConsent: false,
      analyticsConsent: true
    }
  });

  const steps = [
    {
      label: 'Profile Setup',
      icon: <PersonAddIcon />,
      description: 'Complete your profile information'
    },
    {
      label: 'Age Verification',
      icon: <SecurityIcon />,
      description: 'Verify your age with privacy-preserving technology'
    },
    {
      label: 'Child Profiles',
      icon: <ChildIcon />,
      description: 'Set up profiles for your children'
    },
    {
      label: 'Safety Preferences',
      icon: <SettingsIcon />,
      description: 'Configure content filtering and safety settings'
    },
    {
      label: 'Complete Setup',
      icon: <CheckIcon />,
      description: 'Review and finalize your configuration'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAgeVerification = () => {
    setShowAgeVerification(true);
  };

  const handleAgeVerificationComplete = (verificationData) => {
    setAgeVerified(true);
    setShowAgeVerification(false);
    setOnboardingData(prev => ({
      ...prev,
      ageVerification: verificationData
    }));
    handleNext();
  };

  const handleProfileSubmit = (data) => {
    setOnboardingData(prev => ({
      ...prev,
      profile: data
    }));
    handleNext();
  };

  const handleChildrenSetup = (children) => {
    setOnboardingData(prev => ({
      ...prev,
      children
    }));
    handleNext();
  };

  const handlePreferencesSetup = (preferences) => {
    setOnboardingData(prev => ({
      ...prev,
      preferences
    }));
    handleNext();
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      // Submit all onboarding data
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(onboardingData)
      });

      if (response.ok) {
        onComplete();
        router.push('/dashboard');
      } else {
        throw new Error('Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Welcome to AI Curation Engine
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Let's set up your family's safe digital experience
            </Typography>
          </Box>
        </motion.div>

        {/* Progress Stepper */}
        <motion.div variants={itemVariants}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  icon={
                    <Avatar
                      sx={{
                        bgcolor: index <= activeStep ? 'primary.main' : 'grey.300',
                        color: 'white'
                      }}
                    >
                      {step.icon}
                    </Avatar>
                  }
                >
                  <Typography variant="h6">{step.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Step 0: Profile Setup */}
                        {index === 0 && (
                          <Paper sx={{ p: 3 }}>
                            <form onSubmit={handleSubmit(handleProfileSubmit)}>
                              <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                  <Controller
                                    name="firstName"
                                    control={control}
                                    rules={{ required: 'First name is required' }}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        fullWidth
                                        label="First Name"
                                        error={!!errors.firstName}
                                        helperText={errors.firstName?.message}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Controller
                                    name="lastName"
                                    control={control}
                                    rules={{ required: 'Last name is required' }}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        fullWidth
                                        label="Last Name"
                                        error={!!errors.lastName}
                                        helperText={errors.lastName?.message}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Controller
                                    name="country"
                                    control={control}
                                    render={({ field }) => (
                                      <FormControl fullWidth>
                                        <InputLabel>Country</InputLabel>
                                        <Select {...field} label="Country">
                                          <MenuItem value="US">United States</MenuItem>
                                          <MenuItem value="EU">European Union</MenuItem>
                                          <MenuItem value="IN">India</MenuItem>
                                          <MenuItem value="CN">China</MenuItem>
                                          <MenuItem value="CA">Canada</MenuItem>
                                          <MenuItem value="AU">Australia</MenuItem>
                                          <MenuItem value="UK">United Kingdom</MenuItem>
                                          <MenuItem value="other">Other</MenuItem>
                                        </Select>
                                      </FormControl>
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Controller
                                    name="phoneNumber"
                                    control={control}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        fullWidth
                                        label="Phone Number"
                                        type="tel"
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <Controller
                                    name="primaryPurpose"
                                    control={control}
                                    rules={{ required: 'Please select your primary purpose' }}
                                    render={({ field }) => (
                                      <FormControl component="fieldset" error={!!errors.primaryPurpose}>
                                        <FormLabel component="legend">
                                          What's your primary purpose for using this service?
                                        </FormLabel>
                                        <RadioGroup {...field} row>
                                          <FormControlLabel 
                                            value="child_safety" 
                                            control={<Radio />} 
                                            label="Child Safety" 
                                          />
                                          <FormControlLabel 
                                            value="educational_content" 
                                            control={<Radio />} 
                                            label="Educational Content" 
                                          />
                                          <FormControlLabel 
                                            value="family_time" 
                                            control={<Radio />} 
                                            label="Family Screen Time" 
                                          />
                                          <FormControlLabel 
                                            value="content_filtering" 
                                            control={<Radio />} 
                                            label="Content Filtering" 
                                          />
                                        </RadioGroup>
                                      </FormControl>
                                    )}
                                  />
                                </Grid>
                              </Grid>
                              
                              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button type="submit" variant="contained" size="large">
                                  Continue
                                </Button>
                              </Box>
                            </form>
                          </Paper>
                        )}

                        {/* Step 1: Age Verification */}
                        {index === 1 && (
                          <Paper sx={{ p: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <ShieldIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                              <Typography variant="h5" gutterBottom>
                                Age Verification Required
                              </Typography>
                              <Typography variant="body1" color="text.secondary" paragraph>
                                To ensure compliance with global privacy laws and provide 
                                age-appropriate content filtering, we need to verify your age 
                                using privacy-preserving technology.
                              </Typography>
                              
                              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Privacy Protected ✅
                                </Typography>
                                <Typography variant="body2">
                                  We use Zero-Knowledge Proof technology that verifies your age 
                                  without storing or exposing your personal information.
                                </Typography>
                              </Alert>

                              {!ageVerified ? (
                                <Box>
                                  <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<VerifiedIcon />}
                                    onClick={handleAgeVerification}
                                  >
                                    Start Age Verification
                                  </Button>
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                    This process takes about 2-3 minutes
                                  </Typography>
                                </Box>
                              ) : (
                                <Box>
                                  <Chip
                                    icon={<CheckIcon />}
                                    label="Age Verified Successfully"
                                    color="success"
                                    size="large"
                                    sx={{ mb: 2 }}
                                  />
                                  <Typography variant="body2" color="success.main">
                                    Your age has been verified. You can now proceed.
                                  </Typography>
                                </Box>
                              )}
                            </Box>

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                              <Button onClick={handleBack}>
                                Back
                              </Button>
                              {ageVerified && (
                                <Button variant="contained" onClick={handleNext}>
                                  Continue
                                </Button>
                              )}
                            </Box>
                          </Paper>
                        )}

                        {/* Step 2: Child Profiles */}
                        {index === 2 && (
                          <ChildProfileSetup
                            onComplete={handleChildrenSetup}
                            onBack={handleBack}
                          />
                        )}

                        {/* Step 3: Safety Preferences */}
                        {index === 3 && (
                          <SafetyPreferences
                            children={onboardingData.children}
                            onComplete={handlePreferencesSetup}
                            onBack={handleBack}
                          />
                        )}

                        {/* Step 4: Complete Setup */}
                        {index === 4 && (
                          <Paper sx={{ p: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                              <Typography variant="h5" gutterBottom>
                                Setup Complete!
                              </Typography>
                              <Typography variant="body1" color="text.secondary" paragraph>
                                Your AI Curation Engine is now configured and ready to provide 
                                safe, age-appropriate content for your family.
                              </Typography>

                              {/* Summary */}
                              <Grid container spacing={2} sx={{ mt: 3, mb: 3 }}>
                                <Grid item xs={12} sm={6}>
                                  <Card variant="outlined">
                                    <CardContent>
                                      <ChildIcon color="primary" sx={{ mb: 1 }} />
                                      <Typography variant="h6">
                                        {onboardingData.children?.length || 0}
                                      </Typography>
                                      <Typography variant="body2">
                                        Child Profiles Created
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Card variant="outlined">
                                    <CardContent>
                                      <ShieldIcon color="success" sx={{ mb: 1 }} />
                                      <Typography variant="h6">
                                        Active
                                      </Typography>
                                      <Typography variant="body2">
                                        Safety Protection
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              </Grid>

                              <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  What happens next?
                                </Typography>
                                <Typography variant="body2">
                                  • Your dashboard will show real-time safety metrics<br/>
                                  • Content will be automatically filtered based on your settings<br/>
                                  • You'll receive weekly safety reports<br/>
                                  • You can adjust settings anytime from your dashboard
                                </Typography>
                              </Alert>

                              <Button
                                variant="contained"
                                size="large"
                                startIcon={<HomeIcon />}
                                onClick={handleCompleteOnboarding}
                                disabled={loading}
                                sx={{ minWidth: 200 }}
                              >
                                {loading ? (
                                  <CircularProgress size={24} color="inherit" />
                                ) : (
                                  'Go to Dashboard'
                                )}
                              </Button>
                            </Box>

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
                              <Button onClick={handleBack} disabled={loading}>
                                Back
                              </Button>
                            </Box>
                          </Paper>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </motion.div>

        {/* Age Verification Dialog */}
        <AgeVerificationDialog
          open={showAgeVerification}
          onClose={() => setShowAgeVerification(false)}
          onComplete={handleAgeVerificationComplete}
        />
      </Box>
    </motion.div>
  );
};

export default OnboardingFlow;
