import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  Avatar,
  Alert
} from '@mui/material';
import {
  Security as SecurityIcon,
  ChildCare as ChildIcon,
  Analytics as AnalyticsIcon,
  School as SchoolIcon,
  Shield as ShieldIcon,
  Verified as VerifiedIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Head from 'next/head';

const LandingPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Verify token and get user info
      fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setUser(data.user);
          if (data.user.status === 'pending_verification') {
            router.push('/onboarding');
          } else {
            router.push('/dashboard');
          }
        }
      })
      .catch(err => {
        // Token invalid, remove it
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });
    }
  }, [router]);

  const features = [
    {
      icon: <ShieldIcon sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Safety',
      description: 'Advanced content filtering using machine learning to keep your children safe online',
      color: 'primary'
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
      title: 'Privacy-First Design',
      description: 'Zero-knowledge proof age verification protects your family\'s privacy',
      color: 'success'
    },
    {
      icon: <ChildIcon sx={{ fontSize: 40 }} />,
      title: 'Child-Specific Profiles',
      description: 'Customized content curation based on each child\'s age and development',
      color: 'warning'
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: 'Real-Time Analytics',
      description: 'Monitor your family\'s digital wellness with comprehensive insights',
      color: 'info'
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      title: 'Educational Focus',
      description: 'Promote learning with AI that prioritizes educational content',
      color: 'secondary'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Global Compliance',
      description: 'Meets GDPR, COPPA, DPDPA and other international privacy standards',
      color: 'error'
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

  const handleGetStarted = () => {
    router.push('/auth/register');
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  return (
    <>
      <Head>
        <title>AI Curation Engine - Keep Your Family Safe Online</title>
        <meta name="description" content="Advanced AI-powered content curation to keep your family safe online with privacy-preserving technology" />
        <meta name="keywords" content="AI, content filtering, child safety, parental controls, privacy" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 12,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Container maxWidth="lg">
            <motion.div variants={itemVariants}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                  >
                    AI-Powered Family Safety
                  </Typography>
                  <Typography variant="h5" paragraph sx={{ opacity: 0.9 }}>
                    Protect your children online with advanced AI content curation 
                    that learns and adapts to keep your family safe.
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ opacity: 0.8 }}>
                    ✅ Privacy-preserving age verification<br/>
                    ✅ Real-time content filtering<br/>
                    ✅ Educational content prioritization<br/>
                    ✅ Global compliance (GDPR, COPPA, DPDPA)
                  </Typography>
                  
                  <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleGetStarted}
                      endIcon={<ArrowIcon />}
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'grey.100'
                        }
                      }}
                    >
                      Get Started Free
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleSignIn}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Sign In
                    </Button>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 400
                    }}
                  >
                    <Paper
                      elevation={10}
                      sx={{
                        p: 4,
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                        Live Safety Dashboard
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Card sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="success.main">
                              98.7%
                            </Typography>
                            <Typography variant="body2">
                              Safety Score
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="primary.main">
                              2.3K
                            </Typography>
                            <Typography variant="body2">
                              Content Filtered
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="warning.main">
                              3
                            </Typography>
                            <Typography variant="body2">
                              Active Children
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="info.main">
                              2.1h
                            </Typography>
                            <Typography variant="body2">
                              Screen Time
                            </Typography>
                          </Card>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </motion.div>
          </Container>
        </Box>

        {/* Important Note about BoundaryML */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <motion.div variants={itemVariants}>
            <Alert severity="info" sx={{ mb: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                🔧 Development Note
              </Typography>
              <Typography variant="body2">
                This is a functional prototype. The BoundaryML integration shown in the architecture 
                documents was conceptual and would need to be replaced with actual API integrations 
                for production use. All other features are fully functional with mock data.
              </Typography>
            </Alert>
          </motion.div>
        </Container>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <motion.div variants={itemVariants}>
            <Typography
              variant="h3"
              component="h2"
              textAlign="center"
              gutterBottom
              sx={{ mb: 6 }}
            >
              Why Choose Our AI Curation Engine?
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div variants={itemVariants}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)'
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 4 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${feature.color}.main`,
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 3
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h5" component="h3" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* How It Works Section */}
        <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
          <Container maxWidth="lg">
            <motion.div variants={itemVariants}>
              <Typography
                variant="h3"
                component="h2"
                textAlign="center"
                gutterBottom
                sx={{ mb: 6 }}
              >
                How It Works
              </Typography>
            </motion.div>

            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <motion.div variants={itemVariants}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Chip
                      label="1"
                      color="primary"
                      sx={{ fontSize: '1.5rem', width: 50, height: 50, mb: 3 }}
                    />
                    <Typography variant="h5" gutterBottom>
                      Quick Setup
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Create your account and set up child profiles with our 
                      guided onboarding process in just 5 minutes.
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <motion.div variants={itemVariants}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Chip
                      label="2"
                      color="primary"
                      sx={{ fontSize: '1.5rem', width: 50, height: 50, mb: 3 }}
                    />
                    <Typography variant="h5" gutterBottom>
                      AI Protection
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Our AI continuously analyzes and filters content in real-time, 
                      learning from your preferences to improve protection.
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <motion.div variants={itemVariants}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Chip
                      label="3"
                      color="primary"
                      sx={{ fontSize: '1.5rem', width: 50, height: 50, mb: 3 }}
                    />
                    <Typography variant="h5" gutterBottom>
                      Peace of Mind
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Monitor your family's digital wellness with comprehensive 
                      analytics and safety reports delivered to your dashboard.
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* CTA Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <motion.div variants={itemVariants}>
            <Paper
              elevation={4}
              sx={{
                p: 6,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <Typography variant="h3" gutterBottom>
                Ready to Protect Your Family?
              </Typography>
              <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
                Join thousands of parents who trust our AI to keep their children safe online.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleGetStarted}
                endIcon={<ArrowIcon />}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'grey.100'
                  }
                }}
              >
                Start Free Trial
              </Button>
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
                No credit card required • 14-day free trial • Cancel anytime
              </Typography>
            </Paper>
          </motion.div>
        </Container>
      </motion.div>
    </>
  );
};

export default LandingPage;
