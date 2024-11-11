Module 1 - Fluid support
Go to tsconfig.json, change line 15 to: "@lab/*": ["mod1/*"],
Go to webpack.config.cjs, change line 50 to: "@lab": path.resolve(__dirname, "src/mod1"),
Restart app
Go to index.tsx, 
- comment in line 65 and comment out line 61
- comment in lines 166-182
Go to hr_app.tsx, comment out lines 26-27, comment in lines 21-22

Go to jobsListView.tsx, comment in line 19 and line 118
Go to candidateListView.tsx, comment in lines 20-21 and line 126
Go to onSitePlanView.tsx, comment in lines 16-18
Go to interviewPoolView.tsx, comment in line 54
Go to availabilityView.tsx comment in line 8

Module 2 - Presence support
Go to tsconfig.json, change line 15 to: "@lab/*": ["mod2/*"],
Go to webpack.config.cjs, change line 50 to: "@lab": path.resolve(__dirname, "src/mod2"),
Restart app
Go to index.tsx, comment in lines 186-192, surrounded by START MOD_2 block

Inspect hr_app.tsx line 96 for the AppPresenceGroup (lines 165-199)
Inspect candidatesListView.tsx for listening to remote updates, setting local state and the avatarGroupView
Inspect jobsListView.tsx for listening to remote updates, setting local state and the avatarGroupView

Module 3 - AI Support
Go to tsconfig.json, change line 15 to: "@lab/*": ["mod3/*"],
Go to webpack.config.cjs, change line 50 to: "@lab": path.resolve(__dirname, "src/mod3"),
Restart app
Go to hr_app.tsx, comment in lines 75-82, surrounded by the START MOD_3 block