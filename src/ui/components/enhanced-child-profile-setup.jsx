import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  Slider,
  Switch,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Avatar,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Entertainment as EntertainmentIcon,
  Sports as SportsIcon,
  Gamepad as GamepadIcon,
  Movie as MovieIcon,
  Music as MusicIcon,
  Book as BookIcon,
  Science as ScienceIcon,
  Art as ArtIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  PhotoCamera as PhotoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const EnhancedChildProfileSetup = ({ 
  existingProfile = null, 
  onSave, 
  onCancel 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [profile, setProfile] = useState({
    // Basic Information
    name: existingProfile?.name || '',
    nickname: existingProfile?.nickname || '',
    age: existingProfile?.age || 8,
    dateOfBirth: existingProfile?.dateOfBirth || '',
    avatar: existingProfile?.avatar || null,
    
    // Safety Settings
    safetyLevel: existingProfile?.safetyLevel || 'strict',
    contentRating: existingProfile?.contentRating || 'everyone',
    parentalSupervision: existingProfile?.parentalSupervision || true,
    
    // Content Preferences
    allowedCategories: existingProfile?.allowedCategories || [
      'educational', 'entertainment', 'games'
    ],
    blockedCategories: existingProfile?.blockedCategories || [
      'violence', 'scary', 'mature'
    ],
    preferredSubjects: existingProfile?.preferredSubjects || [],
    
    // Time Restrictions
    dailyTimeLimit: existingProfile?.dailyTimeLimit || 120, // minutes
    sessionTimeLimit: existingProfile?.sessionTimeLimit || 30,
    allowedTimeSlots: existingProfile?.allowedTimeSlots || {
      weekdays: { start: '16:00', end: '19:00' },
      weekends: { start: '09:00', end: '20:00' }
    },
    bedtimeRestriction: existingProfile?.bedtimeRestriction || '20:00',
    
    // Advanced Settings
    requireApprovalFor: existingProfile?.requireApprovalFor || [
      'social_media', 'new_apps', 'purchases'
    ],
    notifyParentOn: existingProfile?.notifyParentOn || [
      'blocked_content', 'time_limit_reached', 'inappropriate_search'
    ],
    emergencyBypass: existingProfile?.emergencyBypass || false,
    
    // Educational Settings
    learningGoals: existingProfile?.learningGoals || [],
    skillLevel: existingProfile?.skillLevel || 'beginner',
    languagePreference: existingProfile?.languagePreference || 'english'
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});

  const steps = [
    {
      label: 'Basic Information',
      description: 'Set up your child\'s profile',
      icon: <PersonIcon />
    },
    {
      label: 'Safety Settings',
      description: 'Configure content safety levels',
      icon: <SecurityIcon />
    },
    {
      label: 'Content Preferences',
      description: 'Choose allowed content types',
      icon: <SchoolIcon />
    },
    {
      label: 'Time Management',
      description: 'Set screen time limits',
      icon: <ScheduleIcon />
    },
    {
      label: 'Advanced Controls',
      description: 'Fine-tune protection settings',
      icon: <SettingsIcon />
    },
    {
      label: 'Review & Save',
      description: 'Review and save profile',
      icon: <CheckIcon />
    }
  ];

  const contentCategories = [
    { id: 'educational', name: 'Educational', icon: <SchoolIcon />, color: 'success' },
    { id: 'entertainment', name: 'Entertainment', icon: <EntertainmentIcon />, color: 'primary' },
    { id: 'games', name: 'Games', icon: <GamepadIcon />, color: 'info' },
    { id: 'movies', name: 'Movies', icon: <MovieIcon />, color: 'secondary' },
    { id: 'music', name: 'Music', icon: <MusicIcon />, color: 'success' },
    { id: 'books', name: 'Books', icon: <BookIcon />, color: 'primary' },
    { id: 'sports', name: 'Sports', icon: <SportsIcon />, color: 'warning' },
    { id: 'science', name: 'Science', icon: <ScienceIcon />, color: 'info' },
    { id: 'art', name: 'Arts & Crafts', icon: <ArtIcon />, color: 'secondary' },
    { id: 'social', name: 'Social Media', icon: <PersonIcon />, color: 'warning' },
    { id: 'violence', name: 'Violence', icon: <WarningIcon />, color: 'error' },
    { id: 'scary', name: 'Scary Content', icon: <WarningIcon />, color: 'error' },
    { id: 'mature', name: 'Mature Themes', icon: <BlockIcon />, color: 'error' }
  ];

  const safetyLevels = [
    {
      id: 'strict',
      name: 'Maximum Protection',
      description: 'Highest level of content filtering and time restrictions',
      ageRange: '3-8 years',
      features: ['Whitelist-only content', 'No social media', 'Educational priority', 'Maximum supervision'],
      color: 'error'
    },
    {
      id: 'moderate',
      name: 'Balanced Protection',
      description: 'Good balance between safety and freedom',
      ageRange: '9-12 years',
      features: ['Curated content', 'Limited social features', 'Time management', 'Regular supervision'],
      color: 'warning'
    },
    {
      id: 'lenient',
      name: 'Guided Freedom',
      description: 'More freedom with safety guidelines',
      ageRange: '13-15 years',
      features: ['Broader content access', 'Social media allowed', 'Self-regulation', 'Light supervision'],
      color: 'info'
    },
    {
      id: 'minimal',
      name: 'Trust-Based',
      description: 'Minimal restrictions with monitoring',
      ageRange: '16+ years',
      features: ['Open access', 'Self-management', 'Privacy respect', 'Emergency monitoring'],
      color: 'success'
    }
  ];

  const subjects = [
    'Mathematics', 'Science', 'Literature', 'History', 'Geography',
    'Art', 'Music', 'Physical Education', 'Technology', 'Languages',
    'Social Studies', 'Environmental Science', 'Health Education'
  ];

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSave = () => {
    if (validateAllSteps()) {
      onSave(profile);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Basic Information
        if (!profile.name) newErrors.name = 'Name is required';
        if (!profile.age || profile.age < 1 || profile.age > 18) {
          newErrors.age = 'Age must be between 1 and 18';
        }
        break;
      case 1: // Safety Settings
        if (!profile.safetyLevel) newErrors.safetyLevel = 'Safety level is required';
        break;
      case 3: // Time Management
        if (profile.dailyTimeLimit < 15) {
          newErrors.dailyTimeLimit = 'Daily limit should be at least 15 minutes';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllSteps = () => {
    return steps.every((_, index) => validateStep(index));
  };

  const updateProfile = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleCategory = (categoryId, type) => {
    const currentList = profile[type] || [];
    const newList = currentList.includes(categoryId)
      ? currentList.filter(id => id !== categoryId)
      : [...currentList, categoryId];
    
    updateProfile(type, newList);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Basic Information
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Child's Name"
                value={profile.name}
                onChange={(e) => updateProfile('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nickname (Optional)"
                value={profile.nickname}
                onChange={(e) => updateProfile('nickname', e.target.value)}
                helperText="How they like to be called"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Age"
                value={profile.age}
                onChange={(e) => updateProfile('age', parseInt(e.target.value))}
                error={!!errors.age}
                helperText={errors.age}
                InputProps={{ inputProps: { min: 1, max: 18 } }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                value={profile.dateOfBirth}
                onChange={(e) => updateProfile('dateOfBirth', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Profile Avatar
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{ width: 80, height: 80 }}
                      src={profile.avatar}
                    >
                      {profile.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Button
                      variant="outlined"
                      startIcon={<PhotoIcon />}
                      component="label"
                    >
                      Upload Photo
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          // Handle file upload
                          console.log('File selected:', e.target.files[0]);
                        }}
                      />
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 1: // Safety Settings
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Choose Safety Level
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select the appropriate safety level based on your child's age and maturity.
              </Typography>
            </Grid>
            
            {safetyLevels.map((level) => (
              <Grid item xs={12} md={6} key={level.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: profile.safetyLevel === level.id ? 2 : 1,
                    borderColor: profile.safetyLevel === level.id 
                      ? `${level.color}.main` 
                      : 'divider',
                    '&:hover': {
                      borderColor: `${level.color}.main`,
                      boxShadow: 2
                    }
                  }}
                  onClick={() => updateProfile('safetyLevel', level.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={level.name}
                        color={level.color}
                        variant={profile.safetyLevel === level.id ? 'filled' : 'outlined'}
                        sx={{ mr: 2 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {level.ageRange}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                      {level.description}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary">
                      Features:
                    </Typography>
                    <List dense>
                      {level.features.map((feature, index) => (
                        <ListItem key={index} sx={{ py: 0, px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 20 }}>
                            <CheckIcon fontSize="small" color={level.color} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={profile.parentalSupervision}
                    onChange={(e) => updateProfile('parentalSupervision', e.target.checked)}
                  />
                }
                label="Require parental supervision for new content"
              />
            </Grid>
          </Grid>
        );

      case 2: // Content Preferences
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Select content categories that your child can access. Green = Allowed, Red = Blocked.
                </Typography>
              </Alert>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="success.main">
                ✓ Allowed Content
              </Typography>
              <Grid container spacing={1}>
                {contentCategories
                  .filter(cat => !['violence', 'scary', 'mature'].includes(cat.id))
                  .map((category) => (
                    <Grid item key={category.id}>
                      <Chip
                        icon={category.icon}
                        label={category.name}
                        onClick={() => toggleCategory(category.id, 'allowedCategories')}
                        color={profile.allowedCategories.includes(category.id) ? 'success' : 'default'}
                        variant={profile.allowedCategories.includes(category.id) ? 'filled' : 'outlined'}
                        sx={{ m: 0.5 }}
                      />
                    </Grid>
                  ))}
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="error.main">
                ✗ Blocked Content
              </Typography>
              <Grid container spacing={1}>
                {contentCategories
                  .filter(cat => ['violence', 'scary', 'mature', 'social'].includes(cat.id))
                  .map((category) => (
                    <Grid item key={category.id}>
                      <Chip
                        icon={category.icon}
                        label={category.name}
                        onClick={() => toggleCategory(category.id, 'blockedCategories')}
                        color={profile.blockedCategories.includes(category.id) ? 'error' : 'default'}
                        variant={profile.blockedCategories.includes(category.id) ? 'filled' : 'outlined'}
                        sx={{ m: 0.5 }}
                      />
                    </Grid>
                  ))}
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Preferred Learning Subjects
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Select Subjects</InputLabel>
                <Select
                  multiple
                  value={profile.preferredSubjects}
                  onChange={(e) => updateProfile('preferredSubjects', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      <Checkbox checked={profile.preferredSubjects.indexOf(subject) > -1} />
                      <ListItemText primary={subject} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 3: // Time Management
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Daily Screen Time Limit
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={profile.dailyTimeLimit}
                      onChange={(e, value) => updateProfile('dailyTimeLimit', value)}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${Math.floor(value / 60)}h ${value % 60}m`}
                      min={15}
                      max={480}
                      step={15}
                      marks={[
                        { value: 30, label: '30m' },
                        { value: 120, label: '2h' },
                        { value: 240, label: '4h' },
                        { value: 360, label: '6h' }
                      ]}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Currently: {Math.floor(profile.dailyTimeLimit / 60)}h {profile.dailyTimeLimit % 60}m per day
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Session Time Limit
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={profile.sessionTimeLimit}
                      onChange={(e, value) => updateProfile('sessionTimeLimit', value)}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value}m`}
                      min={10}
                      max={120}
                      step={5}
                      marks={[
                        { value: 15, label: '15m' },
                        { value: 30, label: '30m' },
                        { value: 60, label: '1h' },
                        { value: 120, label: '2h' }
                      ]}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Currently: {profile.sessionTimeLimit} minutes per session
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Allowed Time Slots
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Weekdays (Monday - Friday)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            type="time"
                            label="Start Time"
                            value={profile.allowedTimeSlots.weekdays.start}
                            onChange={(e) => updateProfile('allowedTimeSlots', {
                              ...profile.allowedTimeSlots,
                              weekdays: {
                                ...profile.allowedTimeSlots.weekdays,
                                start: e.target.value
                              }
                            })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            type="time"
                            label="End Time"
                            value={profile.allowedTimeSlots.weekdays.end}
                            onChange={(e) => updateProfile('allowedTimeSlots', {
                              ...profile.allowedTimeSlots,
                              weekdays: {
                                ...profile.allowedTimeSlots.weekdays,
                                end: e.target.value
                              }
                            })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Weekends (Saturday - Sunday)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            type="time"
                            label="Start Time"
                            value={profile.allowedTimeSlots.weekends.start}
                            onChange={(e) => updateProfile('allowedTimeSlots', {
                              ...profile.allowedTimeSlots,
                              weekends: {
                                ...profile.allowedTimeSlots.weekends,
                                start: e.target.value
                              }
                            })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            type="time"
                            label="End Time"
                            value={profile.allowedTimeSlots.weekends.end}
                            onChange={(e) => updateProfile('allowedTimeSlots', {
                              ...profile.allowedTimeSlots,
                              weekends: {
                                ...profile.allowedTimeSlots.weekends,
                                end: e.target.value
                              }
                            })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                type="time"
                label="Bedtime Restriction"
                value={profile.bedtimeRestriction}
                onChange={(e) => updateProfile('bedtimeRestriction', e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="No screen time after this hour"
                fullWidth
              />
            </Grid>
          </Grid>
        );

      case 4: // Advanced Controls
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Content Approval Settings
              </Typography>
              <FormGroup>
                {[
                  { id: 'social_media', label: 'Social Media Access' },
                  { id: 'new_apps', label: 'Installing New Apps' },
                  { id: 'purchases', label: 'In-App Purchases' },
                  { id: 'friend_requests', label: 'Friend Requests' },
                  { id: 'messaging', label: 'Messaging/Chat' }
                ].map((item) => (
                  <FormControlLabel
                    key={item.id}
                    control={
                      <Checkbox
                        checked={profile.requireApprovalFor.includes(item.id)}
                        onChange={(e) => {
                          const newList = e.target.checked
                            ? [...profile.requireApprovalFor, item.id]
                            : profile.requireApprovalFor.filter(id => id !== item.id);
                          updateProfile('requireApprovalFor', newList);
                        }}
                      />
                    }
                    label={item.label}
                  />
                ))}
              </FormGroup>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              <FormGroup>
                {[
                  { id: 'blocked_content', label: 'When content is blocked' },
                  { id: 'time_limit_reached', label: 'When time limit is reached' },
                  { id: 'inappropriate_search', label: 'Inappropriate search attempts' },
                  { id: 'new_friend_request', label: 'New friend requests' },
                  { id: 'safety_alerts', label: 'Safety alerts and warnings' }
                ].map((item) => (
                  <FormControlLabel
                    key={item.id}
                    control={
                      <Checkbox
                        checked={profile.notifyParentOn.includes(item.id)}
                        onChange={(e) => {
                          const newList = e.target.checked
                            ? [...profile.notifyParentOn, item.id]
                            : profile.notifyParentOn.filter(id => id !== item.id);
                          updateProfile('notifyParentOn', newList);
                        }}
                      />
                    }
                    label={item.label}
                  />
                ))}
              </FormGroup>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={profile.emergencyBypass}
                    onChange={(e) => updateProfile('emergencyBypass', e.target.checked)}
                  />
                }
                label="Allow emergency bypass (child can request temporary access)"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                This allows your child to request temporary access in emergency situations
              </Typography>
            </Grid>
          </Grid>
        );

      case 5: // Review & Save
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Profile setup is complete! Review the settings below and save when ready.
              </Alert>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Name" secondary={profile.name} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Age" secondary={`${profile.age} years old`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Safety Level" 
                        secondary={safetyLevels.find(l => l.id === profile.safetyLevel)?.name}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Time Restrictions
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Daily Limit" 
                        secondary={`${Math.floor(profile.dailyTimeLimit / 60)}h ${profile.dailyTimeLimit % 60}m`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Session Limit" 
                        secondary={`${profile.sessionTimeLimit} minutes`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Bedtime" 
                        secondary={`No access after ${profile.bedtimeRestriction}`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Content Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="success.main" gutterBottom>
                        Allowed Categories
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {profile.allowedCategories.map((catId) => {
                          const cat = contentCategories.find(c => c.id === catId);
                          return cat ? (
                            <Chip 
                              key={catId} 
                              label={cat.name} 
                              size="small" 
                              color="success" 
                              variant="outlined" 
                            />
                          ) : null;
                        })}
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="error.main" gutterBottom>
                        Blocked Categories
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {profile.blockedCategories.map((catId) => {
                          const cat = contentCategories.find(c => c.id === catId);
                          return cat ? (
                            <Chip 
                              key={catId} 
                              label={cat.name} 
                              size="small" 
                              color="error" 
                              variant="outlined" 
                            />
                          ) : null;
                        })}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {existingProfile ? 'Edit Child Profile' : 'Create Child Profile'}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Set up comprehensive safety and content controls for your child
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                index === steps.length - 1 ? (
                  <Typography variant="caption">Last step</Typography>
                ) : null
              }
              icon={step.icon}
            >
              {step.label}
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                {step.description}
              </Typography>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent(index)}
              </motion.div>
              
              <Box sx={{ mb: 2, mt: 3 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? handleSave : handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === steps.length - 1 ? 'Save Profile' : 'Continue'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                  {index === steps.length - 1 && (
                    <Button
                      onClick={() => setShowPreview(true)}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Preview
                    </Button>
                  )}
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Progress Indicator */}
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
        <Card sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="caption" color="text.secondary">
            Setup Progress
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(activeStep / (steps.length - 1)) * 100} 
            sx={{ mt: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            Step {activeStep + 1} of {steps.length}
          </Typography>
        </Card>
      </Box>
    </Box>
  );
};

export default EnhancedChildProfileSetup;
