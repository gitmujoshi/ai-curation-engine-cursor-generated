import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Alert,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Avatar,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  Language as LanguageIcon,
  School as SchoolIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import RuleBuilder from './RuleBuilder';
import RuleTemplate from './RuleTemplate';
import RulePreview from './RulePreview';

const RulesManagement = ({ children = [], onRuleChange }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [rules, setRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [showRulePreview, setShowRulePreview] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock rules data
  const [mockRules] = useState([
    {
      id: '1',
      name: 'Strict Child Safety',
      description: 'Maximum protection for children under 10',
      type: 'content_filter',
      enabled: true,
      appliedTo: ['child1', 'child2'],
      conditions: {
        ageRange: [0, 10],
        contentRating: 'G',
        categories: ['educational', 'entertainment'],
        blockedCategories: ['violence', 'scary', 'mature'],
        timeRestrictions: {
          weekdays: { start: '16:00', end: '19:00' },
          weekends: { start: '09:00', end: '20:00' }
        }
      },
      actions: {
        block: true,
        requireApproval: true,
        notify: true,
        timeLimit: 60
      },
      performance: {
        accuracy: 96.8,
        blockedContent: 127,
        approvedContent: 2341,
        falsePositives: 8
      },
      lastModified: '2024-01-15T10:30:00Z',
      createdBy: 'parent'
    },
    {
      id: '2',
      name: 'Educational Content Priority',
      description: 'Prioritizes educational content over entertainment',
      type: 'content_priority',
      enabled: true,
      appliedTo: ['child1'],
      conditions: {
        contentType: 'all',
        educationalValue: 0.7,
        subjects: ['mathematics', 'science', 'literature'],
        timeSlots: ['homework_time', 'study_period']
      },
      actions: {
        boost: true,
        boostFactor: 2.5,
        demoteEntertainment: true,
        requireMinEducationalValue: 0.5
      },
      performance: {
        accuracy: 94.2,
        educationalContentShown: 89.3,
        learningTimeIncrease: '+23%',
        userSatisfaction: 4.6
      },
      lastModified: '2024-01-12T14:20:00Z',
      createdBy: 'parent'
    },
    {
      id: '3',
      name: 'Screen Time Manager',
      description: 'Manages daily screen time limits with breaks',
      type: 'time_restriction',
      enabled: true,
      appliedTo: ['child1', 'child2'],
      conditions: {
        dailyLimit: 120, // minutes
        sessionLimit: 30,
        breakInterval: 20,
        breakDuration: 10,
        bedtimeRestriction: '20:00',
        weekdayRestriction: true
      },
      actions: {
        enforceBreaks: true,
        showTimeRemaining: true,
        gradualWarnings: true,
        lockDevice: true
      },
      performance: {
        adherenceRate: 92.1,
        averageSessionTime: 28.5,
        breakCompliance: 87.3,
        parentSatisfaction: 4.8
      },
      lastModified: '2024-01-10T16:45:00Z',
      createdBy: 'parent'
    }
  ]);

  const ruleTypes = [
    {
      id: 'content_filter',
      name: 'Content Filter',
      description: 'Block or allow specific types of content',
      icon: <ShieldIcon />,
      color: 'primary'
    },
    {
      id: 'time_restriction',
      name: 'Time Restrictions',
      description: 'Manage screen time and usage schedules',
      icon: <ScheduleIcon />,
      color: 'warning'
    },
    {
      id: 'content_priority',
      name: 'Content Priority',
      description: 'Boost or demote certain content types',
      icon: <SchoolIcon />,
      color: 'success'
    },
    {
      id: 'social_restriction',
      name: 'Social Controls',
      description: 'Manage social interactions and communications',
      icon: <SecurityIcon />,
      color: 'error'
    }
  ];

  useEffect(() => {
    setRules(mockRules);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateRule = () => {
    setSelectedRule(null);
    setShowRuleBuilder(true);
  };

  const handleEditRule = (rule) => {
    setSelectedRule(rule);
    setShowRuleBuilder(true);
  };

  const handleDeleteRule = async (ruleId) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
    // In real app, make API call to delete rule
  };

  const handleToggleRule = async (ruleId) => {
    setRules(rules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, enabled: !rule.enabled }
        : rule
    ));
    // In real app, make API call to toggle rule
  };

  const handleSaveRule = (ruleData) => {
    if (selectedRule) {
      // Update existing rule
      setRules(rules.map(rule => 
        rule.id === selectedRule.id 
          ? { ...rule, ...ruleData, lastModified: new Date().toISOString() }
          : rule
      ));
    } else {
      // Create new rule
      const newRule = {
        ...ruleData,
        id: Date.now().toString(),
        createdBy: 'parent',
        lastModified: new Date().toISOString(),
        performance: {
          accuracy: 0,
          blockedContent: 0,
          approvedContent: 0,
          falsePositives: 0
        }
      };
      setRules([...rules, newRule]);
    }
    setShowRuleBuilder(false);
    setSelectedRule(null);
  };

  const handlePreviewRule = (rule) => {
    setSelectedRule(rule);
    setShowRulePreview(true);
  };

  const handleDuplicateRule = (rule) => {
    const duplicatedRule = {
      ...rule,
      id: Date.now().toString(),
      name: `${rule.name} (Copy)`,
      lastModified: new Date().toISOString()
    };
    setRules([...rules, duplicatedRule]);
  };

  const getRuleTypeInfo = (type) => {
    return ruleTypes.find(t => t.id === type) || ruleTypes[0];
  };

  const getPerformanceColor = (accuracy) => {
    if (accuracy >= 95) return 'success';
    if (accuracy >= 90) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Content Curation Rules
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage AI-powered rules to keep your family safe online
        </Typography>
      </Box>

      {/* Action Bar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Active Rules" />
          <Tab label="Rule Templates" />
          <Tab label="Performance" />
        </Tabs>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateRule}
          size="large"
        >
          Create Rule
        </Button>
      </Box>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Active Rules Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {rules.map((rule) => (
                <Grid item xs={12} md={6} lg={4} key={rule.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card 
                      sx={{ 
                        height: '100%', 
                        border: rule.enabled ? '2px solid' : '1px solid',
                        borderColor: rule.enabled ? 'success.main' : 'divider',
                        position: 'relative'
                      }}
                    >
                      {/* Rule Status Badge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1
                        }}
                      >
                        <Badge
                          badgeContent={rule.enabled ? 'Active' : 'Disabled'}
                          color={rule.enabled ? 'success' : 'error'}
                          variant="standard"
                        />
                      </Box>

                      <CardContent>
                        {/* Rule Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: `${getRuleTypeInfo(rule.type).color}.main`,
                              mr: 2 
                            }}
                          >
                            {getRuleTypeInfo(rule.type).icon}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" noWrap>
                              {rule.name}
                            </Typography>
                            <Chip 
                              label={getRuleTypeInfo(rule.type).name}
                              size="small"
                              color={getRuleTypeInfo(rule.type).color}
                              variant="outlined"
                            />
                          </Box>
                        </Box>

                        {/* Rule Description */}
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ mb: 2, minHeight: 40 }}
                        >
                          {rule.description}
                        </Typography>

                        {/* Applied To */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Applied to:
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            {rule.appliedTo.map((childId) => {
                              const child = children.find(c => c.id === childId);
                              return (
                                <Chip
                                  key={childId}
                                  label={child?.name || childId}
                                  size="small"
                                  sx={{ mr: 1, mb: 1 }}
                                />
                              );
                            })}
                          </Box>
                        </Box>

                        {/* Performance Metrics */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Performance:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Typography 
                              variant="body2" 
                              color={`${getPerformanceColor(rule.performance.accuracy)}.main`}
                              sx={{ fontWeight: 'bold' }}
                            >
                              {rule.performance.accuracy}% Accuracy
                            </Typography>
                            <Box sx={{ flexGrow: 1, mx: 2 }}>
                              <Box
                                sx={{
                                  height: 4,
                                  borderRadius: 2,
                                  bgcolor: 'grey.200',
                                  position: 'relative'
                                }}
                              >
                                <Box
                                  sx={{
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: `${getPerformanceColor(rule.performance.accuracy)}.main`,
                                    width: `${rule.performance.accuracy}%`
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </Box>

                        {/* Last Modified */}
                        <Typography variant="caption" color="text.secondary">
                          Modified: {new Date(rule.lastModified).toLocaleDateString()}
                        </Typography>
                      </CardContent>

                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handlePreviewRule(rule)}
                        >
                          Preview
                        </Button>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditRule(rule)}
                        >
                          Edit
                        </Button>
                        
                        <Box sx={{ flexGrow: 1 }} />
                        
                        <Tooltip title={rule.enabled ? 'Disable Rule' : 'Enable Rule'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleRule(rule.id)}
                            color={rule.enabled ? 'success' : 'default'}
                          >
                            {rule.enabled ? <PauseIcon /> : <PlayIcon />}
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Duplicate Rule">
                          <IconButton
                            size="small"
                            onClick={() => handleDuplicateRule(rule)}
                          >
                            <CopyIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Rule">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRule(rule.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}

              {/* Empty State */}
              {rules.length === 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <SettingsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No Rules Created Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Create your first content curation rule to start protecting your family online.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleCreateRule}
                    >
                      Create Your First Rule
                    </Button>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}

          {/* Rule Templates Tab */}
          {activeTab === 1 && (
            <RuleTemplate 
              onSelectTemplate={(template) => {
                setSelectedRule(template);
                setShowRuleBuilder(true);
              }}
            />
          )}

          {/* Performance Tab */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info">
                  Performance analytics show how well your rules are working.
                  This data helps you optimize your family's digital safety.
                </Alert>
              </Grid>
              
              {rules.map((rule) => (
                <Grid item xs={12} md={6} key={rule.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {rule.name}
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Accuracy
                          </Typography>
                          <Typography variant="h5" color={`${getPerformanceColor(rule.performance.accuracy)}.main`}>
                            {rule.performance.accuracy}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Content Blocked
                          </Typography>
                          <Typography variant="h5">
                            {rule.performance.blockedContent}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Content Approved
                          </Typography>
                          <Typography variant="h5">
                            {rule.performance.approvedContent}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            False Positives
                          </Typography>
                          <Typography variant="h5" color="warning.main">
                            {rule.performance.falsePositives}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Rule Builder Dialog */}
      <RuleBuilder
        open={showRuleBuilder}
        rule={selectedRule}
        children={children}
        onClose={() => {
          setShowRuleBuilder(false);
          setSelectedRule(null);
        }}
        onSave={handleSaveRule}
      />

      {/* Rule Preview Dialog */}
      <RulePreview
        open={showRulePreview}
        rule={selectedRule}
        onClose={() => {
          setShowRulePreview(false);
          setSelectedRule(null);
        }}
      />
    </Box>
  );
};

export default RulesManagement;
