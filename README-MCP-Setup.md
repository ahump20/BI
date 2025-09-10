# 🔥 Blaze Intelligence MCP Server & Zapier Integration

## Quick Start

```bash
# Run the automated setup script
./mcp-setup.sh
```

## Manual Configuration Steps

### 1. Claude Desktop Configuration

Copy the configuration file to your Claude config directory:

**macOS:**
```bash
cp claude_desktop_config.json ~/.config/claude/claude_desktop_config.json
# or
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Linux:**
```bash
cp claude_desktop_config.json ~/.config/claude/claude_desktop_config.json
```

### 2. Environment Variables Setup

1. Copy the environment template:
```bash
cd mcp-server
cp .env.example .env
```

2. Edit `.env` with your actual API keys and configuration:
```bash
nano .env
```

### 3. Zapier Webhook Configuration

#### Email Notifications
1. Go to [Zapier Email Webhook Integration](https://zapier.com/apps/email/integrations/webhook)
2. Create: **Webhook → Email** trigger
3. Copy webhook URL to `ZAPIER_EMAIL_WEBHOOK` in `.env`

#### Slack Alerts  
1. Go to [Zapier Slack Webhook Integration](https://zapier.com/apps/slack/integrations/webhook)
2. Create: **Webhook → Slack** trigger
3. Copy webhook URL to `ZAPIER_SLACK_WEBHOOK` in `.env`

#### Google Sheets Sync
1. Go to [Zapier Google Sheets Webhook Integration](https://zapier.com/apps/google-sheets/integrations/webhook)
2. Create: **Webhook → Google Sheets** trigger
3. Copy webhook URL to `ZAPIER_SHEETS_WEBHOOK` in `.env`

#### Airtable Sync
1. Go to [Zapier Airtable Webhook Integration](https://zapier.com/apps/airtable/integrations/webhook)
2. Create: **Webhook → Airtable** trigger
3. Copy webhook URL to `ZAPIER_AIRTABLE_WEBHOOK` in `.env`

#### Zapier NLA API Key
1. Visit [Zapier Developer API](https://zapier.com/developer/public-api)
2. Generate API key
3. Add to `ZAPIER_NLA_API_KEY` in `.env`

### 4. Analytics Integration Setup

#### Google Analytics
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Analytics Reporting API
3. Add key to `GOOGLE_ANALYTICS_API_KEY` in `.env`

#### Airtable
1. Get API key from [Airtable Developers](https://airtable.com/developers/web/api/introduction)
2. Add to `AIRTABLE_API_KEY` in `.env`
3. Add your base ID to `AIRTABLE_BASE_ID` in `.env`

#### Replit Integration
1. Get token from Replit account settings
2. Add to `REPLIT_TOKEN` in `.env`

## MCP Server Architecture

### Main MCP Server (`index.ts`)
- **Portfolio Analytics**: Real-time metrics and insights
- **AI Model Management**: Multi-provider AI integration
- **Project Management**: Dynamic project generation
- **Security Services**: Authentication and monitoring

### Analytics Tools Server (`analytics-tools.ts`)
- **Zapier Workflows**: Automated triggers and actions
- **External Analytics**: Google Analytics, Airtable sync
- **Replit Monitoring**: Development environment tracking
- **Health Checks**: Comprehensive system monitoring

## Available MCP Tools

### Zapier Integration Tools
- `zapier_trigger_workflow` - Trigger automated workflows
- `create_automation_workflow` - Create new automation sequences
- `portfolio_health_check` - Monitor infrastructure health

### Analytics Tools
- `fetch_google_analytics` - Pull GA metrics and insights
- `sync_airtable_data` - Bi-directional Airtable sync
- `monitor_replit_projects` - Track development environments

### Core Portfolio Tools
- `track_interaction` - Log user interactions
- `generate_ai_response` - Multi-model AI responses
- `generate_project_idea` - AI-powered project ideation
- `analyze_portfolio_performance` - Performance analytics
- `security_audit` - Security assessment
- `export_analytics` - Data export in multiple formats

## Starting the Servers

### Development Mode
```bash
cd mcp-server
npm run dev          # Main MCP server with hot reload
npm run dev:analytics # Analytics tools server with hot reload
```

### Production Mode
```bash
npm run build        # Compile TypeScript
npm run start        # Start main MCP server
npm run start:analytics # Start analytics tools server
```

## Testing MCP Connection

1. **MCP Inspector**: 
```bash
mcp-inspector blaze-intelligence
```

2. **Claude Desktop**: 
   - Restart Claude Desktop
   - Check for MCP server connections in settings
   - Test tools in chat interface

3. **Direct Testing**:
```bash
./test-mcp.sh
```

## Zapier Workflow Examples

### 1. Portfolio Alert System
**Trigger**: High traffic spike detected
**Actions**:
- Send Slack notification to team
- Log event in Google Sheets
- Create Airtable record for analysis

### 2. AI Interaction Monitoring
**Trigger**: AI usage threshold reached
**Actions**:
- Send email summary report
- Update analytics dashboard
- Create performance insights

### 3. Project Deployment Notifications
**Trigger**: Replit project updated
**Actions**:
- Notify via Slack
- Update project status in Airtable
- Log deployment metrics

## Advanced Configuration

### Custom Zapier Workflows
Create custom automation sequences:

```javascript
// Example: Custom workflow for portfolio monitoring
{
  "workflow_name": "portfolio_monitoring",
  "trigger": {
    "type": "metric_threshold",
    "config": {
      "metric": "response_time",
      "threshold": 5000,
      "operator": "greater_than"
    }
  },
  "actions": [
    {
      "tool": "zapier_trigger_workflow",
      "parameters": {
        "workflow_name": "slack-alerts",
        "payload": {
          "alert_type": "performance",
          "message": "Portfolio response time exceeded threshold"
        }
      }
    }
  ]
}
```

### Database Configuration
The MCP server uses SQLite by default. For production:

1. **PostgreSQL**: Update `DATABASE_URL` in `.env`
2. **Redis**: Configure `REDIS_URL` for caching
3. **Backup Strategy**: Set up automated backups

### Security Configuration
- **JWT Secrets**: Generate secure JWT tokens
- **API Keys**: Rotate regularly and store securely
- **Rate Limiting**: Configure appropriate limits
- **HTTPS**: Enable for production deployments

## Monitoring & Debugging

### Logs
```bash
# View server logs
tail -f logs/blaze-mcp.log

# View analytics logs  
tail -f logs/analytics-tools.log
```

### Health Checks
```bash
# Check server health
curl http://localhost:3000/health

# Check analytics tools health
curl http://localhost:3001/health
```

### Performance Monitoring
- **Response Times**: Monitor API response times
- **Error Rates**: Track and alert on errors
- **Resource Usage**: Monitor CPU, memory, disk
- **Database Performance**: Query optimization

## Troubleshooting

### Common Issues

1. **MCP Server Not Connecting**
   - Check Claude Desktop configuration
   - Verify file paths in config
   - Restart Claude Desktop

2. **Zapier Webhooks Not Working**
   - Verify webhook URLs in `.env`
   - Check Zapier zap configuration
   - Test webhook endpoints manually

3. **Analytics Data Not Syncing**
   - Verify API keys and permissions
   - Check rate limits
   - Review error logs

4. **Build Errors**
   - Check Node.js version (>=18)
   - Clear `node_modules` and reinstall
   - Verify TypeScript configuration

### Support Resources
- [MCP Documentation](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [Zapier Developer Docs](https://zapier.com/developer/documentation/v2/)
- [GitHub Issues](https://github.com/ahump20/blaze-intelligence-mcp/issues)

## License
MIT License - see LICENSE file for details.

---

**Ready to weaponize your portfolio with championship-level automation! 🏆**