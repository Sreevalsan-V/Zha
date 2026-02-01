# PROJECT CLEANUP & PROFESSIONALIZATION PROMPT

Use this prompt when you need to clean up and professionalize a Copilot-assisted project.

---

## 🎯 THE PROMPT

Copy and paste this into Copilot:

```
Streamline and professionalize this project:

1. **CLEANUP**
   - Remove redundant/unused files (old versions, duplicates, temp files)
   - Remove deprecated code and commented-out blocks
   - Consolidate similar files (e.g., v1/v2 → keep best version)
   - Delete old documentation files that are now outdated

2. **CODE QUALITY**
   - Rename files to remove version suffixes (_v2, _old, _backup)
   - Update all imports/requires to match renamed files
   - Remove duplicate imports and unused dependencies
   - Ensure consistent code style and formatting
   - Add missing error handling where needed

3. **DOCUMENTATION** (create in /docs folder)
   - README.md - Professional setup guide with quick start
   - docs/API.md - Complete API reference with examples
   - docs/ARCHITECTURE.md - System design with ASCII diagrams
   - docs/PROJECT_SUMMARY.md - What was built and why

4. **STRUCTURE**
   - Organize files into logical folders
   - Ensure consistent naming conventions
   - Verify all routes and controllers are properly connected
   - Test that the application still runs correctly

5. **VERIFICATION**
   - List final project structure
   - Run the application and test key endpoints
   - Confirm all features still work

Show me what files you'll remove/rename before making changes.
```

---

## 📝 CUSTOMIZATION OPTIONS

Add these based on your project type:

### For API/Backend Projects:
```
Also:
- Document all API endpoints with request/response examples
- Include authentication flow diagrams
- List environment variables needed
- Add curl/Postman examples for testing
```

### For Frontend Projects:
```
Also:
- Document component hierarchy
- Include state management flow
- List all routes/pages
- Add screenshots or wireframe references
```

### For Full-Stack Projects:
```
Also:
- Document frontend-backend communication
- Include deployment architecture
- List all services and their ports
- Add docker-compose or deployment configs
```

---

## 📁 DOCUMENTS TO MODIFY FOR ARCHITECTURE CHANGES

When you modify the architecture (add features, change flow, add endpoints):

| Change Type | Files to Update |
|-------------|-----------------|
| New API endpoint | `docs/API.md`, `README.md` (endpoints list) |
| New database table | `docs/ARCHITECTURE.md` (schema section) |
| New authentication flow | `docs/ARCHITECTURE.md`, `docs/API.md` |
| New file/folder structure | `docs/ARCHITECTURE.md`, `README.md` |
| New feature | `docs/PROJECT_SUMMARY.md`, `README.md` |
| New environment variable | `README.md`, `.env.example` |
| New dependency | `README.md` (prerequisites) |

### Quick Update Prompt:
```
I added [DESCRIBE CHANGE]. Update these docs:
- docs/API.md (if new endpoints)
- docs/ARCHITECTURE.md (if structural changes)
- README.md (if setup changes)
Keep changes minimal and consistent with existing style.
```

---

## 🔧 TIPS FOR BETTER PROMPTS

### 1. Be Specific About What to Keep
```
❌ "Clean up the project"
✅ "Remove old v1 files, keep v2 versions, rename to remove _v2 suffix"
```

### 2. Specify Your Tech Stack
```
❌ "Create documentation"
✅ "Create documentation for Node.js/Express backend with SQLite, include API examples using curl"
```

### 3. Ask for Confirmation Before Destructive Actions
```
"Show me the list of files you'll delete/rename before making changes"
"Explain what each removed file was for"
```

### 4. Include Verification Steps
```
"After cleanup, verify by:
1. Running npm install
2. Running npm run dev
3. Testing /api/health endpoint
4. Confirming login works"
```

### 5. Reference Existing Patterns
```
"Follow the same documentation style as docs/API.md"
"Use the same folder structure as the auth module"
```

### 6. Break Large Tasks into Phases
```
Phase 1: "Identify and list all redundant files without deleting"
Phase 2: "Remove files I approve from the list"
Phase 3: "Update all imports and test"
Phase 4: "Create documentation"
```

---

## 🚀 QUICK ONE-LINER PROMPTS

### Minimal Cleanup:
```
Remove unused files, consolidate v1/v2 versions keeping v2, update imports, verify it runs
```

### Documentation Only:
```
Create professional docs (README, API reference, architecture diagram) for this project without changing code
```

### Structure Check:
```
Analyze project structure, identify redundant/unused files, suggest cleanup plan but don't execute
```

### Post-Feature Update:
```
I added [FEATURE]. Update relevant docs to reflect this change. Keep updates minimal.
```

---

## ⚠️ COMMON PITFALLS TO AVOID

1. **Don't delete without listing first** - Always ask Copilot to show what it will delete
2. **Test after renames** - Import paths break easily
3. **Backup before major cleanup** - Or use git to track changes
4. **Check for hardcoded paths** - May break after file moves
5. **Verify package.json scripts** - Ensure they still point to correct files

---

## 📋 PROJECT CLEANUP CHECKLIST

Before running cleanup prompt:
- [ ] Commit current state to git
- [ ] Note which features must still work
- [ ] List any files that must NOT be deleted

After cleanup:
- [ ] `npm install` succeeds
- [ ] `npm run dev` starts server
- [ ] Core features work (login, main functions)
- [ ] Documentation is accurate
- [ ] No console errors

---

*Save this file for future project cleanups!*
