/**
 * BLAZE INTELLIGENCE - SOCIAL COMMUNITY PLATFORM
 * Advanced social networking system for athletes, coaches, and sports professionals
 * Features: Team collaboration, performance sharing, mentorship matching, skill development
 * Supports: Cardinals, Titans, Longhorns, Grizzlies community building
 */

import { BlazeSportsPipeline } from './blaze-sports-pipeline-enhanced.js';
import { BlazeVisionAI } from './blaze-vision-ai-enhanced.js';

export class BlazeSocialCommunity {
  constructor(config = {}) {
    this.config = {
      maxCommunitySize: 10000,
      maxGroupSize: 100,
      contentModeration: true,
      enableVideoSharing: true,
      enableLiveStreaming: true,
      enableMentorship: true,
      enableCompetitions: true,
      allowAnonymous: false,
      ageVerification: true,
      sport: 'multi', // 'baseball', 'football', 'basketball', 'multi'
      ...config
    };

    // Core systems
    this.sportsData = new BlazeSportsPipeline();
    this.visionAI = new BlazeVisionAI();

    // User management
    this.users = new Map();
    this.athletes = new Map();
    this.coaches = new Map();
    this.teams = new Map();
    this.organizations = new Map();

    // Social features
    this.posts = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.follows = new Map();
    this.groups = new Map();
    this.events = new Map();
    this.challenges = new Map();

    // Content systems
    this.videoLibrary = new Map();
    this.trainingPlans = new Map();
    this.achievements = new Map();
    this.leaderboards = new Map();

    // Mentorship and development
    this.mentorships = new Map();
    this.skillAssessments = new Map();
    this.learningPaths = new Map();
    this.certifications = new Map();

    // Community management
    this.moderationQueue = [];
    this.reportedContent = new Map();
    this.suspendedUsers = new Set();
    this.communityGuidelines = this.initializeCommunityGuidelines();

    // Analytics and insights
    this.engagementMetrics = new Map();
    this.performanceInsights = new Map();
    this.communityHealth = {
      activeUsers: 0,
      contentQuality: 0,
      engagementRate: 0,
      reportRate: 0
    };

    // Real-time features
    this.liveStreams = new Map();
    this.chatRooms = new Map();
    this.notifications = new Map();
    this.onlineUsers = new Set();

    this.init();
  }

  async init() {
    try {
      console.log('🌐 Initializing Blaze Social Community Platform...');
      
      // Initialize data sources
      await this.sportsData.init();
      await this.visionAI.init();

      // Setup community structures
      this.initializeDefaultCommunities();
      
      // Start real-time systems
      this.startRealTimeServices();
      
      // Initialize content moderation
      this.setupContentModeration();

      console.log('🌐 Social Community Platform initialized successfully');
      console.log(`👥 Ready for ${this.config.maxCommunitySize} community members`);
      
    } catch (error) {
      console.error('Social community initialization failed:', error);
      throw error;
    }
  }

  initializeCommunityGuidelines() {
    return {
      respectfulCommunication: {
        title: 'Respectful Communication',
        description: 'Treat all community members with respect and kindness',
        violations: ['harassment', 'hate_speech', 'discrimination', 'bullying'],
        consequences: ['warning', 'temporary_suspension', 'permanent_ban']
      },
      authenticity: {
        title: 'Authentic Content',
        description: 'Share genuine experiences and accurate information',
        violations: ['fake_stats', 'impersonation', 'misleading_content'],
        consequences: ['content_removal', 'warning', 'account_suspension']
      },
      privacy: {
        title: 'Privacy Protection',
        description: 'Respect privacy of all community members',
        violations: ['personal_info_sharing', 'unauthorized_photos', 'doxxing'],
        consequences: ['immediate_removal', 'account_suspension']
      },
      sportsmanship: {
        title: 'Good Sportsmanship',
        description: 'Demonstrate positive sporting values and fair play',
        violations: ['unsportsmanlike_conduct', 'trash_talking', 'poor_attitude'],
        consequences: ['warning', 'mentorship_assignment', 'temporary_restriction']
      }
    };
  }

  initializeDefaultCommunities() {
    // Create sport-specific communities
    const sportCommunities = [
      {
        id: 'cardinals_baseball',
        name: 'Cardinals Baseball Community',
        sport: 'baseball',
        team: 'Cardinals',
        description: 'Connect with Cardinals fans and baseball enthusiasts',
        type: 'team_focused'
      },
      {
        id: 'titans_football', 
        name: 'Titans Football Community',
        sport: 'football',
        team: 'Titans',
        description: 'Tennessee Titans football community and NFL discussion',
        type: 'team_focused'
      },
      {
        id: 'longhorns_college',
        name: 'Longhorns College Sports',
        sport: 'multi',
        team: 'Longhorns',
        description: 'Texas Longhorns athletics and college sports',
        type: 'collegiate'
      },
      {
        id: 'grizzlies_basketball',
        name: 'Grizzlies Basketball Community', 
        sport: 'basketball',
        team: 'Grizzlies',
        description: 'Memphis Grizzlies and basketball development',
        type: 'team_focused'
      }
    ];

    for (const community of sportCommunities) {
      this.createCommunity(community);
    }

    // Create general communities
    const generalCommunities = [
      {
        id: 'coaches_corner',
        name: 'Coaches Corner',
        sport: 'multi',
        description: 'Professional development for coaches at all levels',
        type: 'professional'
      },
      {
        id: 'athlete_development',
        name: 'Athlete Development Hub',
        sport: 'multi', 
        description: 'Training tips, nutrition, and performance optimization',
        type: 'educational'
      },
      {
        id: 'youth_sports',
        name: 'Youth Sports Network',
        sport: 'multi',
        description: 'Supporting young athletes and their families',
        type: 'youth_focused'
      },
      {
        id: 'sports_analytics',
        name: 'Sports Analytics Enthusiasts',
        sport: 'multi',
        description: 'Data analysis, statistics, and performance metrics',
        type: 'technical'
      }
    ];

    for (const community of generalCommunities) {
      this.createCommunity(community);
    }
  }

  createCommunity(communityData) {
    const community = {
      id: communityData.id,
      name: communityData.name,
      sport: communityData.sport,
      team: communityData.team || null,
      description: communityData.description,
      type: communityData.type,
      members: new Set(),
      moderators: new Set(),
      posts: [],
      rules: this.generateCommunityRules(communityData.type),
      settings: {
        isPublic: true,
        allowPosts: true,
        allowComments: true,
        requireApproval: false,
        autoModeration: true
      },
      stats: {
        memberCount: 0,
        postCount: 0,
        engagementRate: 0,
        activityLevel: 'low'
      },
      created: Date.now(),
      lastActivity: Date.now()
    };

    this.groups.set(communityData.id, community);
    console.log(`✅ Created community: ${community.name}`);
    
    return community;
  }

  generateCommunityRules(type) {
    const baseRules = [
      'Be respectful to all community members',
      'Stay on topic and relevant to the community purpose',
      'No spam, self-promotion, or repetitive content',
      'Respect privacy and do not share personal information',
      'Report inappropriate content or behavior'
    ];

    const typeSpecificRules = {
      team_focused: [
        'Support your team while respecting opposing fans',
        'Share team news, updates, and analysis',
        'Celebrate achievements and learn from setbacks'
      ],
      professional: [
        'Share professional experiences and insights',
        'Maintain confidentiality regarding sensitive information',
        'Provide constructive feedback and mentorship'
      ],
      educational: [
        'Share evidence-based training and development content',
        'Cite sources for statistics and research claims',
        'Encourage questions and learning opportunities'
      ],
      youth_focused: [
        'All content must be appropriate for young athletes',
        'Parents and guardians should supervise participation',
        'Focus on positive development and character building'
      ],
      technical: [
        'Provide accurate data and analytical insights',
        'Explain methodologies and data sources',
        'Engage in constructive technical discussions'
      ]
    };

    return [...baseRules, ...(typeSpecificRules[type] || [])];
  }

  startRealTimeServices() {
    console.log('🔴 Starting real-time community services...');
    
    // Simulate real-time activity monitoring
    setInterval(() => {
      this.updateCommunityHealth();
      this.processNotifications();
      this.moderateContent();
    }, 30000); // Every 30 seconds

    // Activity heartbeat
    setInterval(() => {
      this.updateOnlineUsers();
      this.updateEngagementMetrics();
    }, 5000); // Every 5 seconds
  }

  setupContentModeration() {
    console.log('🛡️ Setting up content moderation system...');
    
    this.moderationRules = {
      profanity: {
        action: 'filter',
        severity: 'low',
        words: ['inappropriate', 'offensive'] // Placeholder - real system would have comprehensive list
      },
      spam: {
        action: 'flag',
        severity: 'medium',
        patterns: ['repeated_content', 'excessive_links', 'promotional_only']
      },
      harassment: {
        action: 'remove',
        severity: 'high',
        patterns: ['personal_attacks', 'threats', 'discriminatory_language']
      },
      misinformation: {
        action: 'review',
        severity: 'medium',
        patterns: ['false_stats', 'misleading_claims', 'unverified_rumors']
      }
    };
  }

  // User management
  async registerUser(userData) {
    try {
      console.log(`👤 Registering new user: ${userData.username}`);

      // Validate user data
      const validationResult = this.validateUserData(userData);
      if (!validationResult.valid) {
        throw new Error(`Registration failed: ${validationResult.errors.join(', ')}`);
      }

      // Create user profile
      const user = {
        id: this.generateUserId(),
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName || userData.username,
        userType: userData.userType || 'athlete', // 'athlete', 'coach', 'fan', 'parent'
        sport: userData.sport || 'multi',
        team: userData.team || null,
        position: userData.position || null,
        age: userData.age || null,
        location: userData.location || null,
        bio: userData.bio || '',
        avatar: userData.avatar || null,
        verified: false,
        privacy: {
          profileVisibility: 'public',
          statsVisibility: 'public',
          allowMessages: true,
          allowFriendRequests: true
        },
        stats: {
          postsCount: 0,
          followersCount: 0,
          followingCount: 0,
          likesReceived: 0,
          commentsCount: 0
        },
        achievements: [],
        following: new Set(),
        followers: new Set(),
        blockedUsers: new Set(),
        reportedPosts: new Set(),
        createdAt: Date.now(),
        lastActive: Date.now(),
        reputation: 100, // Starting reputation score
        level: 1,
        experience: 0
      };

      // Store user data
      this.users.set(user.id, user);

      // Add to appropriate category
      if (user.userType === 'athlete') {
        this.athletes.set(user.id, this.createAthleteProfile(user));
      } else if (user.userType === 'coach') {
        this.coaches.set(user.id, this.createCoachProfile(user));
      }

      // Auto-join relevant communities
      await this.autoJoinCommunities(user);

      console.log(`✅ User registered successfully: ${user.username} (${user.id})`);
      
      return {
        success: true,
        user: this.sanitizeUserData(user),
        communities: this.getUserCommunities(user.id)
      };

    } catch (error) {
      console.error('User registration failed:', error);
      throw error;
    }
  }

  validateUserData(userData) {
    const errors = [];

    if (!userData.username || userData.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Valid email address required');
    }

    if (userData.age && (userData.age < 13 || userData.age > 100)) {
      errors.push('Age must be between 13 and 100');
    }

    if (userData.userType && !['athlete', 'coach', 'fan', 'parent'].includes(userData.userType)) {
      errors.push('Invalid user type');
    }

    // Check for existing username/email
    const existingUser = Array.from(this.users.values()).find(
      user => user.username === userData.username || user.email === userData.email
    );

    if (existingUser) {
      errors.push('Username or email already exists');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  createAthleteProfile(user) {
    return {
      userId: user.id,
      sport: user.sport,
      position: user.position,
      team: user.team,
      stats: {
        season: {},
        career: {},
        recent: {}
      },
      training: {
        currentProgram: null,
        completedSessions: 0,
        goals: []
      },
      performance: {
        strengths: [],
        weaknesses: [],
        recommendations: []
      },
      health: {
        injuryHistory: [],
        currentStatus: 'healthy',
        riskFactors: []
      },
      social: {
        mentors: new Set(),
        mentees: new Set(),
        teammates: new Set()
      }
    };
  }

  createCoachProfile(user) {
    return {
      userId: user.id,
      sport: user.sport,
      level: 'high_school', // 'youth', 'high_school', 'college', 'professional'
      certifications: [],
      experience: user.experience || 0,
      specialties: [],
      teams: new Set(),
      athletes: new Set(),
      philosophy: user.coachingPhilosophy || '',
      achievements: [],
      ratings: {
        overall: 0,
        communication: 0,
        knowledge: 0,
        leadership: 0,
        development: 0
      },
      availability: {
        mentorship: true,
        consultation: true,
        training: true
      }
    };
  }

  async autoJoinCommunities(user) {
    const relevantCommunities = [];

    // Join sport-specific communities
    for (const [communityId, community] of this.groups) {
      const shouldJoin = this.shouldUserJoinCommunity(user, community);
      
      if (shouldJoin) {
        await this.joinCommunity(user.id, communityId);
        relevantCommunities.push(communityId);
      }
    }

    console.log(`🏟️ Auto-joined ${user.username} to ${relevantCommunities.length} communities`);
    return relevantCommunities;
  }

  shouldUserJoinCommunity(user, community) {
    // General communities that everyone should join
    if (['athlete_development', 'sports_analytics'].includes(community.id)) {
      return true;
    }

    // Youth-focused for younger users
    if (community.id === 'youth_sports' && user.age && user.age < 18) {
      return true;
    }

    // Coach communities for coaches
    if (community.id === 'coaches_corner' && user.userType === 'coach') {
      return true;
    }

    // Sport-specific communities
    if (user.sport === community.sport || community.sport === 'multi') {
      return true;
    }

    // Team-specific communities
    if (user.team && user.team === community.team) {
      return true;
    }

    return false;
  }

  sanitizeUserData(user) {
    // Remove sensitive information before sending to client
    const sanitized = { ...user };
    delete sanitized.email;
    delete sanitized.blockedUsers;
    delete sanitized.reportedPosts;
    
    return sanitized;
  }

  getUserCommunities(userId) {
    const userCommunities = [];
    
    for (const [communityId, community] of this.groups) {
      if (community.members.has(userId)) {
        userCommunities.push({
          id: communityId,
          name: community.name,
          sport: community.sport,
          memberCount: community.members.size,
          type: community.type
        });
      }
    }
    
    return userCommunities;
  }

  // Community management
  async joinCommunity(userId, communityId) {
    const user = this.users.get(userId);
    const community = this.groups.get(communityId);

    if (!user || !community) {
      throw new Error('User or community not found');
    }

    if (community.members.has(userId)) {
      return { success: false, message: 'Already a member' };
    }

    if (community.members.size >= this.config.maxGroupSize) {
      throw new Error('Community is full');
    }

    // Add user to community
    community.members.add(userId);
    community.stats.memberCount = community.members.size;
    community.lastActivity = Date.now();

    // Send welcome notification
    await this.sendNotification(userId, {
      type: 'community_joined',
      title: `Welcome to ${community.name}!`,
      message: `You've successfully joined the ${community.name} community.`,
      communityId: communityId,
      timestamp: Date.now()
    });

    console.log(`👥 ${user.username} joined ${community.name}`);

    return { success: true, community: this.sanitizeCommunityData(community) };
  }

  async leaveCommunity(userId, communityId) {
    const user = this.users.get(userId);
    const community = this.groups.get(communityId);

    if (!user || !community) {
      throw new Error('User or community not found');
    }

    if (!community.members.has(userId)) {
      return { success: false, message: 'Not a member' };
    }

    // Remove user from community
    community.members.delete(userId);
    community.moderators.delete(userId); // Remove moderator status if applicable
    community.stats.memberCount = community.members.size;

    console.log(`👋 ${user.username} left ${community.name}`);

    return { success: true };
  }

  // Content creation and sharing
  async createPost(userId, postData) {
    try {
      const user = this.users.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate post content
      const validation = await this.validatePostContent(postData);
      if (!validation.valid) {
        throw new Error(`Post validation failed: ${validation.errors.join(', ')}`);
      }

      const post = {
        id: this.generatePostId(),
        authorId: userId,
        authorName: user.displayName,
        authorAvatar: user.avatar,
        authorType: user.userType,
        content: {
          text: postData.text || '',
          images: postData.images || [],
          videos: postData.videos || [],
          stats: postData.stats || null,
          location: postData.location || null
        },
        type: postData.type || 'text', // 'text', 'image', 'video', 'stats', 'achievement'
        communityId: postData.communityId || null,
        visibility: postData.visibility || 'public', // 'public', 'followers', 'private'
        tags: postData.tags || [],
        mentions: postData.mentions || [],
        engagement: {
          likes: new Set(),
          comments: [],
          shares: new Set(),
          views: 0
        },
        moderation: {
          status: 'approved', // 'pending', 'approved', 'flagged', 'removed'
          flags: [],
          reviewedBy: null,
          reviewedAt: null
        },
        timestamp: Date.now(),
        editHistory: []
      };

      // Process content with AI if applicable
      if (postData.videos && postData.videos.length > 0) {
        post.analysis = await this.analyzeVideoContent(postData.videos[0]);
      }

      // Store post
      this.posts.set(post.id, post);

      // Add to community feed if applicable
      if (post.communityId) {
        const community = this.groups.get(post.communityId);
        if (community && community.members.has(userId)) {
          community.posts.unshift(post.id);
          community.stats.postCount++;
          community.lastActivity = Date.now();
        }
      }

      // Update user stats
      user.stats.postsCount++;
      user.experience += 10; // Award experience points

      // Trigger content moderation
      await this.moderatePost(post);

      console.log(`📝 New post created by ${user.username}: ${post.id}`);

      return { success: true, post: this.sanitizePostData(post) };

    } catch (error) {
      console.error('Post creation failed:', error);
      throw error;
    }
  }

  async validatePostContent(postData) {
    const errors = [];

    if (!postData.text && (!postData.images || postData.images.length === 0) && 
        (!postData.videos || postData.videos.length === 0)) {
      errors.push('Post must contain text, images, or videos');
    }

    if (postData.text && postData.text.length > 2000) {
      errors.push('Text content too long (max 2000 characters)');
    }

    if (postData.images && postData.images.length > 10) {
      errors.push('Too many images (max 10)');
    }

    if (postData.videos && postData.videos.length > 3) {
      errors.push('Too many videos (max 3)');
    }

    // Check for spam patterns
    if (this.detectSpamPatterns(postData)) {
      errors.push('Content flagged as potential spam');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  detectSpamPatterns(postData) {
    if (!postData.text) return false;

    const spamIndicators = [
      /(.)\1{10,}/, // Repeated characters
      /(https?:\/\/[^\s]+){3,}/, // Multiple links
      /\b(buy now|click here|limited time)\b/i // Promotional language
    ];

    return spamIndicators.some(pattern => pattern.test(postData.text));
  }

  generatePostId() {
    return 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async analyzeVideoContent(videoUrl) {
    try {
      // Use Vision AI to analyze training videos
      const analysis = await this.visionAI.analyzeVideo(videoUrl);
      
      return {
        biomechanics: analysis.biomechanics || {},
        technique: analysis.technique || {},
        performance: analysis.performance || {},
        suggestions: analysis.suggestions || []
      };
    } catch (error) {
      console.error('Video analysis failed:', error);
      return null;
    }
  }

  async moderatePost(post) {
    if (!this.config.contentModeration) return;

    let flagged = false;
    const flags = [];

    // Check for profanity
    if (this.containsProfanity(post.content.text)) {
      flags.push('profanity');
      flagged = true;
    }

    // Check for spam
    if (this.detectSpamPatterns(post.content)) {
      flags.push('spam');
      flagged = true;
    }

    // Check for inappropriate content in images/videos
    if (post.content.images.length > 0 || post.content.videos.length > 0) {
      const inappropriateContent = await this.scanMediaContent(post.content);
      if (inappropriateContent) {
        flags.push('inappropriate_media');
        flagged = true;
      }
    }

    if (flagged) {
      post.moderation.status = 'flagged';
      post.moderation.flags = flags;
      this.moderationQueue.push(post.id);
      
      console.log(`🚩 Post flagged for moderation: ${post.id} (${flags.join(', ')})`);
    }
  }

  containsProfanity(text) {
    if (!text) return false;
    // Simplified profanity check - production would use comprehensive filter
    const profanityWords = ['badword1', 'badword2']; // Placeholder
    return profanityWords.some(word => text.toLowerCase().includes(word));
  }

  async scanMediaContent(content) {
    // Placeholder for media content scanning
    // Production would use image/video analysis APIs
    return false;
  }

  // Social interactions
  async likePost(userId, postId) {
    const user = this.users.get(userId);
    const post = this.posts.get(postId);

    if (!user || !post) {
      throw new Error('User or post not found');
    }

    if (post.engagement.likes.has(userId)) {
      // Unlike
      post.engagement.likes.delete(userId);
      return { success: true, action: 'unliked', likeCount: post.engagement.likes.size };
    } else {
      // Like
      post.engagement.likes.add(userId);
      
      // Award points to post author
      const author = this.users.get(post.authorId);
      if (author) {
        author.stats.likesReceived++;
        author.experience += 5;
      }

      // Send notification to author (if not self-like)
      if (userId !== post.authorId) {
        await this.sendNotification(post.authorId, {
          type: 'post_liked',
          title: 'Your post was liked!',
          message: `${user.displayName} liked your post`,
          postId: postId,
          fromUserId: userId,
          timestamp: Date.now()
        });
      }

      return { success: true, action: 'liked', likeCount: post.engagement.likes.size };
    }
  }

  async commentOnPost(userId, postId, commentText) {
    const user = this.users.get(userId);
    const post = this.posts.get(postId);

    if (!user || !post) {
      throw new Error('User or post not found');
    }

    if (!commentText || commentText.trim().length === 0) {
      throw new Error('Comment cannot be empty');
    }

    const comment = {
      id: this.generateCommentId(),
      authorId: userId,
      authorName: user.displayName,
      authorAvatar: user.avatar,
      text: commentText.trim(),
      timestamp: Date.now(),
      likes: new Set(),
      replies: []
    };

    post.engagement.comments.push(comment);
    this.comments.set(comment.id, comment);

    // Update user stats
    user.stats.commentsCount++;
    user.experience += 3;

    // Send notification to post author
    if (userId !== post.authorId) {
      await this.sendNotification(post.authorId, {
        type: 'post_commented',
        title: 'New comment on your post',
        message: `${user.displayName} commented: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
        postId: postId,
        commentId: comment.id,
        fromUserId: userId,
        timestamp: Date.now()
      });
    }

    return { success: true, comment };
  }

  generateCommentId() {
    return 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async followUser(followerId, targetUserId) {
    const follower = this.users.get(followerId);
    const target = this.users.get(targetUserId);

    if (!follower || !target) {
      throw new Error('User not found');
    }

    if (followerId === targetUserId) {
      throw new Error('Cannot follow yourself');
    }

    if (target.blockedUsers.has(followerId)) {
      throw new Error('You are blocked by this user');
    }

    if (follower.following.has(targetUserId)) {
      return { success: false, message: 'Already following' };
    }

    // Add follow relationship
    follower.following.add(targetUserId);
    target.followers.add(followerId);

    // Update stats
    follower.stats.followingCount++;
    target.stats.followersCount++;

    // Send notification
    await this.sendNotification(targetUserId, {
      type: 'new_follower',
      title: 'New follower!',
      message: `${follower.displayName} is now following you`,
      fromUserId: followerId,
      timestamp: Date.now()
    });

    console.log(`👤 ${follower.username} started following ${target.username}`);

    return { success: true };
  }

  async unfollowUser(followerId, targetUserId) {
    const follower = this.users.get(followerId);
    const target = this.users.get(targetUserId);

    if (!follower || !target) {
      throw new Error('User not found');
    }

    if (!follower.following.has(targetUserId)) {
      return { success: false, message: 'Not following' };
    }

    // Remove follow relationship
    follower.following.delete(targetUserId);
    target.followers.delete(followerId);

    // Update stats
    follower.stats.followingCount--;
    target.stats.followersCount--;

    return { success: true };
  }

  // Feed generation
  async getFeedForUser(userId, options = {}) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const {
      limit = 20,
      offset = 0,
      type = 'all', // 'all', 'following', 'community', 'trending'
      communityId = null
    } = options;

    let feedPosts = [];

    if (type === 'community' && communityId) {
      feedPosts = await this.getCommunityFeed(communityId, limit, offset);
    } else if (type === 'following') {
      feedPosts = await this.getFollowingFeed(userId, limit, offset);
    } else if (type === 'trending') {
      feedPosts = await this.getTrendingFeed(limit, offset);
    } else {
      feedPosts = await this.getPersonalizedFeed(userId, limit, offset);
    }

    // Add engagement data for current user
    const enrichedPosts = feedPosts.map(post => ({
      ...this.sanitizePostData(post),
      userEngagement: {
        liked: post.engagement.likes.has(userId),
        commented: post.engagement.comments.some(comment => comment.authorId === userId)
      }
    }));

    return { posts: enrichedPosts, hasMore: feedPosts.length === limit };
  }

  async getPersonalizedFeed(userId, limit, offset) {
    const user = this.users.get(userId);
    const allPosts = Array.from(this.posts.values());
    
    // Filter and score posts based on relevance
    const scoredPosts = allPosts.map(post => ({
      post,
      score: this.calculatePostRelevanceScore(post, user)
    }));

    // Sort by score and recency
    scoredPosts.sort((a, b) => {
      const scoreWeight = 0.7;
      const timeWeight = 0.3;
      
      const scoreDiff = (b.score - a.score) * scoreWeight;
      const timeDiff = (b.post.timestamp - a.post.timestamp) * timeWeight;
      
      return scoreDiff + timeDiff;
    });

    return scoredPosts
      .slice(offset, offset + limit)
      .map(item => item.post);
  }

  calculatePostRelevanceScore(post, user) {
    let score = 0;

    // Following bonus
    if (user.following.has(post.authorId)) {
      score += 50;
    }

    // Same sport bonus
    if (post.tags.includes(user.sport) || post.content.stats?.sport === user.sport) {
      score += 30;
    }

    // Same team bonus
    if (user.team && post.tags.includes(user.team)) {
      score += 25;
    }

    // Community membership bonus
    if (post.communityId) {
      const community = this.groups.get(post.communityId);
      if (community && community.members.has(user.id)) {
        score += 20;
      }
    }

    // Engagement bonus
    score += post.engagement.likes.size * 2;
    score += post.engagement.comments.length * 3;
    score += post.engagement.shares.size * 5;

    // Recency bonus (posts lose points over time)
    const ageInHours = (Date.now() - post.timestamp) / (1000 * 60 * 60);
    score *= Math.max(0.1, 1 - (ageInHours / 24)); // Decay over 24 hours

    // Content type bonuses
    if (post.type === 'video') score += 15;
    if (post.type === 'stats') score += 10;
    if (post.type === 'achievement') score += 20;

    return score;
  }

  async getCommunityFeed(communityId, limit, offset) {
    const community = this.groups.get(communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    const postIds = community.posts.slice(offset, offset + limit);
    const posts = postIds.map(id => this.posts.get(id)).filter(Boolean);

    return posts;
  }

  async getFollowingFeed(userId, limit, offset) {
    const user = this.users.get(userId);
    const followingPosts = Array.from(this.posts.values())
      .filter(post => user.following.has(post.authorId))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(offset, offset + limit);

    return followingPosts;
  }

  async getTrendingFeed(limit, offset) {
    const recentPosts = Array.from(this.posts.values())
      .filter(post => Date.now() - post.timestamp < 24 * 60 * 60 * 1000) // Last 24 hours
      .sort((a, b) => {
        // Sort by engagement score
        const aScore = a.engagement.likes.size * 2 + a.engagement.comments.length * 3 + a.engagement.shares.size * 5;
        const bScore = b.engagement.likes.size * 2 + b.engagement.comments.length * 3 + b.engagement.shares.size * 5;
        return bScore - aScore;
      })
      .slice(offset, offset + limit);

    return recentPosts;
  }

  // Mentorship system
  async requestMentorship(menteeId, mentorId, message) {
    const mentee = this.users.get(menteeId);
    const mentor = this.users.get(mentorId);

    if (!mentee || !mentor) {
      throw new Error('User not found');
    }

    const mentorProfile = this.coaches.get(mentorId);
    if (!mentorProfile || !mentorProfile.availability.mentorship) {
      throw new Error('Mentor not available for mentorship');
    }

    const mentorshipRequest = {
      id: this.generateMentorshipId(),
      menteeId,
      mentorId,
      message: message || '',
      status: 'pending', // 'pending', 'accepted', 'declined', 'active', 'completed'
      createdAt: Date.now(),
      acceptedAt: null,
      completedAt: null,
      goals: [],
      sessions: [],
      progress: {}
    };

    this.mentorships.set(mentorshipRequest.id, mentorshipRequest);

    // Send notification to mentor
    await this.sendNotification(mentorId, {
      type: 'mentorship_request',
      title: 'New mentorship request',
      message: `${mentee.displayName} would like you to be their mentor`,
      fromUserId: menteeId,
      mentorshipId: mentorshipRequest.id,
      timestamp: Date.now()
    });

    console.log(`🤝 Mentorship requested: ${mentee.username} -> ${mentor.username}`);

    return { success: true, mentorshipRequest };
  }

  generateMentorshipId() {
    return 'mentorship_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async acceptMentorship(mentorshipId, mentorId) {
    const mentorship = this.mentorships.get(mentorshipId);
    
    if (!mentorship) {
      throw new Error('Mentorship request not found');
    }

    if (mentorship.mentorId !== mentorId) {
      throw new Error('Unauthorized');
    }

    if (mentorship.status !== 'pending') {
      throw new Error('Request already processed');
    }

    mentorship.status = 'accepted';
    mentorship.acceptedAt = Date.now();

    // Add to profiles
    const menteeProfile = this.athletes.get(mentorship.menteeId);
    const mentorProfile = this.coaches.get(mentorship.mentorId);

    if (menteeProfile) {
      menteeProfile.social.mentors.add(mentorId);
    }
    
    if (mentorProfile) {
      mentorProfile.athletes.add(mentorship.menteeId);
    }

    // Send notification to mentee
    await this.sendNotification(mentorship.menteeId, {
      type: 'mentorship_accepted',
      title: 'Mentorship request accepted!',
      message: 'Your mentor has accepted your request. Start your journey together!',
      fromUserId: mentorId,
      mentorshipId: mentorshipId,
      timestamp: Date.now()
    });

    console.log(`✅ Mentorship accepted: ${mentorshipId}`);

    return { success: true, mentorship };
  }

  // Challenges and competitions
  async createChallenge(creatorId, challengeData) {
    const creator = this.users.get(creatorId);
    if (!creator) {
      throw new Error('User not found');
    }

    const challenge = {
      id: this.generateChallengeId(),
      creatorId,
      title: challengeData.title,
      description: challengeData.description,
      sport: challengeData.sport,
      type: challengeData.type, // 'performance', 'skill', 'fitness', 'knowledge'
      category: challengeData.category,
      difficulty: challengeData.difficulty, // 'beginner', 'intermediate', 'advanced', 'expert'
      duration: challengeData.duration, // Duration in days
      startDate: challengeData.startDate || Date.now(),
      endDate: challengeData.endDate || (Date.now() + (challengeData.duration * 24 * 60 * 60 * 1000)),
      requirements: challengeData.requirements || [],
      rewards: challengeData.rewards || [],
      participants: new Map(),
      submissions: new Map(),
      leaderboard: [],
      rules: challengeData.rules || [],
      status: 'open', // 'open', 'active', 'completed', 'cancelled'
      maxParticipants: challengeData.maxParticipants || 100,
      isPublic: challengeData.isPublic !== false,
      createdAt: Date.now()
    };

    this.challenges.set(challenge.id, challenge);

    console.log(`🏆 Challenge created: ${challenge.title} by ${creator.username}`);

    return { success: true, challenge };
  }

  generateChallengeId() {
    return 'challenge_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async joinChallenge(userId, challengeId) {
    const user = this.users.get(userId);
    const challenge = this.challenges.get(challengeId);

    if (!user || !challenge) {
      throw new Error('User or challenge not found');
    }

    if (challenge.status !== 'open' && challenge.status !== 'active') {
      throw new Error('Challenge is not accepting participants');
    }

    if (challenge.participants.has(userId)) {
      return { success: false, message: 'Already participating' };
    }

    if (challenge.participants.size >= challenge.maxParticipants) {
      throw new Error('Challenge is full');
    }

    const participation = {
      userId,
      joinedAt: Date.now(),
      progress: 0,
      submissions: [],
      score: 0,
      status: 'active' // 'active', 'completed', 'dropped'
    };

    challenge.participants.set(userId, participation);

    // Award experience points
    user.experience += 15;

    console.log(`🎯 ${user.username} joined challenge: ${challenge.title}`);

    return { success: true, participation };
  }

  // Notifications system
  async sendNotification(userId, notification) {
    const user = this.users.get(userId);
    if (!user) return false;

    let userNotifications = this.notifications.get(userId);
    if (!userNotifications) {
      userNotifications = [];
      this.notifications.set(userId, userNotifications);
    }

    const fullNotification = {
      id: this.generateNotificationId(),
      ...notification,
      read: false,
      createdAt: Date.now()
    };

    userNotifications.unshift(fullNotification);

    // Keep only last 100 notifications
    if (userNotifications.length > 100) {
      userNotifications = userNotifications.slice(0, 100);
      this.notifications.set(userId, userNotifications);
    }

    console.log(`🔔 Notification sent to ${user.username}: ${notification.title}`);

    return true;
  }

  generateNotificationId() {
    return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async getNotifications(userId, options = {}) {
    const { limit = 20, offset = 0, unreadOnly = false } = options;
    
    let userNotifications = this.notifications.get(userId) || [];
    
    if (unreadOnly) {
      userNotifications = userNotifications.filter(n => !n.read);
    }

    const notifications = userNotifications.slice(offset, offset + limit);
    const unreadCount = userNotifications.filter(n => !n.read).length;

    return { notifications, unreadCount, hasMore: notifications.length === limit };
  }

  async markNotificationAsRead(userId, notificationId) {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return false;

    const notification = userNotifications.find(n => n.id === notificationId);
    if (!notification) return false;

    notification.read = true;
    return true;
  }

  // Analytics and insights
  updateCommunityHealth() {
    const totalUsers = this.users.size;
    const activeUsers = this.onlineUsers.size;
    
    // Calculate engagement metrics
    let totalEngagement = 0;
    let totalPosts = 0;
    
    for (const post of this.posts.values()) {
      const engagement = post.engagement.likes.size + post.engagement.comments.length * 2 + post.engagement.shares.size * 3;
      totalEngagement += engagement;
      totalPosts++;
    }

    const avgEngagement = totalPosts > 0 ? totalEngagement / totalPosts : 0;
    const reportCount = this.reportedContent.size;
    const reportRate = totalPosts > 0 ? reportCount / totalPosts : 0;

    this.communityHealth = {
      activeUsers,
      totalUsers,
      contentQuality: Math.max(0, 1 - reportRate * 10), // Quality decreases with reports
      engagementRate: Math.min(1, avgEngagement / 10), // Normalize to 0-1
      reportRate,
      onlinePercentage: totalUsers > 0 ? activeUsers / totalUsers : 0
    };
  }

  updateOnlineUsers() {
    // Simulate online user updates (in production, this would be real-time)
    const currentTime = Date.now();
    
    for (const [userId, user] of this.users) {
      // Consider user online if last active within 5 minutes
      if (currentTime - user.lastActive < 5 * 60 * 1000) {
        this.onlineUsers.add(userId);
      } else {
        this.onlineUsers.delete(userId);
      }
    }
  }

  updateEngagementMetrics() {
    for (const [communityId, community] of this.groups) {
      const recentPosts = community.posts
        .slice(0, 10) // Last 10 posts
        .map(postId => this.posts.get(postId))
        .filter(Boolean);

      if (recentPosts.length === 0) continue;

      const totalEngagement = recentPosts.reduce((sum, post) => {
        return sum + post.engagement.likes.size + post.engagement.comments.length + post.engagement.shares.size;
      }, 0);

      const avgEngagement = totalEngagement / recentPosts.length;
      const engagementRate = Math.min(1, avgEngagement / community.members.size);

      community.stats.engagementRate = engagementRate;

      // Determine activity level
      if (engagementRate > 0.3) {
        community.stats.activityLevel = 'high';
      } else if (engagementRate > 0.1) {
        community.stats.activityLevel = 'medium';
      } else {
        community.stats.activityLevel = 'low';
      }

      this.engagementMetrics.set(communityId, {
        engagementRate,
        avgEngagement,
        totalEngagement,
        postsAnalyzed: recentPosts.length,
        timestamp: Date.now()
      });
    }
  }

  processNotifications() {
    // Process pending notifications, cleanup old ones, etc.
    const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
    
    for (const [userId, notifications] of this.notifications) {
      const filteredNotifications = notifications.filter(n => n.createdAt > cutoffTime);
      
      if (filteredNotifications.length !== notifications.length) {
        this.notifications.set(userId, filteredNotifications);
      }
    }
  }

  moderateContent() {
    // Process moderation queue
    if (this.moderationQueue.length === 0) return;

    const postId = this.moderationQueue.shift();
    const post = this.posts.get(postId);

    if (!post) return;

    // Simplified auto-moderation logic
    const highRiskFlags = ['harassment', 'inappropriate_media'];
    const hasHighRiskFlags = post.moderation.flags.some(flag => highRiskFlags.includes(flag));

    if (hasHighRiskFlags) {
      // Auto-remove high-risk content
      post.moderation.status = 'removed';
      post.moderation.reviewedBy = 'system';
      post.moderation.reviewedAt = Date.now();
      
      console.log(`🚫 Auto-removed post: ${postId} (${post.moderation.flags.join(', ')})`);
    } else {
      // Flag for human review
      post.moderation.status = 'flagged';
      console.log(`⚠️ Flagged for review: ${postId}`);
    }
  }

  // Helper methods
  sanitizePostData(post) {
    return {
      ...post,
      engagement: {
        ...post.engagement,
        likes: Array.from(post.engagement.likes),
        shares: Array.from(post.engagement.shares)
      }
    };
  }

  sanitizeCommunityData(community) {
    return {
      ...community,
      members: Array.from(community.members),
      moderators: Array.from(community.moderators)
    };
  }

  // Public API methods
  async getUserProfile(userId) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const profile = this.sanitizeUserData(user);
    const communities = this.getUserCommunities(userId);
    const recentPosts = Array.from(this.posts.values())
      .filter(post => post.authorId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(post => this.sanitizePostData(post));

    return { profile, communities, recentPosts };
  }

  async searchUsers(query, options = {}) {
    const { sport, userType, limit = 20 } = options;
    
    const results = Array.from(this.users.values())
      .filter(user => {
        // Text search
        const matchesQuery = !query || 
          user.displayName.toLowerCase().includes(query.toLowerCase()) ||
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          (user.bio && user.bio.toLowerCase().includes(query.toLowerCase()));

        // Filters
        const matchesSport = !sport || user.sport === sport || user.sport === 'multi';
        const matchesType = !userType || user.userType === userType;

        return matchesQuery && matchesSport && matchesType;
      })
      .slice(0, limit)
      .map(user => this.sanitizeUserData(user));

    return { users: results, hasMore: results.length === limit };
  }

  async getCommunityList(options = {}) {
    const { sport, type, limit = 20 } = options;
    
    const results = Array.from(this.groups.values())
      .filter(community => {
        const matchesSport = !sport || community.sport === sport || community.sport === 'multi';
        const matchesType = !type || community.type === type;
        
        return matchesSport && matchesType && community.settings.isPublic;
      })
      .sort((a, b) => b.stats.memberCount - a.stats.memberCount)
      .slice(0, limit)
      .map(community => this.sanitizeCommunityData(community));

    return { communities: results, hasMore: results.length === limit };
  }

  getSystemStats() {
    return {
      users: {
        total: this.users.size,
        online: this.onlineUsers.size,
        athletes: this.athletes.size,
        coaches: this.coaches.size
      },
      content: {
        posts: this.posts.size,
        comments: this.comments.size,
        communities: this.groups.size
      },
      engagement: {
        totalLikes: Array.from(this.posts.values()).reduce((sum, post) => sum + post.engagement.likes.size, 0),
        totalComments: Array.from(this.posts.values()).reduce((sum, post) => sum + post.engagement.comments.length, 0),
        avgEngagementRate: this.communityHealth.engagementRate
      },
      moderation: {
        flaggedPosts: this.moderationQueue.length,
        reportedContent: this.reportedContent.size,
        suspendedUsers: this.suspendedUsers.size
      },
      health: this.communityHealth
    };
  }

  // Cleanup
  destroy() {
    this.users.clear();
    this.athletes.clear();
    this.coaches.clear();
    this.teams.clear();
    this.posts.clear();
    this.comments.clear();
    this.groups.clear();
    this.challenges.clear();
    this.mentorships.clear();
    this.notifications.clear();
    
    console.log('🌐 Social Community Platform destroyed');
  }
}

// Export for both Node.js and browser environments  
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BlazeSocialCommunity };
} else if (typeof window !== 'undefined') {
  window.BlazeSocialCommunity = BlazeSocialCommunity;
}

/**
 * Usage Examples:
 * 
 * // Initialize social community platform
 * const socialPlatform = new BlazeSocialCommunity({
 *   maxCommunitySize: 10000,
 *   contentModeration: true,
 *   enableMentorship: true,
 *   sport: 'multi'
 * });
 * 
 * // Register new user
 * const newUser = await socialPlatform.registerUser({
 *   username: 'athlete123',
 *   email: 'athlete@example.com',
 *   displayName: 'John Smith',
 *   userType: 'athlete',
 *   sport: 'baseball',
 *   team: 'Cardinals',
 *   age: 22
 * });
 * 
 * // Create a post
 * const post = await socialPlatform.createPost(userId, {
 *   text: 'Great practice session today! Improved my batting average.',
 *   type: 'achievement',
 *   communityId: 'cardinals_baseball',
 *   stats: { battingAverage: 0.285 }
 * });
 * 
 * // Join community
 * await socialPlatform.joinCommunity(userId, 'athlete_development');
 * 
 * // Get personalized feed
 * const feed = await socialPlatform.getFeedForUser(userId, { limit: 20 });
 * 
 * // Request mentorship
 * await socialPlatform.requestMentorship(athleteId, coachId, 'I would like to improve my pitching technique');
 * 
 * // Create challenge
 * const challenge = await socialPlatform.createChallenge(coachId, {
 *   title: '30-Day Batting Improvement Challenge',
 *   sport: 'baseball',
 *   type: 'skill',
 *   duration: 30,
 *   description: 'Improve your batting average through daily practice'
 * });
 */