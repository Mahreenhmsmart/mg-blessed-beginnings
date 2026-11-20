import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import blogReducer from './slices/blogSlice';
import servicesReducer from './slices/servicesSlice';
import consultationReducer from './slices/consultationSlice';
import contactReducer from './slices/contactSlice';
import aiToolsReducer from './slices/aiToolsSlice';
import aiReducer from './slices/aiSlice';
import aiSettingsReducer from './slices/aiSettingsSlice';
import projectsReducer from './slices/projectsSlice';
import auditsReducer from './slices/auditsSlice';
import analysisReducer from './slices/analysisSlice';
import authReducer from './slices/authSlice';
import securityAuditReducer from './slices/securityAuditSlice';
import connectionReducer from './slices/connectionSlice';
import websiteIntelReducer from './slices/websiteIntelSlice';
import referralReducer from './slices/referralSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    blog: blogReducer,
    services: servicesReducer,
    consultation: consultationReducer,
    contact: contactReducer,
    aiTools: aiToolsReducer,
    ai: aiReducer,
    aiSettings: aiSettingsReducer,
    projects: projectsReducer,
    audits: auditsReducer,
    analysis: analysisReducer,
    auth: authReducer,
    securityAudit: securityAuditReducer,
    connection: connectionReducer,
    websiteIntel: websiteIntelReducer,
    referral: referralReducer,
    subscription: subscriptionReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
