# Step 4: Run and Monitor Pipeline

## 4a) Commit Changes to the Main Branch to Trigger the Pipeline

The pipeline is configured to trigger automatically on pushes to the `main` branch:

```yaml
trigger:
  - main
```

### How to Trigger the Pipeline

1. **Make changes** to the project files (e.g., update `azure-pipelines.yml`, modify source code).

2. **Stage and commit** the changes:
   ```bash
   git add .
   git commit -m "ci: update pipeline configuration"
   ```

3. **Push the commit** to the `main` branch on GitHub:
   ```bash
   git push origin main
   ```

4. Since Azure DevOps is connected to the GitHub repository (`VishnupriyaDK240701603/Software-Construction`), the push to `main` will **automatically trigger** the pipeline run.

---

## 4b) Monitor the Logs in Azure DevOps Portal

### Accessing the Pipeline

1. Open the **Azure DevOps portal** at [dev.azure.com](https://dev.azure.com).
2. Navigate to your **Organization → Project → Pipelines**.
3. Click on the latest pipeline run to view its progress.

### Viewing Step Logs

4. Click on each step to expand and view the **detailed logs**:

   | Step | What to look for |
   |---|---|
   | **Set up Node.js** | Node.js version installed successfully |
   | **Install backend dependencies** | All npm packages resolved and installed |
   | **Install frontend dependencies** | All npm packages resolved and installed |
   | **Build frontend** | Vite build completes with bundle output |
   | **Run verification script** | Greeting message and Node.js version printed |

### Understanding the Output

5. The logs will show:

   - **✅ Success messages** — Each step completing with green checkmarks.
   - **❌ Error messages** — If any step fails, the error output will be highlighted in red, showing exactly what went wrong (e.g., missing dependencies, build errors).
   - **📋 Verification output** — The final step will display:
     ```
     🛒 Hello from Product Price Comparison System!
     Node version: v18.x.x
     Pipeline working successfully ✅
     ```

6. If all steps pass, the pipeline run will show a **green "Success"** status, confirming that the environment setup, dependency installation, build process, and verification script all ran smoothly.

### Troubleshooting Common Issues

| Issue | Cause | Fix |
|---|---|---|
| `npm install` fails | Missing or corrupt `package.json` | Verify `backend/package.json` and `frontend/package.json` exist |
| Build fails | Syntax error in source code | Check the error log and fix the reported file |
| Pipeline not triggered | Push was to a different branch | Ensure you push to `main` branch |
| Node.js version mismatch | Wrong `versionSpec` | Update `versionSpec` in `azure-pipelines.yml` |
