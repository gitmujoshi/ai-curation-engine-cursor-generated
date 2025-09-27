import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  IconButton,
  Badge,
  Alert,
  LinearProgress,
  Divider,
  Tabs,
  Tab,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ChildCare as ChildIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Shield as ShieldIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import ChildProfileCard from './ChildProfileCard';
import SafetyAlerts from './SafetyAlerts';
import WeeklyReport from './WeeklyReport';
import QuickActions from './QuickActions';

const ParentDashboard = ({ user, children = [], analytics = {}, alerts = [] }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

  // Mock data for demonstration (replace with real API calls)
  const mockData = {
    weeklyScreenTime: [
      { day: 'Mon', child1: 120, child2: 90, total: 210 },
      { day: 'Tue', child1: 135, child2: 105, total: 240 },
      { day: 'Wed', child1: 110, child2: 85, total: 195 },
      { day: 'Thu', child1: 145, child2: 115, total: 260 },
      { day: 'Fri', child1: 160, child2: 140, total: 300 },
      { day: 'Sat', child1: 200, child2: 180, total: 380 },
      { day: 'Sun', child1: 190, child2: 170, total: 360 }
    ],
    contentCategories: [
      { name: 'Educational', value: 45, color: '#4CAF50' },
      { name: 'Entertainment', value: 35, color: '#2196F3' },
      { name: 'Games', value: 15, color: '#FF9800' },
      { name: 'Social', value: 5, color: '#9C27B0' }
    ],
    safetyMetrics: {
      totalContentReviewed: 1250,
      flaggedContent: 8,
      blockedContent: 3,
      safetyScore: 96.8
    }
  };

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddChild = () => {
    router.push('/dashboard/children/add');
  };

  const handleChildClick = (child) => {
    setSelectedChild(child);
    router.push(`/dashboard/children/${child._id}`);
  };

  const handleViewAnalytics = () => {
    router.push('/dashboard/analytics');
  };

  const handleManageRules = () => {
    router.push('/dashboard/rules');
  };

  // Calculate summary statistics
  const totalChildren = children.length;
  const activeChildren = children.filter(child => 
    child.activityTracking?.lastActivity && 
    new Date(child.activityTracking.lastActivity) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;
  const totalScreenTimeToday = children.reduce((total, child) => 
    total + (child.todayScreenTime || 0), 0
  );
  const averageScreenTime = totalChildren > 0 ? totalScreenTimeToday / totalChildren : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome back, {user?.firstName}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Keep your family safe with AI-powered content curation
            </Typography>
          </Box>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ChildIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" component="div">
                        {totalChildren}
                      </Typography>
                      <Typography variant="body2">
                        Children Profiles
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShieldIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" component="div">
                        {mockData.safetyMetrics.safetyScore}%
                      </Typography>
                      <Typography variant="body2">
                        Safety Score
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" component="div">
                        {Math.round(averageScreenTime / 60)}h
                      </Typography>
                      <Typography variant="body2">
                        Avg Screen Time
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'error.main', color: 'error.contrastText' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WarningIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" component="div">
                        {alerts.length}
                      </Typography>
                      <Typography variant="body2">
                        Active Alerts
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div variants={itemVariants}>
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab 
                icon={<DashboardIcon />} 
                label="Overview" 
                iconPosition="start"
              />
              <Tab 
                icon={<ChildIcon />} 
                label="Children" 
                iconPosition="start"
              />
              <Tab 
                icon={<AnalyticsIcon />} 
                label="Analytics" 
                iconPosition="start"
              />
              <Tab 
                icon={<SecurityIcon />} 
                label="Safety" 
                iconPosition="start"
              />
            </Tabs>
          </Paper>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overview Tab */}
            {activeTab === 0 && (
              <Grid container spacing={3}>
                {/* Recent Activity */}
                <Grid item xs={12} lg={8}>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Weekly Screen Time Trends
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={mockData.weeklyScreenTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="total" 
                          stackId="1" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          name="Total Minutes"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>

                  {/* Quick Actions */}
                  <QuickActions 
                    onAddChild={handleAddChild}
                    onManageRules={handleManageRules}
                    onViewAnalytics={handleViewAnalytics}
                  />
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} lg={4}>
                  {/* Safety Alerts */}
                  <SafetyAlerts alerts={alerts} />
                  
                  {/* Content Categories */}
                  <Paper sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Content Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={mockData.contentCategories}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          {mockData.contentCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Children Tab */}
            {activeTab === 1 && (
              <Grid container spacing={3}>
                {children.map((child) => (
                  <Grid item xs={12} sm={6} md={4} key={child._id}>
                    <ChildProfileCard 
                      child={child}
                      onClick={() => handleChildClick(child)}
                    />
                  </Grid>
                ))}
                
                {/* Add Child Card */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: '2px dashed',
                      borderColor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                    onClick={handleAddChild}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <AddIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" color="primary">
                        Add New Child
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create a profile for your child
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Analytics Tab */}
            {activeTab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Detailed Analytics
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Comprehensive analytics and reporting features coming soon.
                      This will include detailed content consumption patterns,
                      learning progress tracking, and safety compliance reports.
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={handleViewAnalytics}
                      startIcon={<TrendingUpIcon />}
                    >
                      View Full Analytics
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Safety Tab */}
            {activeTab === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Safety Overview
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom>
                        Overall Safety Score
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={mockData.safetyMetrics.safetyScore} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {mockData.safetyMetrics.safetyScore}% - Excellent
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" color="primary">
                            {mockData.safetyMetrics.totalContentReviewed}
                          </Typography>
                          <Typography variant="body2">
                            Content Reviewed
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" color="warning.main">
                            {mockData.safetyMetrics.flaggedContent}
                          </Typography>
                          <Typography variant="body2">
                            Flagged Items
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" color="error.main">
                            {mockData.safetyMetrics.blockedContent}
                          </Typography>
                          <Typography variant="body2">
                            Blocked Content
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" color="success.main">
                            99.7%
                          </Typography>
                          <Typography variant="body2">
                            Success Rate
                          </Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <SafetyAlerts alerts={alerts} />
                </Grid>
              </Grid>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Floating Action Button */}
        <Tooltip title="Quick Actions">
          <Fab 
            color="primary" 
            aria-label="add"
            sx={{ 
              position: 'fixed', 
              bottom: 16, 
              right: 16 
            }}
            onClick={handleAddChild}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>
    </motion.div>
  );
};

export default ParentDashboard;
