# Pre-Deployment Checklist

Complete this checklist before deploying to production.

## Security Checklist

- [ ] **Change default admin credentials** in production .env
- [ ] **Generate new JWT_SECRET** (use: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- [ ] **Update CORS origins** to allow only your production domain
- [ ] **Review all .env files** - ensure no sensitive data in .env.example
- [ ] **Check .gitignore** - ensure .env files are not committed
- [ ] **Enable HTTPS** - most platforms do this automatically
- [ ] **Set NODE_ENV=production** in production environment

## Code Checklist

- [ ] **Remove console.logs** from production code
- [ ] **Test all features locally** before deployment
- [ ] **Run linter** - `npm run lint` (if configured)
- [ ] **Check for unused dependencies**
- [ ] **Update package.json** versions if needed
- [ ] **Test database migrations** on a test database first

## Database Checklist

- [ ] **Backup local database** before testing migrations
- [ ] **Create production database** on hosting platform
- [ ] **Note down database credentials** securely
- [ ] **Test connection** from backend to database
- [ ] **Run migrations** after deployment
- [ ] **Verify admin user created** successfully

## Frontend Checklist

- [ ] **Update API URL** to production backend URL
- [ ] **Test production build** locally: `npm run build && npx serve -s build`
- [ ] **Check for console errors** in production build
- [ ] **Verify all routes work** in production mode
- [ ] **Test mobile responsiveness**
- [ ] **Optimize images** if any large files exist

## Backend Checklist

- [ ] **Set proper PORT** (usually provided by platform)
- [ ] **Configure database connection** with production credentials
- [ ] **Test all API endpoints** with production URLs
- [ ] **Verify CORS settings** allow frontend domain
- [ ] **Check error handling** returns proper status codes
- [ ] **Test authentication** (login/register/JWT)

## Git & Deployment Checklist

- [ ] **Create GitHub repository** (if not exists)
- [ ] **Push all code** to GitHub:
  ```bash
  git init
  git add .
  git commit -m "Initial commit for deployment"
  git remote add origin <your-repo-url>
  git push -u origin main
  ```
- [ ] **Create .gitignore** to exclude:
  - node_modules/
  - .env
  - .env.local
  - .env.production
  - build/
  - dist/
  - \*.log

## Post-Deployment Checklist

- [ ] **Access frontend URL** - check if site loads
- [ ] **Test admin login** with production credentials
- [ ] **Create a test user** through registration
- [ ] **Create a test store** as admin
- [ ] **Submit a test rating** as user
- [ ] **View store owner dashboard** with test data
- [ ] **Check browser console** for any errors
- [ ] **Test on different browsers** (Chrome, Firefox, Safari)
- [ ] **Test on mobile devices**
- [ ] **Monitor backend logs** for errors
- [ ] **Set up monitoring** (optional - use platform tools)

## Testing Commands

### Test Frontend Build Locally

```bash
cd frontend
npm run build
npx serve -s build
# Visit http://localhost:3000
```

### Test Backend Locally in Production Mode

```bash
cd backend
NODE_ENV=production npm start
# Test API at http://localhost:5000
```

### Generate Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Test Database Connection

```bash
cd backend
node -e "const pool = require('./src/config/database'); pool.query('SELECT NOW()', (err, res) => { console.log(err || res.rows[0]); pool.end(); })"
```

## Common Issues & Solutions

### Issue: Frontend can't connect to backend

**Solution**:

- Check CORS settings in backend
- Verify API_BASE_URL in frontend/src/utils/api.js
- Check browser network tab for actual URLs being called

### Issue: Database connection timeout

**Solution**:

- Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
- Check if database service is running
- Ensure backend can reach database (firewall/security groups)

### Issue: 502 Bad Gateway

**Solution**:

- Backend service might be crashed
- Check backend logs
- Verify start command is correct
- Check PORT environment variable

### Issue: Static files not loading

**Solution**:

- Verify build command completed successfully
- Check publish/output directory is correct
- Look for errors in build logs

## Environment Variables Reference

### Backend (.env)

```bash
NODE_ENV=production
PORT=5000
DB_HOST=<database-host>
DB_PORT=5432
DB_NAME=store_rating_db
DB_USER=<db-user>
DB_PASSWORD=<db-password>
JWT_SECRET=<64-char-random-string>
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<secure-password>
```

### Frontend (.env.production)

```bash
REACT_APP_API_URL=https://your-backend-url.com/api
```

## Monitoring After Deployment

### Week 1

- [ ] Check logs daily for errors
- [ ] Monitor response times
- [ ] Check database usage
- [ ] Test all features
- [ ] Collect user feedback

### Ongoing

- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Review error logs weekly
- [ ] Monitor database size
- [ ] Keep dependencies updated
- [ ] Regular security audits

## Rollback Plan

If deployment fails:

1. **Keep previous version running** (don't delete old deployment)
2. **Document the issue** - save error logs
3. **Revert changes** in Git:
   ```bash
   git revert HEAD
   git push origin main
   ```
4. **Or rollback on platform** (Render/Railway have rollback features)

## Support Resources

- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **React Deployment**: https://create-react-app.dev/docs/deployment
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

---

✅ **Once all checkboxes are complete, you're ready to deploy!**

Refer to `DEPLOYMENT_GUIDE.md` for platform-specific deployment instructions.
